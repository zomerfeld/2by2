import { db } from "./db";
import { lists, todoItems, users } from "@shared/schema";
import fs from "fs/promises";
import path from "path";

interface FileStorageData {
  lists: Record<string, {
    list: any;
    todoItems: any[];
    nextId: number;
  }>;
}

async function migrateFileToDatabase() {
  console.log("Starting migration from file storage to PostgreSQL...");
  
  const dataFile = path.join(process.cwd(), "data.json");
  
  try {
    // Check if data file exists
    const fileExists = await fs.access(dataFile).then(() => true).catch(() => false);
    if (!fileExists) {
      console.log("No data.json file found, starting with empty database");
      return;
    }

    // Read existing file data
    const fileContent = await fs.readFile(dataFile, "utf-8");
    const data: FileStorageData = JSON.parse(fileContent);
    
    console.log(`Found ${Object.keys(data.lists || {}).length} lists to migrate`);

    // Migrate each list and its todo items
    for (const [listId, listData] of Object.entries(data.lists || {})) {
      console.log(`Migrating list: ${listId}`);
      
      // Generate UUID for new list ID while preserving data
      const newListId = crypto.randomUUID();
      
      // Insert list with UUID
      await db.insert(lists).values({
        listId: newListId,
        userId: null, // No user association for migrated lists
        lastUpdated: listData.list.lastUpdated || new Date(),
        xAxisLabel: listData.list.xAxisLabel || "Impact",
        yAxisLabel: listData.list.yAxisLabel || "Urgency",
      });

      // Migrate todo items
      if (listData.todoItems && listData.todoItems.length > 0) {
        for (const item of listData.todoItems) {
          await db.insert(todoItems).values({
            listId: newListId,
            text: item.text,
            number: item.number,
            positionX: item.positionX || null,
            positionY: item.positionY || null,
            quadrant: item.quadrant || null,
            completed: item.completed || false,
            lastPositionX: item.lastPositionX || null,
            lastPositionY: item.lastPositionY || null,
            lastQuadrant: item.lastQuadrant || null,
          });
        }
        console.log(`Migrated ${listData.todoItems.length} todo items for list ${listId}`);
      }
    }

    // Backup original file
    const backupFile = `${dataFile}.backup.${Date.now()}`;
    await fs.copyFile(dataFile, backupFile);
    console.log(`Original data backed up to: ${backupFile}`);

    console.log("Migration completed successfully!");
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

export { migrateFileToDatabase };