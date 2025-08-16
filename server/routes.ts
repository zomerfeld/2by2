import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTodoItemSchema, insertMatrixSettingsSchema, insertListSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // List management routes
  app.post("/api/lists", async (req, res) => {
    try {
      const listId = await storage.createList();
      const list = await storage.getList(listId);
      res.status(201).json({ listId, list });
    } catch (error) {
      res.status(500).json({ message: "Failed to create list" });
    }
  });

  app.get("/api/lists/:listId", async (req, res) => {
    try {
      const { listId } = req.params;
      const list = await storage.getList(listId);
      
      if (!list) {
        res.status(404).json({ message: "List not found" });
        return;
      }
      
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch list" });
    }
  });

  app.delete("/api/lists/:listId", async (req, res) => {
    try {
      const { listId } = req.params;
      const deleted = await storage.deleteList(listId);
      
      if (!deleted) {
        res.status(404).json({ message: "List not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete list" });
    }
  });

  // Todo Items routes (with listId)
  app.get("/api/lists/:listId/todo-items", async (req, res) => {
    try {
      const { listId } = req.params;
      const items = await storage.getTodoItems(listId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todo items" });
    }
  });

  app.post("/api/lists/:listId/todo-items", async (req, res) => {
    try {
      const { listId } = req.params;
      const validatedData = insertTodoItemSchema.parse(req.body);
      const item = await storage.createTodoItem(listId, validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Todo creation error:", error);
        res.status(500).json({ message: "Failed to create todo item" });
      }
    }
  });

  app.patch("/api/lists/:listId/todo-items/:id", async (req, res) => {
    try {
      const { listId } = req.params;
      const id = parseInt(req.params.id);
      const updates = req.body;
      const item = await storage.updateTodoItem(listId, id, updates);
      
      if (!item) {
        res.status(404).json({ message: "Todo item not found" });
        return;
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update todo item" });
    }
  });

  app.delete("/api/lists/:listId/todo-items/:id", async (req, res) => {
    try {
      const { listId } = req.params;
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTodoItem(listId, id);
      
      if (!deleted) {
        res.status(404).json({ message: "Todo item not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete todo item" });
    }
  });

  app.post("/api/lists/:listId/todo-items/reorder", async (req, res) => {
    try {
      const { listId } = req.params;
      const { draggedId, targetNumber } = req.body;
      
      if (!draggedId || !targetNumber) {
        res.status(400).json({ message: "Missing draggedId or targetNumber" });
        return;
      }
      
      await storage.reorderTodoItems(listId, draggedId, targetNumber);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Reorder error:", error);
      res.status(500).json({ message: "Failed to reorder todo items" });
    }
  });

  // Matrix Settings routes (with listId)
  app.get("/api/lists/:listId/matrix-settings", async (req, res) => {
    try {
      const { listId } = req.params;
      const settings = await storage.getMatrixSettings(listId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matrix settings" });
    }
  });

  app.patch("/api/lists/:listId/matrix-settings", async (req, res) => {
    try {
      const { listId } = req.params;
      const validatedData = insertMatrixSettingsSchema.parse(req.body);
      const settings = await storage.updateMatrixSettings(listId, validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update matrix settings" });
      }
    }
  });

  // Data backup and recovery endpoints
  app.get("/api/backup/export", async (req, res) => {
    try {
      const backupData = await storage.exportAllData();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="priority-matrix-backup.json"');
      res.json(backupData);
    } catch (error) {
      res.status(500).json({ message: "Failed to export backup data" });
    }
  });

  app.post("/api/backup/import", async (req, res) => {
    try {
      await storage.importBackupData(req.body);
      res.json({ message: "Backup data imported successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to import backup data" });
    }
  });

  // Legacy routes - return error to force client to use new endpoints
  app.get("/api/todo-items", async (req, res) => {
    res.status(404).json({ message: "Please use /api/lists/:listId/todo-items" });
  });

  app.get("/api/matrix-settings", async (req, res) => {
    res.status(404).json({ message: "Please use /api/lists/:listId/matrix-settings" });
  });

  // Root URL - let client handle localStorage and routing
  // No redirect here - the client will check localStorage and redirect appropriately

  // Serve frontend for list URLs
  app.get("/lists/:listId", (req, res, next) => {
    // Let Vite handle this in development, or serve static files in production
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}