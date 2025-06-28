import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTodoItemSchema, insertMatrixSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Todo Items routes
  app.get("/api/todo-items", async (req, res) => {
    try {
      const items = await storage.getTodoItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todo items" });
    }
  });

  app.post("/api/todo-items", async (req, res) => {
    try {
      const validatedData = insertTodoItemSchema.parse(req.body);
      const item = await storage.createTodoItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create todo item" });
      }
    }
  });

  app.patch("/api/todo-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const item = await storage.updateTodoItem(id, updates);
      
      if (!item) {
        res.status(404).json({ message: "Todo item not found" });
        return;
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update todo item" });
    }
  });

  app.delete("/api/todo-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTodoItem(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Todo item not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete todo item" });
    }
  });

  // Matrix Settings routes
  app.get("/api/matrix-settings", async (req, res) => {
    try {
      const settings = await storage.getMatrixSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matrix settings" });
    }
  });

  app.patch("/api/matrix-settings", async (req, res) => {
    try {
      const updates = req.body;
      const settings = await storage.updateMatrixSettings(updates);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update matrix settings" });
    }
  });

  // Export matrix state
  app.get("/api/export", async (req, res) => {
    try {
      const items = await storage.getTodoItems();
      const settings = await storage.getMatrixSettings();
      
      const exportData = {
        todoItems: items,
        matrixSettings: settings,
        exportedAt: new Date().toISOString(),
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="priority-matrix.json"');
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ message: "Failed to export matrix data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
