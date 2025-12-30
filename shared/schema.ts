import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

// ====== PEOPLE PROFILES ======
export const people = pgTable("people", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  sweetnessPref: text("sweetness_pref").notNull().$type<'dry' | 'balanced' | 'sweet'>().default('balanced'),
  abvComfortMin: real("abv_comfort_min").notNull().default(0),
  abvComfortMax: real("abv_comfort_max").notNull().default(40),
  styleChips: text("style_chips").array().notNull().default(sql`'{}'`),
  dislikes: text("dislikes").array().notNull().default(sql`'{}'`),
  seasonalPref: text("seasonal_pref").notNull().$type<'neutral' | 'warm-weather' | 'cool-weather'>().default('neutral'),
  dryWinePref: boolean("dry_wine_pref").notNull().default(true),
  wineAbvComfort: real("wine_abv_comfort").notNull().default(13.5),
  preferredGarnishCategories: text("preferred_garnish_categories").array().notNull().default(sql`'{}'`),
  dislikedGarnishTags: text("disliked_garnish_tags").array().notNull().default(sql`'{}'`),
  defaultCitrus: text("default_citrus"),
  tasteWeights: jsonb("taste_weights").notNull().default('{}'),
  woodAffinities: jsonb("wood_affinities").notNull().default('{}'),
  garnishAffinities: jsonb("garnish_affinities").notNull().default('{}'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("people_user_idx").on(table.userId)]);

export const insertPersonSchema = createInsertSchema(people).omit({ id: true, createdAt: true });
export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type Person = typeof people.$inferSelect;

// ====== INVENTORY ITEMS ======
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  brand: text("brand"),
  category: text("category").notNull(),
  subtype: text("subtype"),
  abv: real("abv"),
  bottleSizeMl: integer("bottle_size_ml"),
  quantity: integer("quantity").notNull().default(1),
  photo: text("photo"),
  notes: text("notes"),
  tags: text("tags").array().notNull().default(sql`'{}'`),
  price: real("price"),
  store: text("store"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [index("inventory_user_idx").on(table.userId)]);

export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, updatedAt: true });
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

// ====== BARCODE MAPPINGS (learn from edits) ======
export const barcodeMappings = pgTable("barcode_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  barcode: text("barcode").notNull(),
  productData: jsonb("product_data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("barcode_user_idx").on(table.userId, table.barcode)]);

export const insertBarcodeMappingSchema = createInsertSchema(barcodeMappings).omit({ id: true, createdAt: true });
export type InsertBarcodeMapping = z.infer<typeof insertBarcodeMappingSchema>;
export type BarcodeMapping = typeof barcodeMappings.$inferSelect;

// ====== TOOLS ======
export const tools = pgTable("tools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  isOwned: boolean("is_owned").notNull().default(true),
  notes: text("notes"),
}, (table) => [index("tools_user_idx").on(table.userId)]);

export const insertToolSchema = createInsertSchema(tools).omit({ id: true });
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof tools.$inferSelect;

// ====== WOOD PROFILES ======
export const woods = pgTable("woods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  intensity: text("intensity").notNull().$type<'light' | 'medium' | 'strong' | 'very-strong'>(),
  timeMin: integer("time_min").notNull(),
  timeMax: integer("time_max").notNull(),
  purpose: text("purpose").notNull(),
  tastingNotes: text("tasting_notes").notNull(),
  flavorTags: text("flavor_tags").array().notNull().default(sql`'{}'`),
  bestWithDrinkTags: text("best_with_drink_tags").array().notNull().default(sql`'{}'`),
  bestWithFoodTags: text("best_with_food_tags").array().notNull().default(sql`'{}'`),
  avoidWithDrinkTags: text("avoid_with_drink_tags").array().notNull().default(sql`'{}'`),
  beginnerSafe: boolean("beginner_safe").notNull().default(true),
  isInKit: boolean("is_in_kit").notNull().default(false),
  methodRestriction: text("method_restriction").$type<'garnishOnly' | null>(),
  costPerUse: real("cost_per_use"),
  isBuiltIn: boolean("is_built_in").notNull().default(false),
}, (table) => [index("woods_user_idx").on(table.userId)]);

export const insertWoodSchema = createInsertSchema(woods).omit({ id: true });
export type InsertWood = z.infer<typeof insertWoodSchema>;
export type Wood = typeof woods.$inferSelect;

