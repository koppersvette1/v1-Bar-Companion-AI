import Tesseract from 'tesseract.js';

type Category = 'spirit' | 'liqueur' | 'bitters' | 'mixer' | 'syrup' | 'garnish' | 'tool' | 'accessory';

const KEYWORDS: Record<string, { category: Category, type: string }> = {
  // Spirits
  'whiskey': { category: 'spirit', type: 'Whiskey' },
  'whisky': { category: 'spirit', type: 'Whiskey' },
  'bourbon': { category: 'spirit', type: 'Bourbon' },
  'rye': { category: 'spirit', type: 'Rye Whiskey' },
  'scotch': { category: 'spirit', type: 'Scotch' },
  'vodka': { category: 'spirit', type: 'Vodka' },
  'gin': { category: 'spirit', type: 'Gin' },
  'rum': { category: 'spirit', type: 'Rum' },
  'tequila': { category: 'spirit', type: 'Tequila' },
  'mezcal': { category: 'spirit', type: 'Mezcal' },
  'cognac': { category: 'spirit', type: 'Cognac' },
  'brandy': { category: 'spirit', type: 'Brandy' },
  
  // Brands (Spirits)
  'jack daniels': { category: 'spirit', type: 'Tennessee Whiskey' },
  'jim beam': { category: 'spirit', type: 'Bourbon' },
  'makers mark': { category: 'spirit', type: 'Bourbon' },
  'buffalo trace': { category: 'spirit', type: 'Bourbon' },
  'bacardi': { category: 'spirit', type: 'Rum' },
  'captain morgan': { category: 'spirit', type: 'Spiced Rum' },
  'hendricks': { category: 'spirit', type: 'Gin' },
  'bombay': { category: 'spirit', type: 'Gin' },
  'tanqueray': { category: 'spirit', type: 'Gin' },
  'titos': { category: 'spirit', type: 'Vodka' },
  'grey goose': { category: 'spirit', type: 'Vodka' },
  'patron': { category: 'spirit', type: 'Tequila' },
  'don julio': { category: 'spirit', type: 'Tequila' },

  // Liqueurs / Bitters
  'campari': { category: 'liqueur', type: 'Campari' },
  'aperol': { category: 'liqueur', type: 'Aperol' },
  'vermouth': { category: 'liqueur', type: 'Vermouth' },
  'kahlua': { category: 'liqueur', type: 'Coffee Liqueur' },
  'baileys': { category: 'liqueur', type: 'Irish Cream' },
  'cointreau': { category: 'liqueur', type: 'Triple Sec' },
  'grand marnier': { category: 'liqueur', type: 'Orange Liqueur' },
  'amaretto': { category: 'liqueur', type: 'Amaretto' },
  'bitters': { category: 'bitters', type: 'Bitters' },
  'angostura': { category: 'bitters', type: 'Angostura Bitters' },
  'peychaud': { category: 'bitters', type: 'Peychauds Bitters' },

  // Mixers
  'cola': { category: 'mixer', type: 'Cola' },
  'coke': { category: 'mixer', type: 'Cola' },
  'tonic': { category: 'mixer', type: 'Tonic Water' },
  'soda': { category: 'mixer', type: 'Soda Water' },
  'ginger beer': { category: 'mixer', type: 'Ginger Beer' },
  'ginger ale': { category: 'mixer', type: 'Ginger Ale' },
  'juice': { category: 'mixer', type: 'Juice' },
  'syrup': { category: 'mixer', type: 'Syrup' },
  'simple': { category: 'mixer', type: 'Simple Syrup' },

  // Tools/Accessories
  'shaker': { category: 'tool', type: 'Shaker' },
  'jigger': { category: 'tool', type: 'Jigger' },
  'strainer': { category: 'tool', type: 'Strainer' },
  'muddler': { category: 'tool', type: 'Muddler' },
  'spoon': { category: 'tool', type: 'Bar Spoon' },
  'smoker': { category: 'accessory', type: 'Cocktail Smoker' },
  'chips': { category: 'accessory', type: 'Wood Chips' },
  'wood': { category: 'accessory', type: 'Wood Chips' },
  'torch': { category: 'accessory', type: 'Torch' },
};

export type ScanResult = {
  rawText: string;
  detectedName?: string;
  detectedCategory?: Category;
  confidence: number;
  suggestions: string[];
};

export async function scanImage(imageFile: File | string): Promise<ScanResult> {
  try {
    const result = await Tesseract.recognize(
      imageFile,
      'eng',
      {
        logger: m => console.log(m), // Optional logger
      }
    );

    const text = result.data.text.toLowerCase();
    console.log("OCR Result:", text);

    // Analyze text
    let bestMatch: { category: Category, type: string } | null = null;
    let maxConfidence = 0;
    const suggestions: string[] = [];

    // Simple keyword matching
    for (const [keyword, info] of Object.entries(KEYWORDS)) {
      if (text.includes(keyword)) {
        if (!bestMatch) {
          bestMatch = info;
          maxConfidence = 0.8; // High confidence if direct keyword match
        }
        if (!suggestions.includes(info.type)) {
          suggestions.push(info.type);
        }
      }
    }

    // Default if no match
    if (!bestMatch) {
      return {
        rawText: text,
        confidence: 0,
        suggestions: ['Unknown Item', 'Custom Spirit', 'Custom Mixer'],
        detectedCategory: 'spirit' // Default to spirit
      };
    }

    return {
      rawText: text,
      detectedName: bestMatch.type,
      detectedCategory: bestMatch.category,
      confidence: maxConfidence,
      suggestions: suggestions.slice(0, 3)
    };

  } catch (error) {
    console.error("Scanning failed:", error);
    return {
      rawText: "",
      confidence: 0,
      suggestions: [],
      detectedCategory: 'spirit'
    };
  }
}
