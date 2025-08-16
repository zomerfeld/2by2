import { 
  lists,
  todoItems,
  matrixSettings,
  users,
  type List, 
  type InsertList, 
  type TodoItem, 
  type InsertTodoItem, 
  type MatrixSettings, 
  type InsertMatrixSettings,
  type User,
  type UpsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, count } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

const DATA_FILE = path.join(process.cwd(), "data.json");
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
  // User Management (for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // List Management
  createList(userId?: string): Promise<string>; // Returns listId (UUID)
  getList(listId: string): Promise<List | undefined>;
  updateList(listId: string, updates: Partial<InsertList>): Promise<List | undefined>;
  deleteList(listId: string): Promise<boolean>;
  
  // Todo Items
  getTodoItems(listId: string): Promise<TodoItem[]>;
  getTodoItem(listId: string, id: number): Promise<TodoItem | undefined>;
  createTodoItem(listId: string, item: InsertTodoItem): Promise<TodoItem>;
  updateTodoItem(listId: string, id: number, updates: Partial<InsertTodoItem>): Promise<TodoItem | undefined>;
  deleteTodoItem(listId: string, id: number): Promise<boolean>;
  reorderTodoItems(listId: string, draggedId: number, targetNumber: number): Promise<void>;
  
  // Matrix Settings (now part of list)
  getMatrixSettings(listId: string): Promise<MatrixSettings>;
  updateMatrixSettings(listId: string, settings: Partial<InsertMatrixSettings>): Promise<MatrixSettings>;
  
  // Data backup/recovery
  exportAllData(): Promise<any>;
  importBackupData(data: any): Promise<void>;
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

  async createList(userId?: string): Promise<string> {
    await this.cleanupOldLists();
    
    const listId = nanoid(10);
    const data = await this.loadData();
    
    data.lists[listId] = {
      list: {
        id: Object.keys(data.lists).length + 1,
        listId,
        userId: userId || null,
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
      createdAt: new Date(),
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
      xAxisLabel: listData.list.xAxisLabel || "Impact",
      yAxisLabel: listData.list.yAxisLabel || "Urgency",
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
      xAxisLabel: listData.list.xAxisLabel || "Impact",
      yAxisLabel: listData.list.yAxisLabel || "Urgency",
    };
  }

  // User Management (stub implementation for FileStorage)
  async getUser(id: string): Promise<User | undefined> {
    // FileStorage doesn't support user management
    return undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // FileStorage doesn't support user management
    throw new Error("User management not supported in FileStorage");
  }

  async reorderTodoItems(listId: string, draggedId: number, targetNumber: number): Promise<void> {
    const data = await this.loadData();
    const listData = data.lists[listId];
    if (!listData) throw new Error(`List ${listId} not found`);

    const draggedItem = listData.todoItems.find(item => item.id === draggedId);
    if (!draggedItem) throw new Error(`Todo item ${draggedId} not found`);

    const currentNumber = draggedItem.number;
    if (currentNumber === targetNumber) return;

    // Find the item that currently has the target number
    const targetItem = listData.todoItems.find(item => item.number === targetNumber);
    
    if (targetItem) {
      // Swap the numbers
      targetItem.number = currentNumber;
    }

    // Update the dragged item to have the target number
    draggedItem.number = targetNumber;
    listData.list.lastUpdated = new Date();
    await this.saveData(data);
  }

  async exportAllData(): Promise<any> {
    return await this.loadData();
  }

  async importBackupData(data: any): Promise<void> {
    await this.saveData(data);
  }
}

// Database storage implementation using PostgreSQL
export class DatabaseStorage implements IStorage {
  // User Management (for authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // List Management with improved IDs
  async createList(userId?: string): Promise<string> {
    // Generate crypto-random UUID for better security than nanoid
    const listId = crypto.randomUUID();
    const [list] = await db
      .insert(lists)
      .values({
        listId,
        userId,
        xAxisLabel: "Impact",
        yAxisLabel: "Urgency",
      })
      .returning();
    return list.listId;
  }

  async getList(listId: string): Promise<List | undefined> {
    const [list] = await db.select().from(lists).where(eq(lists.listId, listId));
    return list || undefined;
  }

