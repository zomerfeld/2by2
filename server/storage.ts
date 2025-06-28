import { todoItems, matrixSettings, type TodoItem, type InsertTodoItem, type MatrixSettings, type InsertMatrixSettings } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private todoItems: Map<number, TodoItem>;
  private matrixSettings: MatrixSettings;
  private currentTodoId: number;

  constructor() {
    this.todoItems = new Map();
    this.currentTodoId = 1;
    this.matrixSettings = {
      id: 1,
      xAxisLabel: "Impact",
      yAxisLabel: "Urgency",
    };
  }

  async getTodoItems(): Promise<TodoItem[]> {
    return Array.from(this.todoItems.values()).sort((a, b) => a.number - b.number);
  }

  async getTodoItem(id: number): Promise<TodoItem | undefined> {
    return this.todoItems.get(id);
  }

  async createTodoItem(insertItem: InsertTodoItem): Promise<TodoItem> {
    const id = this.currentTodoId++;
    const item: TodoItem = { ...insertItem, id };
    this.todoItems.set(id, item);
    return item;
  }

  async updateTodoItem(id: number, updates: Partial<InsertTodoItem>): Promise<TodoItem | undefined> {
    const item = this.todoItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates };
    this.todoItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteTodoItem(id: number): Promise<boolean> {
    return this.todoItems.delete(id);
  }

  async getMatrixSettings(): Promise<MatrixSettings> {
    return this.matrixSettings;
  }

  async updateMatrixSettings(settings: Partial<InsertMatrixSettings>): Promise<MatrixSettings> {
    this.matrixSettings = { ...this.matrixSettings, ...settings };
    return this.matrixSettings;
  }
}

export const storage = new MemStorage();
