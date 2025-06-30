import { type TodoItem, type InsertTodoItem, type MatrixSettings, type InsertMatrixSettings, type List, type InsertList } from "@shared/schema";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

const DATA_FILE = path.join(process.cwd(), "data.json");
const TEMPLATE_FILE = path.join(process.cwd(), "data.template.json");
const MAX_LISTS = 100;

interface ListData {
  list: List;
  todoItems: TodoItem[];
  nextId: number;
}

interface StorageData {
  lists: Record<string, ListData>;
  // Legacy fields for backward compatibility
  todoItems?: TodoItem[];
  matrixSettings?: MatrixSettings;
  nextId?: number;
}

export interface IStorage {
  // List Management
  createList(): Promise<string>; // Returns listId
  getList(listId: string): Promise<List | undefined>;
  updateList(listId: string, updates: Partial<InsertList>): Promise<List | undefined>;
  deleteList(listId: string): Promise<boolean>;
  
  // Todo Items
  getTodoItems(listId: string): Promise<TodoItem[]>;
  getTodoItem(listId: string, id: number): Promise<TodoItem | undefined>;
  createTodoItem(listId: string, item: InsertTodoItem): Promise<TodoItem>;
  updateTodoItem(listId: string, id: number, updates: Partial<InsertTodoItem>): Promise<TodoItem | undefined>;
  deleteTodoItem(listId: string, id: number): Promise<boolean>;
  
  // Matrix Settings (now part of list)
  getMatrixSettings(listId: string): Promise<MatrixSettings>;
  updateMatrixSettings(listId: string, settings: Partial<InsertMatrixSettings>): Promise<MatrixSettings>;
}