  async updateList(listId: string, updates: Partial<InsertList>): Promise<List | undefined> {
    const [list] = await db
      .update(lists)
      .set({ 
        ...updates, 
        lastUpdated: new Date() 
      })
      .where(eq(lists.listId, listId))
      .returning();
    return list || undefined;
  }

  async deleteList(listId: string): Promise<boolean> {
    // Delete associated todo items first
    await db.delete(todoItems).where(eq(todoItems.listId, listId));
    
    const result = await db.delete(lists).where(eq(lists.listId, listId));
    return (result.rowCount ?? 0) > 0;
  }

  // Todo Items with proper validation
  async getTodoItems(listId: string): Promise<TodoItem[]> {
    return await db
      .select()
      .from(todoItems)
      .where(eq(todoItems.listId, listId))
      .orderBy(todoItems.sortOrder, todoItems.id);
  }

  async getTodoItem(listId: string, id: number): Promise<TodoItem | undefined> {
    const [item] = await db
      .select()
      .from(todoItems)
      .where(sql`${todoItems.id} = ${id} AND ${todoItems.listId} = ${listId}`);
    return item || undefined;
  }

  async createTodoItem(listId: string, insertItem: InsertTodoItem): Promise<TodoItem> {
    // Get next available number if not provided
    let itemNumber = insertItem.number;
    if (!itemNumber) {
      const existingItems = await this.getTodoItems(listId);
      itemNumber = this.getNextAvailableNumber(existingItems);
    }

    // Get existing items to find highest sortOrder and add to end
    const existingItems = await this.getTodoItems(listId);
    const maxSortOrder = existingItems.length > 0 
      ? Math.max(...existingItems.map(item => item.sortOrder || 0))
      : 0;
    const sortOrder = maxSortOrder + 1;

    const [item] = await db
      .insert(todoItems)
      .values({
        listId,
        text: insertItem.text,
        number: itemNumber,
        sortOrder,
        positionX: insertItem.positionX || null,
        positionY: insertItem.positionY || null,
        quadrant: insertItem.quadrant || null,
        completed: false,
        lastPositionX: insertItem.lastPositionX || null,
        lastPositionY: insertItem.lastPositionY || null,
        lastQuadrant: insertItem.lastQuadrant || null,
      })
      .returning();

    // Update list timestamp
    await db
      .update(lists)
      .set({ lastUpdated: new Date() })
      .where(eq(lists.listId, listId));

    return item;
  }

  async updateTodoItem(listId: string, id: number, updates: Partial<InsertTodoItem>): Promise<TodoItem | undefined> {
    const [item] = await db
      .update(todoItems)
      .set(updates)
      .where(sql`${todoItems.id} = ${id} AND ${todoItems.listId} = ${listId}`)
      .returning();

    if (item) {
      // Update list timestamp
      await db
        .update(lists)
        .set({ lastUpdated: new Date() })
        .where(eq(lists.listId, listId));
    }

    return item || undefined;
  }

  async deleteTodoItem(listId: string, id: number): Promise<boolean> {
    const result = await db
      .delete(todoItems)
      .where(sql`${todoItems.id} = ${id} AND ${todoItems.listId} = ${listId}`);

    if ((result.rowCount ?? 0) > 0) {
      // Update list timestamp
      await db
        .update(lists)
        .set({ lastUpdated: new Date() })
        .where(eq(lists.listId, listId));
      return true;
    }
    return false;
  }

