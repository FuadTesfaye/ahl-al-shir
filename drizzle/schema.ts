import { pgTable, serial, text, varchar, integer, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const poems = pgTable('poems', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  poet: text('poet').notNull(),
  era: varchar('era', { length: 64 }).notNull().default('العصر الكلاسيكي'),
  firstLine: text('first_line').notNull(),
  answer: text('answer').notNull(),
  normalizedAnswer: text('normalized_answer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  telegramUsername: varchar('telegram_username', { length: 128 }).notNull().unique(),
  nickname: varchar('nickname', { length: 128 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  playerId: integer('player_id').references(() => players.id, { onDelete: 'cascade' }).notNull(),
  score: integer('score').default(0).notNull(),
  maxScore: integer('max_score').default(20).notNull(),
  status: varchar('status', { length: 32 }).default('in_progress').notNull(),
  isReviewed: boolean('is_reviewed').default(false).notNull(),
  isWinner: boolean('is_winner').default(false).notNull(),
  adminNotes: text('admin_notes'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const gameQuestions = pgTable('game_questions', {
  id: serial('id').primaryKey(),
  gameId: uuid('game_id').references(() => games.id, { onDelete: 'cascade' }).notNull(),
  poemId: integer('poem_id').references(() => poems.id, { onDelete: 'cascade' }).notNull(),
  questionNumber: integer('question_number').notNull(),
  userAnswer: text('user_answer'),
  isCorrect: boolean('is_correct').default(false).notNull(),
  points: integer('points').default(0).notNull(),
  adminGraded: boolean('admin_graded').default(false).notNull(),
  answeredAt: timestamp('answered_at'),
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 64 }).notNull().unique(),
  email: varchar('email', { length: 128 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 32 }).default('admin').notNull(), // 'super_admin' | 'admin'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const playersRelations = relations(players, ({ many }) => ({
  games: many(games),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  player: one(players, {
    fields: [games.playerId],
    references: [players.id],
  }),
  questions: many(gameQuestions),
}));

export const gameQuestionsRelations = relations(gameQuestions, ({ one }) => ({
  game: one(games, {
    fields: [gameQuestions.gameId],
    references: [games.id],
  }),
  poem: one(poems, {
    fields: [gameQuestions.poemId],
    references: [poems.id],
  }),
}));
