import {
  people,
  inventory,
  history,
  favorites,
  woodKit,
  settings,
  recipes,
  type Person,
  type InsertPerson,
  type Inventory,
  type InsertInventory,
  type History,
  type InsertHistory,
  type Favorite,
  type InsertFavorite,
  type WoodKit,
  type InsertWoodKit,
  type Settings,
  type InsertSettings,
  type Recipe,
  type InsertRecipe,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // People Profiles
  getPeople(): Promise<Person[]>;
  getPerson(id: string): Promise<Person | undefined>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: string, updates: Partial<InsertPerson>): Promise<Person | undefined>;
  deletePerson(id: string): Promise<void>;

  // Inventory
  getInventory(): Promise<Inventory[]>;
  getInventoryItem(id: string): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: string, updates: Partial<InsertInventory>): Promise<Inventory | undefined>;
  deleteInventoryItem(id: string): Promise<void>;

  // History
  getHistory(): Promise<History[]>;
  createHistoryEntry(entry: InsertHistory): Promise<History>;

  // Favorites
  getFavorites(): Promise<Favorite[]>;
  addFavorite(recipeId: string): Promise<Favorite>;
  removeFavorite(recipeId: string): Promise<void>;
  isFavorite(recipeId: string): Promise<boolean>;

  // Wood Kit
  getWoodKit(): Promise<WoodKit[]>;
  updateWoodKit(woodId: string, isInKit: boolean): Promise<WoodKit>;

  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(updates: Partial<InsertSettings>): Promise<Settings>;

  // Custom Recipes
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: string): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  deleteRecipe(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // People Profiles
  async getPeople(): Promise<Person[]> {
    return db.select().from(people);
  }

  async getPerson(id: string): Promise<Person | undefined> {
    const [person] = await db.select().from(people).where(eq(people.id, id));
    return person || undefined;
  }

  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const [person] = await db.insert(people).values(insertPerson).returning();
    return person;
  }

  async updatePerson(id: string, updates: Partial<InsertPerson>): Promise<Person | undefined> {
    const [person] = await db
      .update(people)
      .set(updates)
      .where(eq(people.id, id))
      .returning();
    return person || undefined;
  }

  async deletePerson(id: string): Promise<void> {
    await db.delete(people).where(eq(people.id, id));
  }

  // Inventory
  async getInventory(): Promise<Inventory[]> {
    return db.select().from(inventory);
  }

  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item || undefined;
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const [item] = await db.insert(inventory).values(insertItem).returning();
    return item;
  }

  async updateInventoryItem(id: string, updates: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const [item] = await db
      .update(inventory)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventory.id, id))
      .returning();
    return item || undefined;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  // History
  async getHistory(): Promise<History[]> {
    return db.select().from(history);
  }

  async createHistoryEntry(insertEntry: InsertHistory): Promise<History> {
    const [entry] = await db.insert(history).values(insertEntry).returning();
    return entry;
  }

  // Favorites
  async getFavorites(): Promise<Favorite[]> {
    return db.select().from(favorites);
  }

  async addFavorite(recipeId: string): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values({ recipeId }).returning();
    return favorite;
  }

  async removeFavorite(recipeId: string): Promise<void> {
    await db.delete(favorites).where(eq(favorites.recipeId, recipeId));
  }

  async isFavorite(recipeId: string): Promise<boolean> {
    const [fav] = await db.select().from(favorites).where(eq(favorites.recipeId, recipeId));
    return !!fav;
  }

  // Wood Kit
  async getWoodKit(): Promise<WoodKit[]> {
    return db.select().from(woodKit);
  }

  async updateWoodKit(woodId: string, isInKit: boolean): Promise<WoodKit> {
    const [existing] = await db.select().from(woodKit).where(eq(woodKit.woodId, woodId));
    
    if (existing) {
      const [updated] = await db
        .update(woodKit)
        .set({ isInKit })
        .where(eq(woodKit.woodId, woodId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(woodKit).values({ woodId, isInKit }).returning();
      return created;
    }
  }

  // Settings
  async getSettings(): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).limit(1);
    return setting || undefined;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    const existing = await this.getSettings();
    
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set(updates)
        .where(eq(settings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(settings)
        .values({
          email: updates.email || 'user@example.com',
          hasSmoker: updates.hasSmoker || false,
          defaultIntensity: updates.defaultIntensity || 'medium',
          enableCostTracking: updates.enableCostTracking || false,
          debugMode: updates.debugMode || false,
          woodAffinity: updates.woodAffinity || {},
          ...updates,
        })
        .returning();
      return created;
    }
  }

  // Custom Recipes
  async getRecipes(): Promise<Recipe[]> {
    return db.select().from(recipes);
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe || undefined;
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const [recipe] = await db.insert(recipes).values(insertRecipe).returning();
    return recipe;
  }

  async deleteRecipe(id: string): Promise<void> {
    await db.delete(recipes).where(eq(recipes.id, id));
  }
}

export const storage = new DatabaseStorage();
