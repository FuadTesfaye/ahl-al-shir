import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { normalizeArabic, isAnswerAcceptable } from '../lib/arabic';
import { getScoreTier, generateShareText } from '../lib/scoring';
import { verifyPassword, hashPassword } from '../lib/auth';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function runTests() {
  console.log('🧪 Starting End-to-End Verification Tests...\n');

  // --- Test 1: Arabic Normalization & Fuzzy Matching ---
  console.log('1️⃣ Testing Arabic Normalization & Hemistich Matching:');
  const originalExpected = 'وَتَأتي عَلى قَدرِ الكِرامِ المَكارِمُ';
  const testCases = [
    { input: 'وتاتي على قدر الكرام المكارم', expected: true, label: 'بدون تشكيل وتوحيد همزة' },
    { input: 'وَتَأْتِي عَلَى قَدْرِ الْكِرَامِ الْمَكَارِمُ', expected: true, label: 'مع تشكيل كامل' },
    { input: 'وتأتي علي قدر الكرام المكارم', expected: true, label: 'ألف مقصورة وياء' },
    { input: 'وتأتي  على   قدر  الكرام  المكارم!؟', expected: true, label: 'مسافات وعلامات ترقيم' },
    { input: 'تأتي على قدر الكرام المكارم', expected: true, label: 'بدون حرف الواو (إجابة قريبة تحتسب صحيحة)' },
    { input: 'وتاتي قدر الكرام المكارم', expected: true, label: 'نقص حرف جر (إجابة قريبة تحتسب صحيحة)' },
    { input: 'وجاء الربيع الطلق يختال ضاحكا', expected: false, label: 'إجابة خاطئة تماماً' },
  ];

  for (const tc of testCases) {
    const res = isAnswerAcceptable(tc.input, originalExpected);
    const pass = res.isCorrect === tc.expected;
    console.log(`  ${pass ? '✅' : '❌'} [${tc.label}]: input="${tc.input}" -> isCorrect=${res.isCorrect} (similarity: ${(res.similarity * 100).toFixed(1)}%)`);
    if (!pass) throw new Error(`Test failed for: ${tc.label}`);
  }

  // --- Test 2: Database Poems Count ---
  console.log('\n2️⃣ Testing Database Poems Bank:');
  const allPoems = await db.select().from(schema.poems);
  console.log(`  ✅ Total Poems in Database: ${allPoems.length} (Expected: 100)`);
  if (allPoems.length !== 100) {
    throw new Error(`Expected 100 poems but found ${allPoems.length}`);
  }

  // --- Test 3: Game Creation & 20 Randomized Questions ---
  console.log('\n3️⃣ Testing Game Creation & Randomization:');
  const testUsername = '@tester_poet_' + Date.now();

  // Insert player
  const [player] = await db
    .insert(schema.players)
    .values({
      telegramUsername: testUsername,
      nickname: 'الشاعر التجريبي',
    })
    .returning();

  console.log(`  ✅ Created test player: ${player.telegramUsername} (ID: ${player.id})`);

  // Create game
  const [game] = await db
    .insert(schema.games)
    .values({
      playerId: player.id,
      score: 0,
      maxScore: 20,
      status: 'in_progress',
    })
    .returning();

  // Pick 20 distinct random poems
  const shuffledPoems = [...allPoems].sort(() => 0.5 - Math.random()).slice(0, 20);
  const questionRows = shuffledPoems.map((p, idx) => ({
    gameId: game.id,
    poemId: p.id,
    questionNumber: idx + 1,
    isCorrect: false,
    points: 0,
  }));
  await db.insert(schema.gameQuestions).values(questionRows);

  const gameQuestionsList = await db
    .select()
    .from(schema.gameQuestions)
    .where(eq(schema.gameQuestions.gameId, game.id));

  console.log(`  ✅ Generated game session ${game.id} with ${gameQuestionsList.length} questions`);
  if (gameQuestionsList.length !== 20) {
    throw new Error('Expected 20 questions in game session');
  }

  // --- Test 4: Simulating Player Answers & Scoring ---
  console.log('\n4️⃣ Testing Player Answer Submission & Scoring:');
  // Answer first 18 correctly, last 2 wrongly
  let totalScore = 0;
  for (let i = 0; i < 20; i++) {
    const q = gameQuestionsList[i];
    const poem = allPoems.find((p) => p.id === q.poemId)!;
    const isCorrectAnswer = i < 18;
    const typedAnswer = isCorrectAnswer ? normalizeArabic(poem.answer) : 'إجابة غير صحيحة';
    const evalResult = isAnswerAcceptable(typedAnswer, poem.answer);
    const pts = evalResult.isCorrect ? 1 : 0;
    totalScore += pts;

    await db
      .update(schema.gameQuestions)
      .set({
        userAnswer: typedAnswer,
        isCorrect: evalResult.isCorrect,
        points: pts,
        answeredAt: new Date(),
      })
      .where(eq(schema.gameQuestions.id, q.id));
  }

  await db
    .update(schema.games)
    .set({
      score: totalScore,
      status: 'completed',
      completedAt: new Date(),
    })
    .where(eq(schema.games.id, game.id));

  const [finishedGame] = await db
    .select()
    .from(schema.games)
    .where(eq(schema.games.id, game.id));

  console.log(`  ✅ Player completed 20 questions. Final Score: ${finishedGame.score} / 20`);
  if (finishedGame.score !== 18) {
    throw new Error(`Expected score 18, got ${finishedGame.score}`);
  }

  const tier = getScoreTier(finishedGame.score, 20);
  console.log(`  ✅ Assigned Tier: ${tier.title} (${tier.badge})`);

  // --- Test 5: Admin Manual Grading & Score Recalculation ---
  console.log('\n5️⃣ Testing Admin Manual Grading & Winner Selection:');
  // Admin reviews Question #19 (which was marked wrong) and awards 1 point
  const targetQuestion = gameQuestionsList[18];
  await db
    .update(schema.gameQuestions)
    .set({
      isCorrect: true,
      points: 1,
      adminGraded: true,
    })
    .where(eq(schema.gameQuestions.id, targetQuestion.id));

  // Recalculate
  const allUpdatedQ = await db
    .select()
    .from(schema.gameQuestions)
    .where(eq(schema.gameQuestions.gameId, game.id));

  const recalculatedScore = allUpdatedQ.reduce((acc, curr) => acc + curr.points, 0);

  await db
    .update(schema.games)
    .set({
      score: recalculatedScore,
      isReviewed: true,
      isWinner: true, // Admin crowns as winner!
      adminNotes: 'إجابة المتسابق مقبولة في السؤال 19 ومستواه رفيع',
    })
    .where(eq(schema.games.id, game.id));

  const [gradedGame] = await db
    .select()
    .from(schema.games)
    .where(eq(schema.games.id, game.id));

  console.log(`  ✅ Admin manual grade saved. New Score: ${gradedGame.score}/20, Reviewed: ${gradedGame.isReviewed}, Winner: ${gradedGame.isWinner}`);
  if (gradedGame.score !== 19 || !gradedGame.isWinner || !gradedGame.isReviewed) {
    throw new Error('Admin grading or winner assignment failed');
  }

  // --- Test 6: Admin Delegation ---
  console.log('\n6️⃣ Testing Admin User Management & Password Verification:');
  const adminTestPass = 'admin123';
  const [adminUser] = await db
    .select()
    .from(schema.admins)
    .where(eq(schema.admins.username, 'admin'));

  const isPassValid = verifyPassword(adminTestPass, adminUser.passwordHash);
  console.log(`  ✅ Default admin "admin" password verification: ${isPassValid ? 'PASSED' : 'FAILED'}`);
  if (!isPassValid) {
    throw new Error('Default admin password validation failed');
  }

  console.log('\n🎉 ALL TESTS PASSED CLEANLY AND SUCCESSFULLY!\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
