import { GoogleGenAI, Type } from "@google/genai";
import { NutritionEstimateResponse, MealPlan, UserGoal, UserProfile, PlanConfiguration, Message } from "../types";

function cleanJsonText(text: string): string {
  if (!text) return '{}';
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) return match[1].trim();
  return text.replace(/```json|```/g, '').trim();
}

const NUTRITION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "A concise, accurate name for the food item or meal" },
    calories: { type: Type.NUMBER, description: "Total estimated calories" },
    macros: {
      type: Type.OBJECT,
      properties: {
        protein: { type: Type.NUMBER, description: "Grams of protein" },
        carbs: { type: Type.NUMBER, description: "Grams of carbohydrates" },
        fats: { type: Type.NUMBER, description: "Grams of fats" },
        calories: { type: Type.NUMBER, description: "Redundant calorie count" }
      },
      required: ["protein", "carbs", "fats", "calories"]
    },
    items: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of identified ingredients with estimated quantities"
    },
    confidence: { type: Type.NUMBER, description: "Confidence score 0-1" },
    reasoning: { type: Type.STRING, description: "Brief explanation of identification" }
  },
  required: ["name", "calories", "macros", "items", "confidence", "reasoning"]
};

export async function estimateNutrition(
  input: { text?: string; imageBase64?: string; mimeType?: string }
): Promise<NutritionEstimateResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  const parts: any[] = [];
  
  if (input.text) parts.push({ text: `Analyze the following meal description: "${input.text}"` });
  if (input.imageBase64) {
    parts.push({ 
      inlineData: { 
        mimeType: input.mimeType || "image/jpeg", 
        data: input.imageBase64 
      } 
    });
    parts.push({ text: "Analyze this meal image. Identify all food items, estimate serving sizes, and provide a full nutritional breakdown." });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: NUTRITION_SCHEMA,
      systemInstruction: "You are Aura Nutrition Intelligence, a world-class culinary nutritionist. Provide pinpoint accurate estimates using vision and language reasoning.",
      thinkingConfig: { thinkingBudget: 8192 }
    }
  });

  try {
    return JSON.parse(cleanJsonText(response.text || "{}"));
  } catch (e) {
    console.error("Failed to parse nutrition estimate", e);
    throw new Error("Bio-analysis synthesis failed.");
  }
}

export async function generateMealPlan(goals: UserGoal, config: PlanConfiguration): Promise<MealPlan> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  const prompt = `Synthesize a high-performance 1-day meal plan based on these targets: 
    Daily Calories: ${goals.calories}kcal, 
    Protein: ${goals.protein}g, 
    Carbs: ${goals.carbs}g, 
    Fats: ${goals.fats}g. 
    Preference Profile: ${config.macroPreference}, ${config.spiceLevel} spice, ${config.tasteProfile} taste.
    Restrictions: ${config.dietaryRestrictions || 'None'}.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                prepTime: { type: Type.STRING },
                prepInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                macros: {
                  type: Type.OBJECT,
                  properties: {
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fats: { type: Type.NUMBER }
                  },
                  required: ["protein", "carbs", "fats"]
                }
              },
              required: ["type", "description", "calories", "prepTime", "prepInstructions", "macros"]
            }
          },
          categorizedShoppingList: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                items: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["category", "items"]
            }
          },
          prepTimeTotal: { type: Type.STRING },
          chefTips: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["id", "name", "meals", "categorizedShoppingList", "prepTimeTotal", "chefTips"]
      },
      systemInstruction: "You are Aura Architect. Design a bio-available, delicious meal plan that meets exact caloric targets.",
      thinkingConfig: { thinkingBudget: 12000 }
    }
  });

  try {
    return JSON.parse(cleanJsonText(response.text || "{}"));
  } catch (e) {
    throw new Error("Meal plan synthesis timed out.");
  }
}

export async function calculateNutritionalGoals(profile: UserProfile): Promise<UserGoal> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model,
    contents: `Calculate optimal daily macros and water intake for this profile: ${JSON.stringify(profile)}. Goal: ${profile.primaryGoal}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
          water: { type: Type.NUMBER },
          weight: { type: Type.NUMBER }
        },
        required: ["calories", "protein", "carbs", "fats", "water", "weight"]
      }
    }
  });

  try {
    return JSON.parse(cleanJsonText(response.text || "{}"));
  } catch (e) {
    const s = profile.gender === 'Male' ? 5 : -161;
    const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + s;
    const tdee = Math.round(bmr * 1.375);
    return { 
      calories: tdee, 
      protein: profile.weight * 2, 
      carbs: Math.round((tdee * 0.4) / 4), 
      fats: Math.round((tdee * 0.3) / 9), 
      weight: profile.weight, 
      water: 2500 
    };
  }
}

export async function getChatResponse(history: Message[], query: string, context: any): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  const conversation = history.map(m => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.text }]
  }));

  const response = await ai.models.generateContent({
    model,
    contents: conversation,
    config: {
      systemInstruction: `You are Aura AI, the user's elite bio-optimization assistant. 
        CURRENT USER CONTEXT:
        Profile: ${JSON.stringify(context.profile)}
        Current Goals: ${JSON.stringify(context.goals)}
        Today's Progress: ${context.meals.length} meals logged, ${context.hydration}ml water.
        
        Guidelines: Be concise, highly professional, and scientifically grounded. Focus on actionable metabolic advice.`,
      thinkingConfig: { thinkingBudget: 8192 }
    }
  });
  
  return response.text || "Metabolic sync interrupted. Please query again.";
}