export class FileStorage implements IStorage {
  private async loadData(): Promise<StorageData> {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      
      // Migrate legacy data if needed
      if (parsed.todoItems && !parsed.lists) {
        const defaultListId = nanoid(10);
        parsed.lists = {
          [defaultListId]: {
            list: {
              id: 1,
              listId: defaultListId,
              lastUpdated: new Date(),
              xAxisLabel: parsed.matrixSettings?.xAxisLabel || "Impact",
              yAxisLabel: parsed.matrixSettings?.yAxisLabel || "Urgency",
            },
            todoItems: parsed.todoItems.map((item: any) => ({
              ...item,
              listId: defaultListId,
            })),
            nextId: parsed.nextId || 1,
          }
        };
        // Clean up legacy fields
        delete parsed.todoItems;
        delete parsed.matrixSettings;
        delete parsed.nextId;
        await this.saveData(parsed);
      }
      
      return parsed;
    } catch (error) {
      // Initialize with empty lists structure
      const defaultData: StorageData = {
        lists: {},
      };
      await this.saveData(defaultData);
      return defaultData;
    }
  }

  private async saveData(data: StorageData): Promise<void> {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  }

  private async cleanupOldLists(): Promise<void> {
    const data = await this.loadData();
    const listEntries = Object.entries(data.lists);
    
    if (listEntries.length > MAX_LISTS) {
      // Sort by lastUpdated, oldest first
      listEntries.sort((a, b) => 
        new Date(a[1].list.lastUpdated).getTime() - new Date(b[1].list.lastUpdated).getTime()
      );
      
      // Keep only the most recent MAX_LISTS
      const toKeep = listEntries.slice(-MAX_LISTS);
      data.lists = Object.fromEntries(toKeep);
      await this.saveData(data);
    }
  }

  private getNextAvailableNumber(todoItems: TodoItem[]): number {
    const existingNumbers = todoItems.map(item => item.number);
    for (let i = 1; i <= 100; i++) {
      if (!existingNumbers.includes(i)) {
        return i;
      }
    }
    throw new Error("Maximum number of items (100) reached");
  }

  async createList(): Promise<string> {
    await this.cleanupOldLists();
    
    const listId = nanoid(10);
    const data = await this.loadData();
    
    data.lists[listId] = {
      list: {
        id: Object.keys(data.lists).length + 1,
        listId,
        lastUpdated: new Date(),
        xAxisLabel: "Impact",
        yAxisLabel: "Urgency",
      },
      todoItems: [],
      nextId: 1,
    };
    
    await this.saveData(data);
    return listId;
  }

  async getList(listId: string): Promise<List | undefined> {
    const data = await this.loadData();
    return data.lists[listId]?.list;
  }

  async updateList(listId: string, updates: Partial<InsertList>): Promise<List | undefined> {
    const data = await this.loadData();
    const listData = data.lists[listId];
    if (!listData) return undefined;

    listData.list = { 
      ...listData.list, 
      ...updates, 
      lastUpdated: new Date() 
    };
    await this.saveData(data);
    return listData.list;
  }

  async deleteList(listId: string): Promise<boolean> {
    const data = await this.loadData();
    if (data.lists[listId]) {
      delete data.lists[listId];
      await this.saveData(data);
      return true;
    }
    return false;
  }

  async getTodoItems(listId: string): Promise<TodoItem[]> {
    const data = await this.loadData();
    return data.lists[listId]?.todoItems || [];
  }

  async getTodoItem(listId: string, id: number): Promise<TodoItem | undefined> {
    const data = await this.loadData();
    return data.lists[listId]?.todoItems.find(item => item.id === id);
  }

  async createTodoItem(listId: string, insertItem: InsertTodoItem): Promise<TodoItem> {
    const data = await this.loadData();
    const listData = data.lists[listId];
    if (!listData) throw new Error(`List ${listId} not found`);

    const number = insertItem.number ?? this.getNextAvailableNumber(listData.todoItems);
    
    const item: TodoItem = {
      id: listData.nextId,
      listId,
      text: insertItem.text,
      number,
      completed: insertItem.completed ?? false,
      positionX: insertItem.positionX ?? null,
      positionY: insertItem.positionY ?? null,
      quadrant: insertItem.quadrant ?? null,
      lastPositionX: insertItem.lastPositionX ?? null,
      lastPositionY: insertItem.lastPositionY ?? null,
      lastQuadrant: insertItem.lastQuadrant ?? null,
    };

    listData.todoItems.push(item);
    listData.nextId++;
    listData.list.lastUpdated = new Date();
    await this.saveData(data);
    return item;
  }

  async updateTodoItem(listId: string, id: number, updates: Partial<InsertTodoItem>): Promise<TodoItem | undefined> {
    const data = await this.loadData();
    const listData = data.lists[listId];
    if (!listData) return undefined;

    const itemIndex = listData.todoItems.findIndex(item => item.id === id);
    if (itemIndex === -1) return undefined;

    const updatedItem = { ...listData.todoItems[itemIndex], ...updates };
    listData.todoItems[itemIndex] = updatedItem;
    listData.list.lastUpdated = new Date();
    await this.saveData(data);
    return updatedItem;
  }

  async deleteTodoItem(listId: string, id: number): Promise<boolean> {
    const data = await this.loadData();
    const listData = data.lists[listId];
    if (!listData) return false;

    const initialLength = listData.todoItems.length;
    listData.todoItems = listData.todoItems.filter(item => item.id !== id);
    if (listData.todoItems.length !== initialLength) {
      listData.list.lastUpdated = new Date();
      await this.saveData(data);
      return true;
    }
    return false;
  }

  async getMatrixSettings(listId: string): Promise<MatrixSettings> {
    const data = await this.loadData();
    const listData = data.lists[listId];
    if (!listData) throw new Error(`List ${listId} not found`);

    return {
      id: listData.list.id,
      xAxisLabel: listData.list.xAxisLabel,
      yAxisLabel: listData.list.yAxisLabel,
    };
  }

  async updateMatrixSettings(listId: string, settings: Partial<InsertMatrixSettings>): Promise<MatrixSettings> {
    const data = await this.loadData();
    const listData = data.lists[listId];
    if (!listData) throw new Error(`List ${listId} not found`);

    listData.list.xAxisLabel = settings.xAxisLabel || listData.list.xAxisLabel;
    listData.list.yAxisLabel = settings.yAxisLabel || listData.list.yAxisLabel;
    listData.list.lastUpdated = new Date();
    
    await this.saveData(data);
    
    return {
      id: listData.list.id,
      xAxisLabel: listData.list.xAxisLabel,
      yAxisLabel: listData.list.yAxisLabel,
    };
  }
}

export const storage = new FileStorage();