import {
  people,
  inventory,
  barcodeMappings,
  tools,
  woods,
  garnishes,
  recipes,
  favorites,
  collections,
  history,
  variations,
  flights,
  flightResults,
  pairings,
  userSettings,
  type Person,
  type InsertPerson,
  type Inventory,
  type InsertInventory,
  type BarcodeMapping,
  type InsertBarcodeMapping,
  type Tool,
  type InsertTool,
  type Wood,
  type InsertWood,
  type Garnish,
  type InsertGarnish,
  type Recipe,
  type InsertRecipe,
  type Favorite,
  type InsertFavorite,
  type Collection,
  type InsertCollection,
  type History,
  type InsertHistory,
  type Variation,
  type InsertVariation,
  type Flight,
  type InsertFlight,
  type FlightResult,
  type InsertFlightResult,
  type Pairing,
  type InsertPairing,
  type UserSettings,
  type InsertUserSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // People
  getPeople(userId: string): Promise<Person[]>;
  getPerson(userId: string, id: string): Promise<Person | undefined>;
  createPerson(data: InsertPerson): Promise<Person>;
  updatePerson(userId: string, id: string, updates: Partial<InsertPerson>): Promise<Person | undefined>;
  deletePerson(userId: string, id: string): Promise<void>;

  // Inventory
  getInventory(userId: string): Promise<Inventory[]>;
  getInventoryItem(userId: string, id: string): Promise<Inventory | undefined>;
  createInventoryItem(data: InsertInventory): Promise<Inventory>;
  updateInventoryItem(userId: string, id: string, updates: Partial<InsertInventory>): Promise<Inventory | undefined>;
  deleteInventoryItem(userId: string, id: string): Promise<void>;

  // Woods
  getWoods(userId: string): Promise<Wood[]>;
  createWood(data: InsertWood): Promise<Wood>;
  updateWood(userId: string, id: string, updates: Partial<InsertWood>): Promise<Wood | undefined>;
  deleteWood(userId: string, id: string): Promise<void>;

  // Garnishes
  getGarnishes(userId: string): Promise<Garnish[]>;
  createGarnish(data: InsertGarnish): Promise<Garnish>;
  updateGarnish(userId: string, id: string, updates: Partial<InsertGarnish>): Promise<Garnish | undefined>;
  deleteGarnish(userId: string, id: string): Promise<void>;

  // Recipes
  getRecipes(userId: string): Promise<Recipe[]>;
  getRecipe(userId: string, id: string): Promise<Recipe | undefined>;
  createRecipe(data: InsertRecipe): Promise<Recipe>;
  updateRecipe(userId: string, id: string, updates: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(userId: string, id: string): Promise<void>;

  // Favorites
  getFavorites(userId: string): Promise<Favorite[]>;
  createFavorite(data: InsertFavorite): Promise<Favorite>;
  updateFavorite(userId: string, id: string, updates: Partial<InsertFavorite>): Promise<Favorite | undefined>;
  deleteFavorite(userId: string, id: string): Promise<void>;

  // Collections
  getCollections(userId: string): Promise<Collection[]>;
  createCollection(data: InsertCollection): Promise<Collection>;
  updateCollection(userId: string, id: string, updates: Partial<InsertCollection>): Promise<Collection | undefined>;
  deleteCollection(userId: string, id: string): Promise<void>;

  // History
  getHistory(userId: string): Promise<History[]>;
  createHistoryEntry(data: InsertHistory): Promise<History>;

  // Variations
  getVariations(userId: string): Promise<Variation[]>;
  createVariation(data: InsertVariation): Promise<Variation>;

  // Flights
  getFlights(userId: string): Promise<Flight[]>;
  getFlight(userId: string, id: string): Promise<Flight | undefined>;
  createFlight(data: InsertFlight): Promise<Flight>;
  deleteFlight(userId: string, id: string): Promise<void>;

  // Flight Results
  getFlightResults(userId: string, flightId: string): Promise<FlightResult[]>;
  createFlightResult(data: InsertFlightResult): Promise<FlightResult>;
  updateFlightResult(userId: string, id: string, updates: Partial<InsertFlightResult>): Promise<FlightResult | undefined>;

  // Pairings
  getPairings(userId: string): Promise<Pairing[]>;
  createPairing(data: InsertPairing): Promise<Pairing>;

  // User Settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  upsertUserSettings(userId: string, updates: Partial<InsertUserSettings>): Promise<UserSettings>;

  // Tools
  getTools(userId: string): Promise<Tool[]>;
  createTool(data: InsertTool): Promise<Tool>;
  updateTool(userId: string, id: string, updates: Partial<InsertTool>): Promise<Tool | undefined>;
  deleteTool(userId: string, id: string): Promise<void>;

  // Barcode Mappings
  getBarcodeMapping(userId: string, barcode: string): Promise<BarcodeMapping | undefined>;
  createBarcodeMapping(data: InsertBarcodeMapping): Promise<BarcodeMapping>;

  // Seed data
  seedUserData(userId: string): Promise<void>;

  // Public data (for guests)
  healthCheck(): Promise<boolean>;
  getBuiltInRecipes(): Promise<Recipe[]>;
  getBuiltInWoods(): Promise<Wood[]>;
  getBuiltInGarnishes(): Promise<Garnish[]>;
}

export class DatabaseStorage implements IStorage {
  // ====== PEOPLE ======
  async getPeople(userId: string): Promise<Person[]> {
    return db.select().from(people).where(eq(people.userId, userId));
  }

  async getPerson(userId: string, id: string): Promise<Person | undefined> {
    const [person] = await db.select().from(people).where(and(eq(people.userId, userId), eq(people.id, id)));
    return person;
  }

  async createPerson(data: InsertPerson): Promise<Person> {
    const [person] = await db.insert(people).values(data as any).returning();
    return person;
  }

  async updatePerson(userId: string, id: string, updates: Partial<InsertPerson>): Promise<Person | undefined> {
    const [person] = await db.update(people).set(updates as any).where(and(eq(people.userId, userId), eq(people.id, id))).returning();
    return person;
  }

  async deletePerson(userId: string, id: string): Promise<void> {
    await db.delete(people).where(and(eq(people.userId, userId), eq(people.id, id)));
  }

  // ====== INVENTORY ======
  async getInventory(userId: string): Promise<Inventory[]> {
    return db.select().from(inventory).where(eq(inventory.userId, userId));
  }

  async getInventoryItem(userId: string, id: string): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(and(eq(inventory.userId, userId), eq(inventory.id, id)));
    return item;
  }

  async createInventoryItem(data: InsertInventory): Promise<Inventory> {
    const [item] = await db.insert(inventory).values(data as any).returning();
    return item;
  }

  async updateInventoryItem(userId: string, id: string, updates: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const [item] = await db.update(inventory).set({ ...updates, updatedAt: new Date() } as any).where(and(eq(inventory.userId, userId), eq(inventory.id, id))).returning();
    return item;
  }

  async deleteInventoryItem(userId: string, id: string): Promise<void> {
    await db.delete(inventory).where(and(eq(inventory.userId, userId), eq(inventory.id, id)));
  }

  // ====== WOODS ======
  async getWoods(userId: string): Promise<Wood[]> {
    return db.select().from(woods).where(eq(woods.userId, userId));
  }

  async createWood(data: InsertWood): Promise<Wood> {
    const [wood] = await db.insert(woods).values(data as any).returning();
    return wood;
  }

  async updateWood(userId: string, id: string, updates: Partial<InsertWood>): Promise<Wood | undefined> {
    const [wood] = await db.update(woods).set(updates as any).where(and(eq(woods.userId, userId), eq(woods.id, id))).returning();
    return wood;
  }

  async deleteWood(userId: string, id: string): Promise<void> {
    await db.delete(woods).where(and(eq(woods.userId, userId), eq(woods.id, id)));
  }

  // ====== GARNISHES ======
  async getGarnishes(userId: string): Promise<Garnish[]> {
    return db.select().from(garnishes).where(eq(garnishes.userId, userId));
  }

  async createGarnish(data: InsertGarnish): Promise<Garnish> {
    const [garnish] = await db.insert(garnishes).values(data as any).returning();
    return garnish;
  }

  async updateGarnish(userId: string, id: string, updates: Partial<InsertGarnish>): Promise<Garnish | undefined> {
    const [garnish] = await db.update(garnishes).set(updates as any).where(and(eq(garnishes.userId, userId), eq(garnishes.id, id))).returning();
    return garnish;
  }

  async deleteGarnish(userId: string, id: string): Promise<void> {
    await db.delete(garnishes).where(and(eq(garnishes.userId, userId), eq(garnishes.id, id)));
  }

  // ====== RECIPES ======
  async getRecipes(userId: string): Promise<Recipe[]> {
    return db.select().from(recipes).where(eq(recipes.userId, userId));
  }

  async getRecipe(userId: string, id: string): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(and(eq(recipes.userId, userId), eq(recipes.id, id)));
    return recipe;
  }

  async createRecipe(data: InsertRecipe): Promise<Recipe> {
    const [recipe] = await db.insert(recipes).values(data as any).returning();
    return recipe;
  }

  async updateRecipe(userId: string, id: string, updates: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const [recipe] = await db.update(recipes).set(updates as any).where(and(eq(recipes.userId, userId), eq(recipes.id, id))).returning();
    return recipe;
  }

  async deleteRecipe(userId: string, id: string): Promise<void> {
    await db.delete(recipes).where(and(eq(recipes.userId, userId), eq(recipes.id, id)));
  }

  // ====== FAVORITES ======
  async getFavorites(userId: string): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async createFavorite(data: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values(data as any).returning();
    return favorite;
  }

  async updateFavorite(userId: string, id: string, updates: Partial<InsertFavorite>): Promise<Favorite | undefined> {
    const [favorite] = await db.update(favorites).set(updates as any).where(and(eq(favorites.userId, userId), eq(favorites.id, id))).returning();
    return favorite;
  }

  async deleteFavorite(userId: string, id: string): Promise<void> {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.id, id)));
  }

  // ====== COLLECTIONS ======
  async getCollections(userId: string): Promise<Collection[]> {
    return db.select().from(collections).where(eq(collections.userId, userId));
  }

  async createCollection(data: InsertCollection): Promise<Collection> {
    const [collection] = await db.insert(collections).values(data as any).returning();
    return collection;
  }

  async updateCollection(userId: string, id: string, updates: Partial<InsertCollection>): Promise<Collection | undefined> {
    const [collection] = await db.update(collections).set(updates as any).where(and(eq(collections.userId, userId), eq(collections.id, id))).returning();
    return collection;
  }

  async deleteCollection(userId: string, id: string): Promise<void> {
    await db.delete(collections).where(and(eq(collections.userId, userId), eq(collections.id, id)));
  }

  // ====== HISTORY ======
  async getHistory(userId: string): Promise<History[]> {
    return db.select().from(history).where(eq(history.userId, userId)).orderBy(desc(history.timestamp));
  }

  async createHistoryEntry(data: InsertHistory): Promise<History> {
    const [entry] = await db.insert(history).values(data as any).returning();
    return entry;
  }

  // ====== VARIATIONS ======
  async getVariations(userId: string): Promise<Variation[]> {
    return db.select().from(variations).where(eq(variations.userId, userId));
  }

  async createVariation(data: InsertVariation): Promise<Variation> {
    const [variation] = await db.insert(variations).values(data as any).returning();
    return variation;
  }

  // ====== FLIGHTS ======
  async getFlights(userId: string): Promise<Flight[]> {
    return db.select().from(flights).where(eq(flights.userId, userId)).orderBy(desc(flights.createdAt));
  }

  async getFlight(userId: string, id: string): Promise<Flight | undefined> {
    const [flight] = await db.select().from(flights).where(and(eq(flights.userId, userId), eq(flights.id, id)));
    return flight;
  }

  async createFlight(data: InsertFlight): Promise<Flight> {
    const [flight] = await db.insert(flights).values(data as any).returning();
    return flight;
  }

  async deleteFlight(userId: string, id: string): Promise<void> {
    await db.delete(flights).where(and(eq(flights.userId, userId), eq(flights.id, id)));
  }

  // ====== FLIGHT RESULTS ======
  async getFlightResults(userId: string, flightId: string): Promise<FlightResult[]> {
    return db.select().from(flightResults).where(and(eq(flightResults.userId, userId), eq(flightResults.flightId, flightId)));
  }

  async createFlightResult(data: InsertFlightResult): Promise<FlightResult> {
    const [result] = await db.insert(flightResults).values(data as any).returning();
    return result;
  }

  async updateFlightResult(userId: string, id: string, updates: Partial<InsertFlightResult>): Promise<FlightResult | undefined> {
    const [result] = await db.update(flightResults).set(updates as any).where(and(eq(flightResults.userId, userId), eq(flightResults.id, id))).returning();
    return result;
  }

  // ====== PAIRINGS ======
  async getPairings(userId: string): Promise<Pairing[]> {
    return db.select().from(pairings).where(eq(pairings.userId, userId)).orderBy(desc(pairings.createdAt));
  }

  async createPairing(data: InsertPairing): Promise<Pairing> {
    const [pairing] = await db.insert(pairings).values(data as any).returning();
    return pairing;
  }

  // ====== USER SETTINGS ======
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings;
  }

  async upsertUserSettings(userId: string, updates: Partial<InsertUserSettings>): Promise<UserSettings> {
    const existing = await this.getUserSettings(userId);
    if (existing) {
      const [settings] = await db.update(userSettings).set({ ...updates, updatedAt: new Date() } as any).where(eq(userSettings.userId, userId)).returning();
      return settings;
    } else {
      const [settings] = await db.insert(userSettings).values({ userId, ...updates } as any).returning();
      return settings;
    }
  }

  // ====== TOOLS ======
  async getTools(userId: string): Promise<Tool[]> {
    return db.select().from(tools).where(eq(tools.userId, userId));
  }

  async createTool(data: InsertTool): Promise<Tool> {
    const [tool] = await db.insert(tools).values(data as any).returning();
    return tool;
  }

  async updateTool(userId: string, id: string, updates: Partial<InsertTool>): Promise<Tool | undefined> {
    const [tool] = await db.update(tools).set(updates as any).where(and(eq(tools.userId, userId), eq(tools.id, id))).returning();
    return tool;
  }

  async deleteTool(userId: string, id: string): Promise<void> {
    await db.delete(tools).where(and(eq(tools.userId, userId), eq(tools.id, id)));
  }

  // ====== BARCODE MAPPINGS ======
  async getBarcodeMapping(userId: string, barcode: string): Promise<BarcodeMapping | undefined> {
    const [mapping] = await db.select().from(barcodeMappings).where(and(eq(barcodeMappings.userId, userId), eq(barcodeMappings.barcode, barcode)));
    return mapping;
  }

  async createBarcodeMapping(data: InsertBarcodeMapping): Promise<BarcodeMapping> {
    const [mapping] = await db.insert(barcodeMappings).values(data as any).returning();
    return mapping;
  }

  // ====== SEED DATA ======
  async seedUserData(userId: string): Promise<void> {
    const existingSettings = await this.getUserSettings(userId);
    if (existingSettings) return;

    await this.upsertUserSettings(userId, {});
    await this.seedWoods(userId);
    await this.seedGarnishes(userId);
    await this.seedRecipes(userId);
    await this.seedTools(userId);
  }

  private async seedWoods(userId: string): Promise<void> {
    const seedWoods: Omit<InsertWood, 'userId'>[] = [
      { name: 'Apple', intensity: 'light', timeMin: 8, timeMax: 15, purpose: 'Delicate, fruity drinks', tastingNotes: 'Sweet, fruity, subtle', flavorTags: ['fruity', 'clean', 'sweet'], bestWithDrinkTags: ['whiskey', 'bourbon', 'brandy', 'fruity'], bestWithFoodTags: ['pork', 'poultry', 'fruit'], avoidWithDrinkTags: [], beginnerSafe: true, isInKit: true, isBuiltIn: true },
      { name: 'Cherry', intensity: 'light', timeMin: 8, timeMax: 15, purpose: 'Sweet, rich cocktails', tastingNotes: 'Sweet, fruity, mild', flavorTags: ['fruity', 'sweet', 'clean'], bestWithDrinkTags: ['bourbon', 'rum', 'brandy'], bestWithFoodTags: ['pork', 'duck', 'desserts'], avoidWithDrinkTags: [], beginnerSafe: true, isInKit: true, isBuiltIn: true },
      { name: 'Maple', intensity: 'light', timeMin: 8, timeMax: 15, purpose: 'Warm, sweet cocktails', tastingNotes: 'Sweet, mild, slightly nutty', flavorTags: ['sweet', 'nutty', 'clean'], bestWithDrinkTags: ['bourbon', 'whiskey', 'rum'], bestWithFoodTags: ['breakfast', 'pork', 'poultry'], avoidWithDrinkTags: [], beginnerSafe: true, isInKit: true, isBuiltIn: true },
      { name: 'Alder', intensity: 'light', timeMin: 8, timeMax: 15, purpose: 'Light, seafood-friendly drinks', tastingNotes: 'Delicate, slightly sweet', flavorTags: ['clean', 'subtle'], bestWithDrinkTags: ['vodka', 'gin', 'light-rum'], bestWithFoodTags: ['seafood', 'fish', 'vegetables'], avoidWithDrinkTags: ['bold'], beginnerSafe: true, isInKit: false, isBuiltIn: true },
      { name: 'Pecan', intensity: 'medium', timeMin: 6, timeMax: 12, purpose: 'Rich, nutty cocktails', tastingNotes: 'Nutty, rich, slightly sweet', flavorTags: ['nutty', 'toasty', 'rich'], bestWithDrinkTags: ['bourbon', 'whiskey', 'brandy', 'rum'], bestWithFoodTags: ['pork', 'poultry', 'desserts'], avoidWithDrinkTags: [], beginnerSafe: true, isInKit: true, isBuiltIn: true },
      { name: 'Oak', intensity: 'medium', timeMin: 6, timeMax: 12, purpose: 'Classic, versatile smoking', tastingNotes: 'Medium smoke, vanilla notes, classic', flavorTags: ['toasty', 'vanilla', 'classic'], bestWithDrinkTags: ['whiskey', 'bourbon', 'brandy', 'tequila'], bestWithFoodTags: ['beef', 'lamb', 'aged-cheese'], avoidWithDrinkTags: ['delicate'], beginnerSafe: true, isInKit: true, isBuiltIn: true },
      { name: 'Hickory', intensity: 'strong', timeMin: 5, timeMax: 8, purpose: 'Bold, savory cocktails', tastingNotes: 'Strong, bacon-like, savory', flavorTags: ['savory', 'campfire', 'bold'], bestWithDrinkTags: ['bourbon', 'rye', 'mezcal'], bestWithFoodTags: ['bbq', 'beef', 'pork'], avoidWithDrinkTags: ['light', 'fruity'], beginnerSafe: false, isInKit: true, isBuiltIn: true },
      { name: 'Mesquite', intensity: 'very-strong', timeMin: 5, timeMax: 7, purpose: 'Intense, southwestern drinks', tastingNotes: 'Intense, earthy, bold', flavorTags: ['campfire', 'bold', 'earthy'], bestWithDrinkTags: ['mezcal', 'tequila', 'rye'], bestWithFoodTags: ['bbq', 'tex-mex', 'grilled-meats'], avoidWithDrinkTags: ['light', 'sweet', 'fruity'], beginnerSafe: false, isInKit: false, isBuiltIn: true },
      { name: 'Pear', intensity: 'light', timeMin: 8, timeMax: 15, purpose: 'Elegant, fruit-forward drinks', tastingNotes: 'Subtle, fruity, elegant', flavorTags: ['fruity', 'floral', 'clean'], bestWithDrinkTags: ['brandy', 'gin', 'vodka', 'champagne'], bestWithFoodTags: ['cheese', 'salads', 'light-desserts'], avoidWithDrinkTags: ['bold'], beginnerSafe: true, isInKit: false, isBuiltIn: true },
      { name: 'Peach', intensity: 'light', timeMin: 8, timeMax: 15, purpose: 'Sweet, summery cocktails', tastingNotes: 'Sweet, fruity, summery', flavorTags: ['fruity', 'sweet', 'floral'], bestWithDrinkTags: ['bourbon', 'vodka', 'rum', 'champagne'], bestWithFoodTags: ['pork', 'poultry', 'desserts'], avoidWithDrinkTags: ['bitter'], beginnerSafe: true, isInKit: false, isBuiltIn: true },
      { name: 'Walnut', intensity: 'medium', timeMin: 6, timeMax: 12, purpose: 'Rich, complex cocktails', tastingNotes: 'Nutty, bitter, complex', flavorTags: ['nutty', 'bitter', 'earthy'], bestWithDrinkTags: ['whiskey', 'amaro', 'brandy'], bestWithFoodTags: ['aged-cheese', 'chocolate', 'nuts'], avoidWithDrinkTags: ['sweet'], beginnerSafe: false, isInKit: false, isBuiltIn: true },
      { name: 'Olive', intensity: 'medium', timeMin: 6, timeMax: 12, purpose: 'Mediterranean-inspired drinks', tastingNotes: 'Savory, earthy, Mediterranean', flavorTags: ['savory', 'earthy', 'herbal'], bestWithDrinkTags: ['gin', 'vodka', 'vermouth'], bestWithFoodTags: ['mediterranean', 'seafood', 'vegetables'], avoidWithDrinkTags: ['sweet'], beginnerSafe: false, isInKit: false, isBuiltIn: true },
      { name: 'Beech', intensity: 'light', timeMin: 8, timeMax: 15, purpose: 'Clean, European-style smoking', tastingNotes: 'Clean, mild, slightly nutty', flavorTags: ['clean', 'nutty', 'subtle'], bestWithDrinkTags: ['gin', 'vodka', 'whiskey'], bestWithFoodTags: ['fish', 'sausages', 'cheese'], avoidWithDrinkTags: [], beginnerSafe: true, isInKit: false, isBuiltIn: true },
      { name: 'Grapevine', intensity: 'light', timeMin: 8, timeMax: 15, purpose: 'Wine-adjacent cocktails', tastingNotes: 'Tart, fruity, wine-like', flavorTags: ['fruity', 'tart', 'wine-like'], bestWithDrinkTags: ['brandy', 'wine-cocktails', 'vermouth'], bestWithFoodTags: ['lamb', 'mediterranean', 'cheese'], avoidWithDrinkTags: ['heavy'], beginnerSafe: true, isInKit: false, isBuiltIn: true },
      { name: 'Rosemary', intensity: 'medium', timeMin: 3, timeMax: 6, purpose: 'Herbal accent (garnish only)', tastingNotes: 'Piney, herbal, aromatic', flavorTags: ['herbal', 'piney', 'aromatic'], bestWithDrinkTags: ['gin', 'vodka', 'herbal'], bestWithFoodTags: ['lamb', 'poultry', 'mediterranean'], avoidWithDrinkTags: ['sweet'], beginnerSafe: true, isInKit: false, isBuiltIn: true, methodRestriction: 'garnishOnly' },
      { name: 'Cinnamon', intensity: 'medium', timeMin: 3, timeMax: 6, purpose: 'Spiced accent (garnish only)', tastingNotes: 'Sweet, spicy, warm', flavorTags: ['spicy', 'sweet', 'warm'], bestWithDrinkTags: ['rum', 'bourbon', 'tequila', 'hot-drinks'], bestWithFoodTags: ['desserts', 'fall-dishes', 'apple'], avoidWithDrinkTags: ['savory'], beginnerSafe: true, isInKit: false, isBuiltIn: true, methodRestriction: 'garnishOnly' },
    ];

    for (const wood of seedWoods) {
      await this.createWood({ ...wood, userId });
    }
  }

  private async seedGarnishes(userId: string): Promise<void> {
    const seedGarnishes: Omit<InsertGarnish, 'userId'>[] = [
      { name: 'Orange Peel', category: 'citrus', flavorTags: ['citrus', 'sweet', 'bright'], primaryEffect: 'aroma', secondaryEffects: ['visual'], bestWithDrinkTags: ['whiskey', 'bourbon', 'rum'], smokeFriendly: true, prepSteps: ['Cut wide strip avoiding pith', 'Express oils over drink', 'Twist and drop in'], storageTips: 'Refrigerate, use within 3 days', isInBar: true, isBuiltIn: true },
      { name: 'Lemon Peel', category: 'citrus', flavorTags: ['citrus', 'tart', 'bright'], primaryEffect: 'aroma', secondaryEffects: ['visual', 'balance'], bestWithDrinkTags: ['gin', 'vodka', 'whiskey'], smokeFriendly: true, prepSteps: ['Cut wide strip avoiding pith', 'Express oils over drink', 'Twist and drop in'], storageTips: 'Refrigerate, use within 3 days', isInBar: true, isBuiltIn: true },
      { name: 'Lime Peel', category: 'citrus', flavorTags: ['citrus', 'tart', 'zesty'], primaryEffect: 'aroma', secondaryEffects: ['balance'], bestWithDrinkTags: ['rum', 'tequila', 'gin'], smokeFriendly: true, prepSteps: ['Cut wide strip avoiding pith', 'Express oils over drink'], storageTips: 'Refrigerate, use within 2 days', isInBar: true, isBuiltIn: true },
      { name: 'Grapefruit Peel', category: 'citrus', flavorTags: ['citrus', 'bitter', 'floral'], primaryEffect: 'aroma', secondaryEffects: ['visual', 'bitter-balance'], bestWithDrinkTags: ['gin', 'tequila', 'mezcal'], smokeFriendly: true, prepSteps: ['Cut wide strip', 'Express oils', 'Twist and place'], storageTips: 'Refrigerate, use within 3 days', isInBar: false, isBuiltIn: true },
      { name: 'Rosemary Sprig', category: 'herb', flavorTags: ['herbal', 'piney', 'aromatic'], primaryEffect: 'aroma', secondaryEffects: ['visual', 'flavor'], bestWithDrinkTags: ['gin', 'vodka', 'whiskey'], bestWithWoods: ['Rosemary'], smokeFriendly: true, recommendedSmokeMethod: 'garnish-only', recommendedSmokeTimeMin: 3, recommendedSmokeTimeMax: 5, prepSteps: ['Slap gently to release oils', 'Place in drink'], storageTips: 'Refrigerate in damp paper towel', isInBar: true, isBuiltIn: true },
      { name: 'Thyme Sprig', category: 'herb', flavorTags: ['herbal', 'earthy', 'subtle'], primaryEffect: 'aroma', secondaryEffects: ['visual'], bestWithDrinkTags: ['gin', 'vodka', 'whiskey'], smokeFriendly: true, prepSteps: ['Slap gently', 'Place in or on drink'], storageTips: 'Refrigerate in damp paper towel', isInBar: false, isBuiltIn: true },
      { name: 'Mint Sprig', category: 'herb', flavorTags: ['fresh', 'cool', 'herbal'], primaryEffect: 'aroma', secondaryEffects: ['visual', 'cooling'], bestWithDrinkTags: ['rum', 'bourbon', 'gin'], smokeFriendly: false, prepSteps: ['Slap between palms to release oils', 'Place as bouquet'], storageTips: 'Store stems in water, refrigerate', isInBar: true, isBuiltIn: true },
      { name: 'Sage Leaf', category: 'herb', flavorTags: ['herbal', 'savory', 'earthy'], primaryEffect: 'aroma', secondaryEffects: ['visual'], bestWithDrinkTags: ['whiskey', 'tequila', 'mezcal'], smokeFriendly: true, prepSteps: ['Slap gently', 'Float on top'], storageTips: 'Refrigerate, use within 5 days', isInBar: false, isBuiltIn: true },
      { name: 'Cinnamon Stick', category: 'spice', flavorTags: ['spicy', 'sweet', 'warm'], primaryEffect: 'flavor', secondaryEffects: ['aroma', 'visual'], bestWithDrinkTags: ['rum', 'bourbon', 'brandy', 'hot-drinks'], bestWithWoods: ['Cinnamon'], smokeFriendly: true, recommendedSmokeMethod: 'garnish-only', recommendedSmokeTimeMin: 3, recommendedSmokeTimeMax: 5, prepSteps: ['Torch briefly to activate', 'Place in drink'], storageTips: 'Store dry, indefinite shelf life', isInBar: true, isBuiltIn: true },
      { name: 'Star Anise', category: 'spice', flavorTags: ['licorice', 'sweet', 'aromatic'], primaryEffect: 'aroma', secondaryEffects: ['visual', 'flavor'], bestWithDrinkTags: ['whiskey', 'rum', 'absinthe'], smokeFriendly: true, prepSteps: ['Float on top of drink'], storageTips: 'Store dry', isInBar: false, isBuiltIn: true },
      { name: 'Clove', category: 'spice', flavorTags: ['spicy', 'warm', 'intense'], primaryEffect: 'aroma', secondaryEffects: ['flavor'], bestWithDrinkTags: ['rum', 'whiskey', 'hot-drinks'], smokeFriendly: true, prepSteps: ['Stud citrus wheel or use whole'], storageTips: 'Store dry', isInBar: false, isBuiltIn: true },
      { name: 'Fresh Nutmeg', category: 'spice', flavorTags: ['nutty', 'warm', 'spicy'], primaryEffect: 'aroma', secondaryEffects: ['visual'], bestWithDrinkTags: ['rum', 'brandy', 'egg-drinks'], smokeFriendly: false, prepSteps: ['Grate fresh over top of drink'], storageTips: 'Store whole nuts dry', isInBar: false, isBuiltIn: true },
      { name: 'Luxardo Cherry', category: 'fruit', flavorTags: ['sweet', 'rich', 'cherry'], primaryEffect: 'flavor', secondaryEffects: ['visual', 'sweetness'], bestWithDrinkTags: ['whiskey', 'bourbon', 'manhattan'], smokeFriendly: true, prepSteps: ['Skewer or drop in glass'], storageTips: 'Refrigerate after opening', isInBar: true, isBuiltIn: true },
      { name: 'Brandied Cherry', category: 'fruit', flavorTags: ['sweet', 'boozy', 'cherry'], primaryEffect: 'flavor', secondaryEffects: ['visual'], bestWithDrinkTags: ['whiskey', 'bourbon', 'brandy'], smokeFriendly: true, prepSteps: ['Skewer or drop in glass'], storageTips: 'Refrigerate after opening', isInBar: false, isBuiltIn: true },
      { name: 'Dehydrated Orange Wheel', category: 'fruit', flavorTags: ['citrus', 'sweet', 'caramelized'], primaryEffect: 'visual', secondaryEffects: ['aroma'], bestWithDrinkTags: ['whiskey', 'rum', 'gin'], smokeFriendly: true, prepSteps: ['Float on drink or clip to rim'], storageTips: 'Store dry in airtight container', isInBar: true, isBuiltIn: true },
      { name: 'Dehydrated Lemon Wheel', category: 'fruit', flavorTags: ['citrus', 'tart', 'concentrated'], primaryEffect: 'visual', secondaryEffects: ['aroma'], bestWithDrinkTags: ['gin', 'vodka', 'whiskey'], smokeFriendly: true, prepSteps: ['Float on drink or clip to rim'], storageTips: 'Store dry in airtight container', isInBar: false, isBuiltIn: true },
      { name: 'Blackberry', category: 'fruit', flavorTags: ['berry', 'sweet', 'tart'], primaryEffect: 'visual', secondaryEffects: ['flavor'], bestWithDrinkTags: ['gin', 'bourbon', 'rum'], smokeFriendly: false, prepSteps: ['Muddle or skewer whole'], storageTips: 'Refrigerate, use within 3 days', isInBar: false, isBuiltIn: true },
      { name: 'Olive', category: 'savory', flavorTags: ['briny', 'savory', 'salty'], primaryEffect: 'flavor', secondaryEffects: ['visual'], bestWithDrinkTags: ['gin', 'vodka', 'martini'], smokeFriendly: false, prepSteps: ['Skewer 1-3 olives'], storageTips: 'Refrigerate in brine', isInBar: true, isBuiltIn: true },
      { name: 'Cocktail Onion', category: 'savory', flavorTags: ['briny', 'savory', 'tangy'], primaryEffect: 'flavor', secondaryEffects: ['visual'], bestWithDrinkTags: ['gin', 'vodka', 'gibson'], smokeFriendly: false, prepSteps: ['Skewer 2-3 onions'], storageTips: 'Refrigerate in brine', isInBar: false, isBuiltIn: true },
      { name: 'Smoked Salt Rim', category: 'rim', flavorTags: ['smoky', 'salty', 'savory'], primaryEffect: 'flavor', secondaryEffects: ['balance'], bestWithDrinkTags: ['margarita', 'mezcal', 'bloody-mary'], smokeFriendly: true, prepSteps: ['Wet rim with citrus', 'Dip in salt'], storageTips: 'Store dry', isInBar: true, isBuiltIn: true },
      { name: 'Demerara Sugar Rim', category: 'rim', flavorTags: ['sweet', 'caramel', 'rich'], primaryEffect: 'sweetness', secondaryEffects: ['texture'], bestWithDrinkTags: ['rum', 'whiskey', 'brandy'], smokeFriendly: true, prepSteps: ['Wet rim with citrus or simple syrup', 'Dip in sugar'], storageTips: 'Store dry', isInBar: false, isBuiltIn: true },
      { name: 'Chili-Salt Rim', category: 'rim', flavorTags: ['spicy', 'salty', 'bold'], primaryEffect: 'flavor', secondaryEffects: ['heat'], bestWithDrinkTags: ['margarita', 'tequila', 'mezcal'], smokeFriendly: true, prepSteps: ['Wet rim with citrus', 'Dip in chili-salt mix'], storageTips: 'Store dry', isInBar: false, isBuiltIn: true },
    ];

    for (const garnish of seedGarnishes) {
      await this.createGarnish({ ...garnish, userId });
    }
  }

  private async seedRecipes(userId: string): Promise<void> {
    const seedRecipes: Omit<InsertRecipe, 'userId'>[] = [
      { name: 'Old Fashioned', description: 'The quintessential whiskey cocktail', baseSpirit: 'bourbon', style: 'classic', category: 'alcoholic', ingredients: [{ name: 'Bourbon', amount: '2', unit: 'oz' }, { name: 'Sugar', amount: '1', unit: 'tsp' }, { name: 'Angostura Bitters', amount: '2', unit: 'dashes' }, { name: 'Water', amount: 'splash', unit: '' }], steps: ['Muddle sugar and bitters with water', 'Add bourbon and ice', 'Stir until chilled', 'Garnish with orange peel'], glassware: 'rocks', garnish: 'Orange peel, cherry', tags: ['classic', 'whiskey', 'spirit-forward'], isSmoked: false, recommendedWood: 'Cherry', isBuiltIn: true },
      { name: 'Manhattan', description: 'Elegant rye and vermouth cocktail', baseSpirit: 'rye', style: 'classic', category: 'alcoholic', ingredients: [{ name: 'Rye Whiskey', amount: '2', unit: 'oz' }, { name: 'Sweet Vermouth', amount: '1', unit: 'oz' }, { name: 'Angostura Bitters', amount: '2', unit: 'dashes' }], steps: ['Stir all ingredients with ice', 'Strain into chilled glass', 'Garnish with cherry'], glassware: 'coupe', garnish: 'Luxardo cherry', tags: ['classic', 'rye', 'elegant'], isSmoked: false, recommendedWood: 'Oak', isBuiltIn: true },
      { name: 'Negroni', description: 'Bold, bitter Italian aperitivo', baseSpirit: 'gin', style: 'classic', category: 'alcoholic', ingredients: [{ name: 'Gin', amount: '1', unit: 'oz' }, { name: 'Campari', amount: '1', unit: 'oz' }, { name: 'Sweet Vermouth', amount: '1', unit: 'oz' }], steps: ['Stir all with ice', 'Strain over fresh ice', 'Garnish with orange peel'], glassware: 'rocks', garnish: 'Orange peel', tags: ['classic', 'bitter', 'aperitivo'], isSmoked: false, isBuiltIn: true },
      { name: 'Margarita', description: 'Classic tequila citrus cocktail', baseSpirit: 'tequila', style: 'classic', category: 'alcoholic', ingredients: [{ name: 'Tequila Blanco', amount: '2', unit: 'oz' }, { name: 'Fresh Lime Juice', amount: '1', unit: 'oz' }, { name: 'Triple Sec', amount: '0.75', unit: 'oz' }], steps: ['Shake all with ice', 'Strain into salted glass', 'Garnish with lime wheel'], glassware: 'rocks', garnish: 'Lime wheel, salt rim', tags: ['classic', 'citrus', 'refreshing'], isSmoked: false, isBuiltIn: true },
      { name: 'Whiskey Sour', description: 'Balanced whiskey citrus cocktail', baseSpirit: 'bourbon', style: 'classic', category: 'alcoholic', ingredients: [{ name: 'Bourbon', amount: '2', unit: 'oz' }, { name: 'Fresh Lemon Juice', amount: '0.75', unit: 'oz' }, { name: 'Simple Syrup', amount: '0.75', unit: 'oz' }, { name: 'Egg White', amount: '1', unit: '', isOptional: true }], steps: ['Dry shake with egg white', 'Add ice and shake again', 'Strain into glass', 'Garnish with cherry'], glassware: 'rocks', garnish: 'Cherry, lemon peel', tags: ['classic', 'sour', 'citrus'], isSmoked: false, isBuiltIn: true },
      { name: 'Daiquiri', description: 'Perfect balance of rum and citrus', baseSpirit: 'rum', style: 'classic', category: 'alcoholic', ingredients: [{ name: 'White Rum', amount: '2', unit: 'oz' }, { name: 'Fresh Lime Juice', amount: '1', unit: 'oz' }, { name: 'Simple Syrup', amount: '0.75', unit: 'oz' }], steps: ['Shake all with ice', 'Strain into chilled coupe', 'Garnish with lime wheel'], glassware: 'coupe', garnish: 'Lime wheel', tags: ['classic', 'rum', 'refreshing'], isSmoked: false, isBuiltIn: true },
      { name: 'Mojito', description: 'Refreshing rum and mint highball', baseSpirit: 'rum', style: 'classic', category: 'alcoholic', ingredients: [{ name: 'White Rum', amount: '2', unit: 'oz' }, { name: 'Fresh Lime Juice', amount: '1', unit: 'oz' }, { name: 'Simple Syrup', amount: '0.75', unit: 'oz' }, { name: 'Mint Leaves', amount: '8', unit: '' }, { name: 'Soda Water', amount: 'top', unit: '' }], steps: ['Muddle mint with syrup', 'Add rum and lime', 'Shake and strain over ice', 'Top with soda'], glassware: 'highball', garnish: 'Mint sprig', tags: ['classic', 'refreshing', 'minty'], isSmoked: false, isBuiltIn: true },
      { name: 'Martini', description: 'Iconic gin or vodka cocktail', baseSpirit: 'gin', style: 'classic', category: 'alcoholic', ingredients: [{ name: 'Gin', amount: '2.5', unit: 'oz' }, { name: 'Dry Vermouth', amount: '0.5', unit: 'oz' }], steps: ['Stir with ice until very cold', 'Strain into chilled glass', 'Garnish with olive or lemon'], glassware: 'martini', garnish: 'Olive or lemon twist', tags: ['classic', 'elegant', 'spirit-forward'], isSmoked: false, isBuiltIn: true },
      { name: 'Moscow Mule', description: 'Vodka ginger beer refresher', baseSpirit: 'vodka', style: 'classic', category: 'alcoholic', ingredients: [{ name: 'Vodka', amount: '2', unit: 'oz' }, { name: 'Fresh Lime Juice', amount: '0.5', unit: 'oz' }, { name: 'Ginger Beer', amount: '4', unit: 'oz' }], steps: ['Build in copper mug with ice', 'Add vodka and lime', 'Top with ginger beer', 'Stir gently'], glassware: 'mule-mug', garnish: 'Lime wheel, mint', tags: ['classic', 'refreshing', 'ginger'], isSmoked: false, isBuiltIn: true },
      { name: 'Boulevardier', description: 'Whiskey-based Negroni variation', baseSpirit: 'bourbon', style: 'classic', category: 'alcoholic', ingredients: [{ name: 'Bourbon', amount: '1.25', unit: 'oz' }, { name: 'Sweet Vermouth', amount: '1', unit: 'oz' }, { name: 'Campari', amount: '1', unit: 'oz' }], steps: ['Stir all with ice', 'Strain over fresh ice', 'Garnish with orange peel'], glassware: 'rocks', garnish: 'Orange peel', tags: ['classic', 'bitter', 'whiskey'], isSmoked: false, recommendedWood: 'Oak', isBuiltIn: true },
      { name: 'Smoked Old Fashioned', description: 'Classic cocktail with wood smoke', baseSpirit: 'bourbon', style: 'smoky', category: 'alcoholic', ingredients: [{ name: 'Bourbon', amount: '2', unit: 'oz' }, { name: 'Demerara Syrup', amount: '0.25', unit: 'oz' }, { name: 'Angostura Bitters', amount: '1', unit: 'dash' }], steps: ['Smoke glass with wood chips', 'Add all ingredients', 'Add ice and stir', 'Garnish with orange peel'], glassware: 'rocks', garnish: 'Orange peel, cherry', tags: ['smoky', 'whiskey', 'spirit-forward'], isSmoked: true, recommendedWood: 'Cherry', smokeTime: 10, smokeMethod: 'glass', isBuiltIn: true },
      { name: 'Shirley Temple', description: 'Classic kid-friendly mocktail', baseSpirit: 'none', style: 'classic', category: 'kid-friendly', ingredients: [{ name: 'Ginger Ale', amount: '6', unit: 'oz' }, { name: 'Grenadine', amount: '1', unit: 'oz' }], steps: ['Fill glass with ice', 'Add ginger ale', 'Add grenadine', 'Garnish with cherry'], glassware: 'highball', garnish: 'Maraschino cherry', tags: ['kid-friendly', 'sweet', 'classic'], isSmoked: false, isBuiltIn: true },
      { name: 'Roy Rogers', description: 'Cola-based kid-friendly drink', baseSpirit: 'none', style: 'classic', category: 'kid-friendly', ingredients: [{ name: 'Cola', amount: '6', unit: 'oz' }, { name: 'Grenadine', amount: '1', unit: 'oz' }], steps: ['Fill glass with ice', 'Add cola', 'Add grenadine', 'Garnish with cherry'], glassware: 'highball', garnish: 'Maraschino cherry', tags: ['kid-friendly', 'sweet', 'cola'], isSmoked: false, hasCaffeine: true, isBuiltIn: true },
      { name: 'Virgin Mojito', description: 'Refreshing mint and lime mocktail', baseSpirit: 'none', style: 'classic', category: 'mocktail', ingredients: [{ name: 'Fresh Lime Juice', amount: '1', unit: 'oz' }, { name: 'Simple Syrup', amount: '0.75', unit: 'oz' }, { name: 'Mint Leaves', amount: '8', unit: '' }, { name: 'Soda Water', amount: 'top', unit: '' }], steps: ['Muddle mint with syrup', 'Add lime juice', 'Add ice and soda', 'Stir gently'], glassware: 'highball', garnish: 'Mint sprig', tags: ['mocktail', 'refreshing', 'minty'], isSmoked: false, isBuiltIn: true },
      { name: 'Virgin Piña Colada', description: 'Tropical coconut pineapple mocktail', baseSpirit: 'none', style: 'tiki', category: 'mocktail', ingredients: [{ name: 'Pineapple Juice', amount: '4', unit: 'oz' }, { name: 'Coconut Cream', amount: '2', unit: 'oz' }, { name: 'Ice', amount: '1', unit: 'cup' }], steps: ['Blend all with ice', 'Pour into glass', 'Garnish with pineapple'], glassware: 'hurricane', garnish: 'Pineapple wedge, cherry', tags: ['mocktail', 'tropical', 'creamy'], isSmoked: false, isBuiltIn: true },
    ];

    for (const recipe of seedRecipes) {
      await this.createRecipe({ ...recipe, userId });
    }
  }

  private async seedTools(userId: string): Promise<void> {
    const seedTools = [
      { name: 'Cocktail Shaker', category: 'mixing', isOwned: true },
      { name: 'Jigger', category: 'measuring', isOwned: true },
      { name: 'Bar Spoon', category: 'mixing', isOwned: true },
      { name: 'Strainer', category: 'straining', isOwned: true },
      { name: 'Muddler', category: 'mixing', isOwned: true },
      { name: 'Cocktail Smoker', category: 'smoking', isOwned: false },
      { name: 'Torch', category: 'smoking', isOwned: false },
      { name: 'Mixing Glass', category: 'mixing', isOwned: false },
      { name: 'Fine Strainer', category: 'straining', isOwned: false },
      { name: 'Citrus Juicer', category: 'prep', isOwned: true },
    ];

    for (const tool of seedTools) {
      await this.createTool({ ...tool, userId });
    }
  }

  // ====== PUBLIC DATA (FOR GUESTS) ======
  async healthCheck(): Promise<boolean> {
    try {
      await db.execute(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  }

  async getBuiltInRecipes(): Promise<Recipe[]> {
    return db.select().from(recipes).where(eq(recipes.isBuiltIn, true));
  }

  async getBuiltInWoods(): Promise<Wood[]> {
    return db.select().from(woods).where(eq(woods.isBuiltIn, true));
  }

  async getBuiltInGarnishes(): Promise<Garnish[]> {
    return db.select().from(garnishes).where(eq(garnishes.isBuiltIn, true));
  }
}

export const storage = new DatabaseStorage();
