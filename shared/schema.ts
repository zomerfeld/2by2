import { pgTable, text, serial, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const todoItems = pgTable("todo_items", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  number: integer("number").notNull(),
  positionX: real("position_x").default(null),
  positionY: real("position_y").default(null),
  quadrant: text("quadrant").default(null),
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
