import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./replit_integrations/auth";
import {
  insertPersonSchema,
  insertInventorySchema,
  insertHistorySchema,
  insertFavoriteSchema,
  insertRecipeSchema,
  insertWoodSchema,
  insertGarnishSchema,
  insertToolSchema,
  insertCollectionSchema,
  insertFlightSchema,
  insertFlightResultSchema,
  insertPairingSchema,
  insertVariationSchema,
} from "@shared/schema";
import { z } from "zod";
import { generateBatch } from "./generation";
import type { BatchGenerationParams } from "@shared/generation-types";

function getUserId(req: Request): string {
  const userId = (req.user as any)?.claims?.sub;
  if (!userId) throw new Error("User not authenticated");
  return userId;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ====== COMPREHENSIVE HEALTH CHECK (PUBLIC) ======
  app.get("/api/health", async (req, res) => {
    const startTime = Date.now();
    const environment = process.env.NODE_ENV === "production" ? "production" : "development";
    const version = process.env.COMMIT_SHA || process.env.BUILD_ID || process.env.REPL_ID || "dev";
    
    let dbOk = false;
    let dbError: string | undefined;
    
    try {
      const result = await Promise.race([
        storage.healthCheck(),
        new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error("DB connection timeout (1.5s)")), 1500))
      ]) as boolean;
      dbOk = result === true;
      if (!dbOk) {
        dbError = "Database query returned false";
      }
    } catch (error) {
      dbOk = false;
      dbError = error instanceof Error ? error.message : String(error);
    }
    
    const authConfigured = Boolean(
      process.env.SESSION_SECRET && process.env.REPLIT_DOMAINS
    );
    
    const storageConfigured = Boolean(
      process.env.DATABASE_URL || 
      (process.env.PGHOST && process.env.PGDATABASE && process.env.PGUSER)
    );
    
    const overallOk = dbOk === true;
    const responseTime = Date.now() - startTime;
    
    res.json({
      ok: overallOk,
      timestamp: new Date().toISOString(),
      environment,
      version,
      responseTimeMs: responseTime,
      db: {
        ok: dbOk,
        ...(dbError && { error: dbError })
      },
      auth: {
        configured: authConfigured
      },
      storage: {
        configured: storageConfigured
      }
    });
  });

  // ====== PUBLIC RECIPES (Built-in classics for guests) ======
  app.get("/api/public/recipes", async (req, res) => {
    try {
      const recipes = await storage.getBuiltInRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });

  // ====== PUBLIC WOODS (For education/smoker pages) ======
  app.get("/api/public/woods", async (req, res) => {
    try {
      const woods = await storage.getBuiltInWoods();
      res.json(woods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch woods" });
    }
  });

  // ====== PUBLIC GARNISHES (For education pages) ======
  app.get("/api/public/garnishes", async (req, res) => {
    try {
      const garnishes = await storage.getBuiltInGarnishes();
      res.json(garnishes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch garnishes" });
    }
  });

  // ====== DRINK GENERATION (PUBLIC - uses built-in recipes for guests) ======
  app.post("/api/generation/batch", async (req, res) => {
    try {
      const params: BatchGenerationParams = {
        includeKidFriendly: Boolean(req.body.includeKidFriendly),
        allowCaffeineInKidMocktails: Boolean(req.body.allowCaffeineInKidMocktails),
        allowSpicyInKidMocktails: Boolean(req.body.allowSpicyInKidMocktails),
        personId: req.body.personId,
        occasion: req.body.occasion,
        preferredTags: req.body.preferredTags,
        excludeTags: req.body.excludeTags,
      };

      const recipes = await storage.getBuiltInRecipes();
      
      const result = generateBatch(recipes, params);
      
      res.json(result);
    } catch (error: any) {
      console.error("Generation error:", error);
      res.status(500).json({ error: "Failed to generate drinks", message: error.message });
    }
  });

  // ====== MIGRATE GUEST DATA (After login) ======
  app.post("/api/migrate-guest-data", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      
      const { pendingFavorites, flights, recentDrinks } = req.body;
      
      const results = {
        favorites: { success: 0, failed: 0, errors: [] as string[] },
        flights: { success: 0, failed: 0, errors: [] as string[] },
        history: { success: 0, failed: 0, errors: [] as string[] },
      };

      if (pendingFavorites && Array.isArray(pendingFavorites)) {
        for (const recipeId of pendingFavorites) {
          if (typeof recipeId !== 'string' || !recipeId) {
            results.favorites.failed++;
            results.favorites.errors.push("Invalid recipe ID");
            continue;
          }
          try {
            await storage.createFavorite({ userId, recipeId, notes: "Migrated from guest session" });
            results.favorites.success++;
          } catch (e: any) {
            results.favorites.failed++;
            results.favorites.errors.push(e.message || "Unknown error");
          }
        }
      }

      if (flights && Array.isArray(flights)) {
        for (const flight of flights) {
          if (!flight || typeof flight !== 'object') {
            results.flights.failed++;
            results.flights.errors.push("Invalid flight data");
            continue;
          }
          try {
            await storage.createFlight({
              userId,
              name: String(flight.name || "Migrated Flight"),
              category: flight.category || "alcoholic",
              theme: String(flight.theme || ""),
              recipeIds: Array.isArray(flight.recipeIds) ? flight.recipeIds : [],
            });
            results.flights.success++;
          } catch (e: any) {
            results.flights.failed++;
            results.flights.errors.push(e.message || "Unknown error");
          }
        }
      }

      if (recentDrinks && Array.isArray(recentDrinks)) {
        for (const drink of recentDrinks) {
          if (!drink || typeof drink !== 'object' || !drink.recipeId || !drink.recipeName) {
            results.history.failed++;
            results.history.errors.push("Invalid drink data");
            continue;
          }
          try {
            const smokedData = drink.smoked && typeof drink.smoked === 'object' 
              ? { 
                  wood: String(drink.smoked.wood || ''),
                  time: Number(drink.smoked.time) || 0,
                  method: String(drink.smoked.method || '')
                }
              : null;
            
            await storage.createHistoryEntry({
              userId,
              recipeId: String(drink.recipeId),
              recipeName: String(drink.recipeName),
              notes: `Migrated from guest session${drink.timestamp ? ` (originally made ${new Date(drink.timestamp).toLocaleDateString()})` : ''}`,
              smoked: smokedData,
            });
            results.history.success++;
          } catch (e: any) {
            results.history.failed++;
            results.history.errors.push(e.message || "Unknown error");
          }
        }
      }

      const hasPartialFailure = results.favorites.failed > 0 || 
                                 results.flights.failed > 0 || 
                                 results.history.failed > 0;

      res.json({
        success: !hasPartialFailure || (results.favorites.success + results.flights.success + results.history.success) > 0,
        partialFailure: hasPartialFailure,
        migratedCounts: {
          favorites: results.favorites.success,
          flights: results.flights.success,
          history: results.history.success,
        },
        failedCounts: {
          favorites: results.favorites.failed,
          flights: results.flights.failed,
          history: results.history.failed,
        },
        errors: hasPartialFailure ? {
          favorites: results.favorites.errors.slice(0, 3),
          flights: results.flights.errors.slice(0, 3),
          history: results.history.errors.slice(0, 3),
        } : undefined,
      });
    } catch (error: any) {
      res.status(500).json({ error: "Migration failed", message: error.message || "Unknown error" });
    }
  });

  // ====== PEOPLE PROFILES ======
  app.get("/api/people", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const people = await storage.getPeople(userId);
      res.json(people);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch people" });
    }
  });

  app.post("/api/people", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertPersonSchema.parse({ ...req.body, userId });
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

  app.patch("/api/people/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const person = await storage.updatePerson(userId, req.params.id, req.body);
      if (!person) {
        res.status(404).json({ error: "Person not found" });
      } else {
        res.json(person);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update person" });
    }
  });

  app.delete("/api/people/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      await storage.deletePerson(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete person" });
    }
  });

  // ====== INVENTORY ======
  app.get("/api/inventory", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const items = await storage.getInventory(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.post("/api/inventory", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertInventorySchema.parse({ ...req.body, userId });
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

  app.patch("/api/inventory/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const item = await storage.updateInventoryItem(userId, req.params.id, req.body);
      if (!item) {
        res.status(404).json({ error: "Inventory item not found" });
      } else {
        res.json(item);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      await storage.deleteInventoryItem(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete inventory item" });
    }
  });

  // ====== WOODS ======
  app.get("/api/woods", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const woods = await storage.getWoods(userId);
      res.json(woods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch woods" });
    }
  });

  app.post("/api/woods", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertWoodSchema.parse({ ...req.body, userId });
      const wood = await storage.createWood(data);
      res.json(wood);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create wood" });
      }
    }
  });

  app.patch("/api/woods/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const wood = await storage.updateWood(userId, req.params.id, req.body);
      if (!wood) {
        res.status(404).json({ error: "Wood not found" });
      } else {
        res.json(wood);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update wood" });
    }
  });

  app.delete("/api/woods/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      await storage.deleteWood(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete wood" });
    }
  });

  // ====== GARNISHES ======
  app.get("/api/garnishes", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const garnishes = await storage.getGarnishes(userId);
      res.json(garnishes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch garnishes" });
    }
  });

  app.post("/api/garnishes", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertGarnishSchema.parse({ ...req.body, userId });
      const garnish = await storage.createGarnish(data);
      res.json(garnish);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create garnish" });
      }
    }
  });

  app.patch("/api/garnishes/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const garnish = await storage.updateGarnish(userId, req.params.id, req.body);
      if (!garnish) {
        res.status(404).json({ error: "Garnish not found" });
      } else {
        res.json(garnish);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update garnish" });
    }
  });

  app.delete("/api/garnishes/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      await storage.deleteGarnish(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete garnish" });
    }
  });

  // ====== RECIPES ======
  app.get("/api/recipes", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const recipes = await storage.getRecipes(userId);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });

  app.post("/api/recipes", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertRecipeSchema.parse({ ...req.body, userId });
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

  app.patch("/api/recipes/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const recipe = await storage.updateRecipe(userId, req.params.id, req.body);
      if (!recipe) {
        res.status(404).json({ error: "Recipe not found" });
      } else {
        res.json(recipe);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update recipe" });
    }
  });

  app.delete("/api/recipes/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      await storage.deleteRecipe(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete recipe" });
    }
  });

  // ====== FAVORITES ======
  app.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertFavoriteSchema.parse({ ...req.body, userId });
      const favorite = await storage.createFavorite(data);
      res.json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create favorite" });
      }
    }
  });

  app.patch("/api/favorites/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const favorite = await storage.updateFavorite(userId, req.params.id, req.body);
      if (!favorite) {
        res.status(404).json({ error: "Favorite not found" });
      } else {
        res.json(favorite);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update favorite" });
    }
  });

  app.delete("/api/favorites/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      await storage.deleteFavorite(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete favorite" });
    }
  });

  // ====== COLLECTIONS ======
  app.get("/api/collections", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const collections = await storage.getCollections(userId);
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  app.post("/api/collections", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertCollectionSchema.parse({ ...req.body, userId });
      const collection = await storage.createCollection(data);
      res.json(collection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create collection" });
      }
    }
  });

  app.patch("/api/collections/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const collection = await storage.updateCollection(userId, req.params.id, req.body);
      if (!collection) {
        res.status(404).json({ error: "Collection not found" });
      } else {
        res.json(collection);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update collection" });
    }
  });

  app.delete("/api/collections/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      await storage.deleteCollection(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete collection" });
    }
  });

  // ====== HISTORY ======
  app.get("/api/history", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const history = await storage.getHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/history", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertHistorySchema.parse({ ...req.body, userId });
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

  // ====== VARIATIONS ======
  app.get("/api/variations", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const variations = await storage.getVariations(userId);
      res.json(variations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch variations" });
    }
  });

  app.post("/api/variations", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertVariationSchema.parse({ ...req.body, userId });
      const variation = await storage.createVariation(data);
      res.json(variation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create variation" });
      }
    }
  });

  // ====== FLIGHTS ======
  app.get("/api/flights", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const flights = await storage.getFlights(userId);
      res.json(flights);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flights" });
    }
  });

  app.get("/api/flights/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const flight = await storage.getFlight(userId, req.params.id);
      if (!flight) {
        res.status(404).json({ error: "Flight not found" });
      } else {
        res.json(flight);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flight" });
    }
  });

  app.post("/api/flights", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertFlightSchema.parse({ ...req.body, userId });
      const flight = await storage.createFlight(data);
      res.json(flight);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create flight" });
      }
    }
  });

  app.delete("/api/flights/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      await storage.deleteFlight(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete flight" });
    }
  });

  // ====== FLIGHT RESULTS ======
  app.get("/api/flights/:flightId/results", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const results = await storage.getFlightResults(userId, req.params.flightId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flight results" });
    }
  });

  app.post("/api/flight-results", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertFlightResultSchema.parse({ ...req.body, userId });
      const result = await storage.createFlightResult(data);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create flight result" });
      }
    }
  });

  app.patch("/api/flight-results/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const result = await storage.updateFlightResult(userId, req.params.id, req.body);
      if (!result) {
        res.status(404).json({ error: "Flight result not found" });
      } else {
        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update flight result" });
    }
  });

  // ====== PAIRINGS ======
  app.get("/api/pairings", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const pairings = await storage.getPairings(userId);
      res.json(pairings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pairings" });
    }
  });

  app.post("/api/pairings", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertPairingSchema.parse({ ...req.body, userId });
      const pairing = await storage.createPairing(data);
      res.json(pairing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create pairing" });
      }
    }
  });

  // ====== TOOLS ======
  app.get("/api/tools", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const tools = await storage.getTools(userId);
      res.json(tools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tools" });
    }
  });

  app.post("/api/tools", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const data = insertToolSchema.parse({ ...req.body, userId });
      const tool = await storage.createTool(data);
      res.json(tool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create tool" });
      }
    }
  });

  app.patch("/api/tools/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const tool = await storage.updateTool(userId, req.params.id, req.body);
      if (!tool) {
        res.status(404).json({ error: "Tool not found" });
      } else {
        res.json(tool);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update tool" });
    }
  });

  app.delete("/api/tools/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      await storage.deleteTool(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tool" });
    }
  });

  // ====== USER SETTINGS ======
  app.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      let settings = await storage.getUserSettings(userId);
      if (!settings) {
        await storage.seedUserData(userId);
        settings = await storage.getUserSettings(userId);
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const settings = await storage.upsertUserSettings(userId, req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // ====== SEED DATA (On first login) ======
  app.post("/api/seed", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      await storage.seedUserData(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed data" });
    }
  });

  return httpServer;
}