// ====== GARNISHES ======
export const garnishes = pgTable("garnishes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().$type<'citrus' | 'herb' | 'spice' | 'fruit' | 'savory' | 'rim' | 'other'>(),
  flavorTags: text("flavor_tags").array().notNull().default(sql`'{}'`),
  primaryEffect: text("primary_effect").notNull(),
  secondaryEffects: text("secondary_effects").array().notNull().default(sql`'{}'`),
  bestWithDrinkTags: text("best_with_drink_tags").array().notNull().default(sql`'{}'`),
  bestWithWoods: text("best_with_woods").array().notNull().default(sql`'{}'`),
  smokeFriendly: boolean("smoke_friendly").notNull().default(false),
  recommendedSmokeMethod: text("recommended_smoke_method").$type<'none' | 'garnish-only' | null>(),
  recommendedSmokeTimeMin: integer("recommended_smoke_time_min"),
  recommendedSmokeTimeMax: integer("recommended_smoke_time_max"),
  prepSteps: jsonb("prep_steps").notNull().default('[]'),
  storageTips: text("storage_tips"),
  notes: text("notes"),
  isInBar: boolean("is_in_bar").notNull().default(false),
  photos: text("photos").array().notNull().default(sql`'{}'`),
  costPerUse: real("cost_per_use"),
  isBuiltIn: boolean("is_built_in").notNull().default(false),
}, (table) => [index("garnishes_user_idx").on(table.userId)]);

export const insertGarnishSchema = createInsertSchema(garnishes).omit({ id: true });
export type InsertGarnish = z.infer<typeof insertGarnishSchema>;
export type Garnish = typeof garnishes.$inferSelect;

// ====== RECIPES (Cocktails) ======
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  baseSpirit: text("base_spirit").notNull(),
  style: text("style").notNull(),
  category: text("category").notNull().$type<'alcoholic' | 'mocktail' | 'kid-friendly'>().default('alcoholic'),
  ingredients: jsonb("ingredients").notNull(),
  steps: text("steps").array().notNull(),
  glassware: text("glassware").notNull(),
  garnish: text("garnish").notNull(),
  tags: text("tags").array().notNull().default(sql`'{}'`),
  isSmoked: boolean("is_smoked").notNull().default(false),
  recommendedWood: text("recommended_wood"),
  smokeTime: integer("smoke_time"),
  smokeMethod: text("smoke_method").$type<'glass' | 'garnish' | 'cocktail' | null>(),
  sourceUrl: text("source_url"),
  sourceName: text("source_name"),
  isBuiltIn: boolean("is_built_in").notNull().default(false),
  hasCaffeine: boolean("has_caffeine").notNull().default(false),
  hasSpicy: boolean("has_spicy").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("recipes_user_idx").on(table.userId)]);

export const insertRecipeSchema = createInsertSchema(recipes).omit({ id: true, createdAt: true });
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;

// ====== FAVORITES ======
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  recipeId: varchar("recipe_id").notNull(),
  collectionId: varchar("collection_id"),
  personIds: text("person_ids").array().notNull().default(sql`'{}'`),
  notes: text("notes"),
  tags: text("tags").array().notNull().default(sql`'{}'`),
  isPinned: boolean("is_pinned").notNull().default(false),
  preferredWood: text("preferred_wood"),
  preferredMethod: text("preferred_method"),
  preferredTime: integer("preferred_time"),
  preferredGarnish: text("preferred_garnish"),
  preferredGlass: text("preferred_glass"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("favorites_user_idx").on(table.userId)]);

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// ====== COLLECTIONS (Folders for Favorites) ======
export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("collections_user_idx").on(table.userId)]);

export const insertCollectionSchema = createInsertSchema(collections).omit({ id: true, createdAt: true });
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