  async reorderTodoItems(listId: string, draggedId: number, targetNumber: number): Promise<void> {
    // Get all todo items for this list, sorted by current sortOrder
    const items = await db
      .select()
      .from(todoItems)
      .where(eq(todoItems.listId, listId))
      .orderBy(todoItems.sortOrder, todoItems.id);
    
    const draggedItem = items.find(item => item.id === draggedId);
    const targetItem = items.find(item => item.number === targetNumber);
    
    if (!draggedItem || !targetItem) {
      throw new Error(`Todo item not found`);
    }

    // If it's the same item, no need to reorder
    if (draggedItem.id === targetItem.id) {
      return;
    }

    // Get the target item's current sortOrder
    const targetSortOrder = targetItem.sortOrder;
    
    // Move the dragged item to the target position
    await db
      .update(todoItems)
      .set({ sortOrder: targetSortOrder })
      .where(sql`${todoItems.id} = ${draggedId} AND ${todoItems.listId} = ${listId}`);

    // Update all other items' sortOrder to maintain proper order
    // If moving up (draggedItem.sortOrder > targetSortOrder), shift items down
    // If moving down (draggedItem.sortOrder < targetSortOrder), shift items up
    if (draggedItem.sortOrder > targetSortOrder) {
      // Moving up - shift other items down
      await db
        .update(todoItems)
        .set({ 
          sortOrder: sql`${todoItems.sortOrder} + 1`
        })
        .where(sql`
          ${todoItems.listId} = ${listId} 
          AND ${todoItems.id} != ${draggedId}
          AND ${todoItems.sortOrder} >= ${targetSortOrder}
          AND ${todoItems.sortOrder} < ${draggedItem.sortOrder}
        `);
    } else {
      // Moving down - shift other items up
      await db
        .update(todoItems)
        .set({ 
          sortOrder: sql`${todoItems.sortOrder} - 1`
        })
        .where(sql`
          ${todoItems.listId} = ${listId} 
          AND ${todoItems.id} != ${draggedId}
          AND ${todoItems.sortOrder} <= ${targetSortOrder}
          AND ${todoItems.sortOrder} > ${draggedItem.sortOrder}
        `);
    }

    // Update list timestamp
    await db
      .update(lists)
      .set({ lastUpdated: new Date() })
      .where(eq(lists.listId, listId));
  }

  // Matrix Settings
  async getMatrixSettings(listId: string): Promise<MatrixSettings> {
    const list = await this.getList(listId);
    if (!list) throw new Error(`List ${listId} not found`);

    return {
      id: list.id,
      xAxisLabel: list.xAxisLabel,
      yAxisLabel: list.yAxisLabel,
    };
  }

  async updateMatrixSettings(listId: string, settings: Partial<InsertMatrixSettings>): Promise<MatrixSettings> {
    const [list] = await db
      .update(lists)
      .set({
        xAxisLabel: settings.xAxisLabel,
        yAxisLabel: settings.yAxisLabel,
        lastUpdated: new Date(),
      })
      .where(eq(lists.listId, listId))
      .returning();

    if (!list) throw new Error(`List ${listId} not found`);

    return {
      id: list.id,
      xAxisLabel: list.xAxisLabel,
      yAxisLabel: list.yAxisLabel,
    };
  }

  // Data backup/recovery
  async exportAllData(): Promise<any> {
    const allLists = await db.select().from(lists);
    const allTodoItems = await db.select().from(todoItems);
    const allUsers = await db.select().from(users);

    return {
      version: "1.0",
      timestamp: new Date().toISOString(),
      lists: allLists,
      todoItems: allTodoItems,
      users: allUsers,
    };
  }

  async importBackupData(data: any): Promise<void> {
    // Clear existing data
    await db.delete(todoItems);
    await db.delete(lists);
    await db.delete(users);

    // Import users
    if (data.users && data.users.length > 0) {
      await db.insert(users).values(data.users);
    }

    // Import lists
    if (data.lists && data.lists.length > 0) {
      await db.insert(lists).values(data.lists);
    }

    // Import todo items
    if (data.todoItems && data.todoItems.length > 0) {
      await db.insert(todoItems).values(data.todoItems);
    }
  }

  private getNextAvailableNumber(todoItems: TodoItem[]): number {
    const usedNumbers = new Set(
      todoItems
        .filter(item => !item.completed)
        .map(item => item.number)
    );

    for (let i = 1; i <= 100; i++) {
      if (!usedNumbers.has(i)) {
        return i;
      }
    }
    return 1; // Fallback, should never happen with 100 limit
  }
}

// Migration from FileStorage to DatabaseStorage
// Keep FileStorage available for migration purposes but use DatabaseStorage as primary
export const storage = new DatabaseStorage();