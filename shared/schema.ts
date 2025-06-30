import { pgTable, text, serial, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  listId: text("list_id").notNull().unique(), // URL-safe unique identifier
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  xAxisLabel: text("x_axis_label").notNull().default("Impact"),
  yAxisLabel: text("y_axis_label").notNull().default("Urgency"),
});

export const todoItems = pgTable("todo_items", {
  id: serial("id").primaryKey(),
  listId: text("list_id").notNull(),
  text: text("text").notNull(),
  number: integer("number").notNull(),
  positionX: real("position_x"),
  positionY: real("position_y"),
  quadrant: text("quadrant"),
  completed: boolean("completed").notNull().default(false),
  lastPositionX: real("last_position_x"),
  lastPositionY: real("last_position_y"),
  lastQuadrant: text("last_quadrant"),
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

export const insertTodoItemSchema = createInsertSchema(todoItems).omit({
  id: true,
  listId: true,
}).partial({
  number: true,
}).extend({
  text: z.string().max(128, "Task description must be 128 characters or less"),
});

export const insertMatrixSettingsSchema = createInsertSchema(matrixSettings).omit({
  id: true,
});

export type List = typeof lists.$inferSelect;
export type InsertList = z.infer<typeof insertListSchema>;
export type TodoItem = typeof todoItems.$inferSelect;
export type InsertTodoItem = z.infer<typeof insertTodoItemSchema>;
export type MatrixSettings = typeof matrixSettings.$inferSelect;
export type InsertMatrixSettings = z.infer<typeof insertMatrixSettingsSchema>;