// ====== HISTORY (Made Drinks) ======
export const history = pgTable("history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  recipeId: varchar("recipe_id").notNull(),
  recipeName: text("recipe_name").notNull(),
  madeForPersonId: varchar("made_for_person_id"),
  rating: integer("rating"),
  notes: text("notes"),
  tuning: jsonb("tuning"),
  smoked: jsonb("smoked"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => [index("history_user_idx").on(table.userId)]);

export const insertHistorySchema = createInsertSchema(history).omit({ id: true, timestamp: true });
export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type History = typeof history.$inferSelect;

// ====== VARIATIONS (Tuned Recipes) ======
export const variations = pgTable("variations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  baseRecipeId: varchar("base_recipe_id").notNull(),
  name: text("name").notNull(),
  beforeState: jsonb("before_state").notNull(),
  afterState: jsonb("after_state").notNull(),
  reasoning: text("reasoning").notNull(),
  chips: text("chips").array().notNull().default(sql`'{}'`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("variations_user_idx").on(table.userId)]);

export const insertVariationSchema = createInsertSchema(variations).omit({ id: true, createdAt: true });
export type InsertVariation = z.infer<typeof insertVariationSchema>;
export type Variation = typeof variations.$inferSelect;

// ====== FLIGHTS ======
export const flights = pgTable("flights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().$type<'alcoholic' | 'na' | 'kid-friendly'>(),
  theme: text("theme").notNull(),
  recipeIds: text("recipe_ids").array().notNull(),
  personId: varchar("person_id"),
  pourSize: text("pour_size").notNull().default('tasting'),
  smokerPlan: jsonb("smoker_plan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("flights_user_idx").on(table.userId)]);

export const insertFlightSchema = createInsertSchema(flights).omit({ id: true, createdAt: true });
export type InsertFlight = z.infer<typeof insertFlightSchema>;
export type Flight = typeof flights.$inferSelect;

// ====== FLIGHT RESULTS ======
export const flightResults = pgTable("flight_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  flightId: varchar("flight_id").notNull(),
  recipeId: varchar("recipe_id").notNull(),
  vote: text("vote").notNull().$type<'love' | 'like' | 'meh' | 'nope'>(),
  chips: text("chips").array().notNull().default(sql`'{}'`),
  notes: text("notes"),
  isWinner: boolean("is_winner").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("flight_results_user_idx").on(table.userId)]);

export const insertFlightResultSchema = createInsertSchema(flightResults).omit({ id: true, createdAt: true });
export type InsertFlightResult = z.infer<typeof insertFlightResultSchema>;
export type FlightResult = typeof flightResults.$inferSelect;

// ====== PAIRINGS (Meal-Drink) ======
export const pairings = pgTable("pairings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  mealDescription: text("meal_description").notNull(),
  cuisine: text("cuisine"),
  protein: text("protein"),
  cookingMethod: text("cooking_method"),
  spiceLevel: text("spice_level").$type<'mild' | 'medium' | 'spicy' | 'very-spicy'>(),
  richness: text("richness").$type<'light' | 'medium' | 'rich'>(),
  acidity: text("acidity").$type<'low' | 'medium' | 'high'>(),
  isSmoky: boolean("is_smoky").notNull().default(false),
  recommendedRecipeIds: text("recommended_recipe_ids").array().notNull().default(sql`'{}'`),
  recommendedWoods: text("recommended_woods").array().notNull().default(sql`'{}'`),
  reasoning: jsonb("reasoning").notNull().default('{}'),
  personId: varchar("person_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("pairings_user_idx").on(table.userId)]);

export const insertPairingSchema = createInsertSchema(pairings).omit({ id: true, createdAt: true });
export type InsertPairing = z.infer<typeof insertPairingSchema>;
export type Pairing = typeof pairings.$inferSelect;

// ====== USER SETTINGS ======
export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  hasSmoker: boolean("has_smoker").notNull().default(false),
  smokerType: text("smoker_type").notNull().$type<'chimney' | 'cloche' | 'smoking-gun' | 'torch'>().default('chimney'),
  defaultIntensity: text("default_intensity").notNull().$type<'light' | 'medium' | 'bold' | 'very-strong'>().default('medium'),
  enableCostTracking: boolean("enable_cost_tracking").notNull().default(false),
  includeKidFriendlyMocktails: boolean("include_kid_friendly_mocktails").notNull().default(false),
  kidFriendlyMocktailCount: integer("kid_friendly_mocktail_count").notNull().default(2),
  allowCaffeineInKidMocktails: boolean("allow_caffeine_in_kid_mocktails").notNull().default(false),
  allowSpicyInKidMocktails: boolean("allow_spicy_in_kid_mocktails").notNull().default(false),
  lastSmokeSettings: jsonb("last_smoke_settings"),
  woodAffinity: jsonb("wood_affinity").notNull().default('{}'),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [index("user_settings_user_idx").on(table.userId)]);

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({ id: true, updatedAt: true });
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// ====== SMOKER GUARDRAILS (Rules) ======
export const smokerGuardrails = {
  defaultMethod: 'glass' as const,
  bittersReductionMin: 0.3,
  bittersReductionMax: 0.5,
  maxBittersDashes: 3,
  smokeTimeRange: { min: 5, max: 20 },
  restTimeRange: { min: 20, max: 30 },
  timeCaps: {
    hickory: 8,
    mesquite: 7,
    oak: 12,
  } as Record<string, number>,
  steps: ['build', 'smoke', 'rest', 'pour', 'garnish'] as const,
};

// Ingredient type for recipes
export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  isOptional?: boolean;
}
