import { type TodoItem, type InsertTodoItem, type MatrixSettings, type InsertMatrixSettings } from "@shared/schema";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data.json");
const TEMPLATE_FILE = path.join(process.cwd(), "data.template.json");

interface StorageData {
  todoItems: TodoItem[];
  matrixSettings: MatrixSettings;
  nextId: number;
}

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

export class FileStorage implements IStorage {
  private async loadData(): Promise<StorageData> {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Try to copy from template file, otherwise use default data
      try {
        const templateData = await fs.readFile(TEMPLATE_FILE, 'utf-8');
        const parsedTemplate = JSON.parse(templateData);
        await this.saveData(parsedTemplate);
        return parsedTemplate;
      } catch (templateError) {
        // Fallback to default data if template doesn't exist
        const defaultData: StorageData = {
          todoItems: [],
          matrixSettings: {
            id: 1,
            xAxisLabel: "Impact",
            yAxisLabel: "Urgency",
          },
          nextId: 1,
        };
        await this.saveData(defaultData);
        return defaultData;
      }
    }
  }

  private async saveData(data: StorageData): Promise<void> {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  }

  private getNextAvailableNumber(todoItems: TodoItem[]): number {
    // Get all active (non-completed) item numbers
    const usedNumbers = todoItems
      .filter(item => !item.completed)
      .map(item => item.number)
      .sort((a, b) => a - b);
    
    // Find the first available number from 1-100
    for (let i = 1; i <= 100; i++) {
      if (!usedNumbers.includes(i)) {
        return i;
      }
    }
    
    // If all numbers 1-100 are used, return the next number
    return Math.max(...usedNumbers) + 1;
  }

  async getTodoItems(): Promise<TodoItem[]> {
    const data = await this.loadData();
    return data.todoItems.sort((a, b) => a.number - b.number);
  }

  async getTodoItem(id: number): Promise<TodoItem | undefined> {
    const data = await this.loadData();
    return data.todoItems.find(item => item.id === id);
  }

  async createTodoItem(insertItem: InsertTodoItem): Promise<TodoItem> {
    const data = await this.loadData();
    const id = data.nextId++;
    
    // Assign the next available number if not provided
    const number = insertItem.number ?? this.getNextAvailableNumber(data.todoItems);
    
    const item: TodoItem = {
      id,
      text: insertItem.text,
      number,
      completed: insertItem.completed ?? false,
      positionX: insertItem.positionX ?? null,
      positionY: insertItem.positionY ?? null,
      quadrant: insertItem.quadrant ?? null,
      lastPositionX: null,
      lastPositionY: null,
      lastQuadrant: null,
    };
    data.todoItems.push(item);
    await this.saveData(data);
    return item;
  }

  async updateTodoItem(id: number, updates: Partial<InsertTodoItem>): Promise<TodoItem | undefined> {
    const data = await this.loadData();
    const itemIndex = data.todoItems.findIndex(item => item.id === id);
    if (itemIndex === -1) return undefined;
    
    const currentItem = data.todoItems[itemIndex];
    const wasCompleted = currentItem.completed;
    const willBeCompleted = updates.completed ?? currentItem.completed;
    
    // Handle completion status changes
    if (!wasCompleted && willBeCompleted) {
      // Item is being completed - save current position and clear matrix position
      updates.lastPositionX = currentItem.positionX;
      updates.lastPositionY = currentItem.positionY;
      updates.lastQuadrant = currentItem.quadrant;
      updates.positionX = null;
      updates.positionY = null;
      updates.quadrant = null;
    } else if (wasCompleted && !willBeCompleted) {
      // Item is being uncompleted - assign next available number and restore position if available
      updates.number = this.getNextAvailableNumber(data.todoItems);
      if (currentItem.lastPositionX !== null && currentItem.lastPositionY !== null) {
        updates.positionX = currentItem.lastPositionX;
        updates.positionY = currentItem.lastPositionY;
        updates.quadrant = currentItem.lastQuadrant;
      }
    }
    
    data.todoItems[itemIndex] = { ...currentItem, ...updates };
    await this.saveData(data);
    return data.todoItems[itemIndex];
  }

  async deleteTodoItem(id: number): Promise<boolean> {
    const data = await this.loadData();
    const initialLength = data.todoItems.length;
    data.todoItems = data.todoItems.filter(item => item.id !== id);
    await this.saveData(data);
    return data.todoItems.length < initialLength;
  }

  async getMatrixSettings(): Promise<MatrixSettings> {
    const data = await this.loadData();
    return data.matrixSettings;
  }

  async updateMatrixSettings(updates: Partial<InsertMatrixSettings>): Promise<MatrixSettings> {
    const data = await this.loadData();
    data.matrixSettings = { ...data.matrixSettings, ...updates };
    await this.saveData(data);
    return data.matrixSettings;
  }
}

export const storage = new FileStorage();
