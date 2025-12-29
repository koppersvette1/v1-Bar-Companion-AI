import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// People Profiles
export const people = pgTable("people", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sweetnessPref: text("sweetness_pref").notNull().$type<'dry' | 'balanced' | 'sweet'>(),
  abvComfort: text("abv_comfort").notNull().$type<'low' | 'medium' | 'high'>(),
  likedTags: text("liked_tags").array().notNull().default(sql`'{}'`),
  dislikedTags: text("disliked_tags").array().notNull().default(sql`'{}'`),
  seasonalPref: text("seasonal_pref").notNull().$type<'neutral' | 'warm-weather' | 'cool-weather'>().default('neutral'),
  tasteWeights: jsonb("taste_weights").notNull().default('{}'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPersonSchema = createInsertSchema(people).omit({
  id: true,
  createdAt: true,
});

export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type Person = typeof people.$inferSelect;

// Inventory Items
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand"),
  category: text("category").notNull(),
  subtype: text("subtype"),
  abv: real("abv"),
  photo: text("photo"),
  notes: text("notes"),
  quantity: integer("quantity").notNull().default(1),
  bottleSizeMl: integer("bottle_size_ml"),
  price: real("price"),
  store: text("store"),
  tags: text("tags").array().notNull().default(sql`'{}'`),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  updatedAt: true,
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

// History Entries
export const history = pgTable("history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipeId: text("recipe_id").notNull(),
  recipeName: text("recipe_name").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  rating: integer("rating"),
  notes: text("notes"),
  tuning: jsonb("tuning"),
  smoked: jsonb("smoked"),
});

export const insertHistorySchema = createInsertSchema(history).omit({
  id: true,
  timestamp: true,
});

export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type History = typeof history.$inferSelect;

// Favorites (Recipe IDs)
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipeId: text("recipe_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// Wood Library (User's Kit)
export const woodKit = pgTable("wood_kit", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  woodId: text("wood_id").notNull().unique(),
  isInKit: boolean("is_in_kit").notNull().default(false),
});

export const insertWoodKitSchema = createInsertSchema(woodKit).omit({
  id: true,
});

export type InsertWoodKit = z.infer<typeof insertWoodKitSchema>;
export type WoodKit = typeof woodKit.$inferSelect;

// User Settings
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  hasSmoker: boolean("has_smoker").notNull().default(false),
  smokerDeviceName: text("smoker_device_name"),
  defaultIntensity: text("default_intensity").notNull().$type<'light' | 'medium' | 'bold' | 'very-strong'>().default('medium'),
  enableCostTracking: boolean("enable_cost_tracking").notNull().default(false),
  debugMode: boolean("debug_mode").notNull().default(false),
  woodAffinity: jsonb("wood_affinity").notNull().default('{}'),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// Custom Recipes (User-created or imported)
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  baseSpirit: text("base_spirit").notNull(),
  style: text("style").notNull().$type<'classic' | 'modern' | 'tiki' | 'smoky' | 'low-abv'>(),
  ingredients: jsonb("ingredients").notNull(),
  steps: text("steps").array().notNull(),
  glassware: text("glassware").notNull(),
  garnish: text("garnish").notNull(),
  isSmoked: boolean("is_smoked").notNull().default(false),
  recommendedWood: text("recommended_wood"),
  smokeTime: integer("smoke_time"),
  tags: text("tags").array().notNull().default(sql`'{}'`),
  sourceUrl: text("source_url"),
  sourceName: text("source_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  createdAt: true,
});

export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
