import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertPersonSchema,
  insertInventorySchema,
  insertHistorySchema,
  insertFavoriteSchema,
  insertSettingsSchema,
  insertRecipeSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ====== PEOPLE PROFILES ======
  app.get("/api/people", async (req, res) => {
    try {
      const people = await storage.getPeople();
      res.json(people);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch people" });
    }
  });

  app.post("/api/people", async (req, res) => {
    try {
      const data = insertPersonSchema.parse(req.body);
      const person = await storage.createPerson(data);
      res.json(person);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create person" });
      }
    }
  });

  app.patch("/api/people/:id", async (req, res) => {
    try {
      const person = await storage.updatePerson(req.params.id, req.body);
      if (!person) {
        res.status(404).json({ error: "Person not found" });
      } else {
        res.json(person);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update person" });
    }
  });

  app.delete("/api/people/:id", async (req, res) => {
    try {
      await storage.deletePerson(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete person" });
    }
  });

  // ====== INVENTORY ======
  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await storage.getInventory();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const data = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(data);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create inventory item" });
      }
    }
  });

  app.patch("/api/inventory/:id", async (req, res) => {
    try {
      const item = await storage.updateInventoryItem(req.params.id, req.body);
      if (!item) {
        res.status(404).json({ error: "Inventory item not found" });
      } else {
        res.json(item);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      await storage.deleteInventoryItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete inventory item" });
    }
  });

  // ====== HISTORY ======
  app.get("/api/history", async (req, res) => {
    try {
      const entries = await storage.getHistory();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/history", async (req, res) => {
    try {
      const data = insertHistorySchema.parse(req.body);
      const entry = await storage.createHistoryEntry(data);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create history entry" });
      }
    }
  });

  // ====== FAVORITES ======
  app.get("/api/favorites", async (req, res) => {
    try {
      const favorites = await storage.getFavorites();
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const { recipeId } = req.body;
      if (!recipeId) {
        res.status(400).json({ error: "recipeId is required" });
        return;
      }
      const favorite = await storage.addFavorite(recipeId);
      res.json(favorite);
    } catch (error) {
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:recipeId", async (req, res) => {
    try {
      await storage.removeFavorite(req.params.recipeId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // ====== WOOD KIT ======
  app.get("/api/wood-kit", async (req, res) => {
    try {
      const kit = await storage.getWoodKit();
      res.json(kit);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wood kit" });
    }
  });

  app.post("/api/wood-kit", async (req, res) => {
    try {
      const { woodId, isInKit } = req.body;
      if (!woodId || typeof isInKit !== 'boolean') {
        res.status(400).json({ error: "woodId and isInKit are required" });
        return;
      }
      const kit = await storage.updateWoodKit(woodId, isInKit);
      res.json(kit);
    } catch (error) {
      res.status(500).json({ error: "Failed to update wood kit" });
    }
  });

  // ====== SETTINGS ======
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      if (!settings) {
        // Create default settings if none exist
        const defaultSettings = await storage.updateSettings({
          email: 'user@example.com',
          hasSmoker: false,
          defaultIntensity: 'medium',
          enableCostTracking: false,
          debugMode: false,
          woodAffinity: {},
        });
        res.json(defaultSettings);
      } else {
        res.json(settings);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // ====== CUSTOM RECIPES ======
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      const data = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(data);
      res.json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create recipe" });
      }
    }
  });

  app.delete("/api/recipes/:id", async (req, res) => {
    try {
      await storage.deleteRecipe(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete recipe" });
    }
  });

  return httpServer;
}
