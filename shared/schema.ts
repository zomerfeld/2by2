import { pgTable, text, serial, integer, real, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(), // JSON session data
  expire: timestamp("expire").notNull(),
});

// User storage table for authentication
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(), // User ID from auth provider
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  listId: text("list_id").notNull().unique(), // Keep as text for now, can migrate to UUID later
  userId: text("user_id"), // Optional user association for future auth
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  xAxisLabel: text("x_axis_label").notNull().default("Impact"),
  yAxisLabel: text("y_axis_label").notNull().default("Urgency"),
});

export const todoItems = pgTable("todo_items", {
  id: serial("id").primaryKey(),
  listId: text("list_id").notNull(), // Keep as text for compatibility
  text: text("text").notNull(),
  number: integer("number").notNull(),
  sortOrder: real("sort_order").notNull().default(0), // For reordering without changing numbers
  positionX: real("position_x"),
  positionY: real("position_y"),
  quadrant: text("quadrant"),
  completed: boolean("completed").notNull().default(false),
  lastPositionX: real("last_position_x"),
  lastPositionY: real("last_position_y"),
  lastQuadrant: text("last_quadrant"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Deprecated - keeping for backward compatibility during migration
export const matrixSettings = pgTable("matrix_settings", {
  id: serial("id").primaryKey(),
  xAxisLabel: text("x_axis_label").notNull().default("Impact"),
  yAxisLabel: text("y_axis_label").notNull().default("Urgency"),
});

export const insertListSchema = createInsertSchema(lists).omit({
  id: true,
  lastUpdated: true,
});

export const insertTodoItemSchema = z.object({
  text: z.string()
    .min(1, "Task description cannot be empty")
    .max(128, "Task description must be 128 characters or less")
    .trim()
    .refine(val => val.length > 0, "Task description cannot be only whitespace"),
  number: z.number().int().min(1).max(100).optional(),
  positionX: z.number().min(0).max(1).optional().nullable(),
  positionY: z.number().min(0).max(1).optional().nullable(),
  quadrant: z.string().optional().nullable(),
  completed: z.boolean().default(false),
  lastPositionX: z.number().min(0).max(1).optional().nullable(),
  lastPositionY: z.number().min(0).max(1).optional().nullable(),
  lastQuadrant: z.string().optional().nullable(),
});

export const insertMatrixSettingsSchema = createInsertSchema(matrixSettings).omit({
  id: true,
}).extend({
  xAxisLabel: z.string()
    .min(1, "X-axis label cannot be empty")
    .max(50, "X-axis label must be 50 characters or less")
    .trim()
    .refine(val => val.length > 0, "X-axis label cannot be only whitespace"),
  yAxisLabel: z.string()
    .min(1, "Y-axis label cannot be empty")
    .max(50, "Y-axis label must be 50 characters or less")
    .trim()
    .refine(val => val.length > 0, "Y-axis label cannot be only whitespace"),
});

// User schemas for authentication
export const upsertUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  profileImageUrl: z.string().url().optional(),
});

export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type List = typeof lists.$inferSelect;
export type InsertList = z.infer<typeof insertListSchema>;
export type TodoItem = typeof todoItems.$inferSelect;
export type InsertTodoItem = z.infer<typeof insertTodoItemSchema>;
export type MatrixSettings = typeof matrixSettings.$inferSelect;
export type InsertMatrixSettings = z.infer<typeof insertMatrixSettingsSchema>;
