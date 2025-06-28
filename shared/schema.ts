import { pgTable, text, serial, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const todoItems = pgTable("todo_items", {
  id: serial("id").primaryKey(),
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

export const matrixSettings = pgTable("matrix_settings", {
  id: serial("id").primaryKey(),
  xAxisLabel: text("x_axis_label").notNull().default("Impact"),
  yAxisLabel: text("y_axis_label").notNull().default("Urgency"),
});

export const insertTodoItemSchema = createInsertSchema(todoItems).omit({
  id: true,
});

export const insertMatrixSettingsSchema = createInsertSchema(matrixSettings).omit({
  id: true,
});

export type TodoItem = typeof todoItems.$inferSelect;
export type InsertTodoItem = z.infer<typeof insertTodoItemSchema>;
export type MatrixSettings = typeof matrixSettings.$inferSelect;
export type InsertMatrixSettings = z.infer<typeof insertMatrixSettingsSchema>;
