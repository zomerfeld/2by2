import { todoItems, matrixSettings, type TodoItem, type InsertTodoItem, type MatrixSettings, type InsertMatrixSettings } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Todo Items
  getTodoItems(): Promise<TodoItem[]>;
  getTodoItem(id: number): Promise<TodoItem | undefined>;
  createTodoItem(item: InsertTodoItem): Promise<TodoItem>;
  updateTodoItem(id: number, updates: Partial<InsertTodoItem>): Promise<TodoItem | undefined>;
  deleteTodoItem(id: number): Promise<boolean>;
  
  // Matrix Settings
  getMatrixSettings(): Promise<MatrixSettings>;
  updateMatrixSettings(settings: Partial<InsertMatrixSettings>): Promise<MatrixSettings>;
}

export class DatabaseStorage implements IStorage {
  async getTodoItems(): Promise<TodoItem[]> {
    const items = await db.select().from(todoItems).orderBy(todoItems.number);
    return items;
  }

  async getTodoItem(id: number): Promise<TodoItem | undefined> {
    const [item] = await db.select().from(todoItems).where(eq(todoItems.id, id));
    return item || undefined;
  }

  async createTodoItem(insertItem: InsertTodoItem): Promise<TodoItem> {
    const [item] = await db
      .insert(todoItems)
      .values({
        ...insertItem,
        completed: insertItem.completed ?? false,
      })
      .returning();
    return item;
  }

  async updateTodoItem(id: number, updates: Partial<InsertTodoItem>): Promise<TodoItem | undefined> {
    const [updatedItem] = await db
      .update(todoItems)
      .set(updates)
      .where(eq(todoItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async deleteTodoItem(id: number): Promise<boolean> {
    const result = await db.delete(todoItems).where(eq(todoItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getMatrixSettings(): Promise<MatrixSettings> {
    const [settings] = await db.select().from(matrixSettings).limit(1);
    if (!settings) {
      // Create default settings if none exist
      const [newSettings] = await db
        .insert(matrixSettings)
        .values({
          xAxisLabel: "Impact",
          yAxisLabel: "Urgency",
        })
        .returning();
      return newSettings;
    }
    return settings;
  }

  async updateMatrixSettings(updates: Partial<InsertMatrixSettings>): Promise<MatrixSettings> {
    let [settings] = await db.select().from(matrixSettings).limit(1);
    
    if (!settings) {
      // Create if doesn't exist
      [settings] = await db
        .insert(matrixSettings)
        .values({
          xAxisLabel: updates.xAxisLabel || "Impact",
          yAxisLabel: updates.yAxisLabel || "Urgency",
        })
        .returning();
    } else {
      // Update existing
      [settings] = await db
        .update(matrixSettings)
        .set(updates)
        .where(eq(matrixSettings.id, settings.id))
        .returning();
    }
    
    return settings;
  }
}

export const storage = new DatabaseStorage();
