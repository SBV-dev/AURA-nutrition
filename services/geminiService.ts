import { GoogleGenAI, Type } from "@google/genai";
import { NutritionEstimateResponse, MealPlan, UserGoal, UserProfile, PlanConfiguration, Meal, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  const model = 'gemini-3-flash-preview';
  const parts: any[] = [];
  if (input.text) parts.push({ text: `Analyze the following meal description: "${input.text}"` });
  if (input.imageBase64) {
    parts.push({ inlineData: { mimeType: input.mimeType || "image/jpeg", data: input.imageBase64 } });
    parts.push({ text: "Analyze this meal image. Identify ingredients and estimate standard serving sizes." });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: NUTRITION_SCHEMA,
      systemInstruction: "You are a world-class culinary nutritionist. Provide accurate estimates for foods based on global cuisine knowledge."
    }
  });

  try {
    return JSON.parse(cleanJsonText(response.text || "{}"));
  } catch (e) {
    console.error("Failed to parse nutrition estimate", e);
    throw new Error("Could not analyze nutrition data.");
  }
}

export async function generateMealPlan(goals: UserGoal, config: PlanConfiguration): Promise<MealPlan> {
  const model = 'gemini-3-pro-preview';
  const prompt = `Create a 1-day meal plan: Cal: ${goals.calories}, Protein: ${goals.protein}g. Preference: ${config.macroPreference}.`;

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
      systemInstruction: "You are a professional nutritionist. Thinking budget is active for complex reasoning.",
      thinkingConfig: { thinkingBudget: 8192 }
    }
  });

  try {
    return JSON.parse(cleanJsonText(response.text || "{}"));
  } catch (e) {
    throw new Error("Failed to generate meal plan.");
  }
}

export async function calculateNutritionalGoals(profile: UserProfile): Promise<UserGoal> {
  const model = 'gemini-3-flash-preview';
  const s = profile.gender === 'Male' ? 5 : -161;
  const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + s;
  const multiplier = 1.375;
  const tdee = bmr * multiplier;

  const response = await ai.models.generateContent({
    model,
    contents: `Calculate goals: ${JSON.stringify(profile)}`,
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
     return { calories: Math.round(tdee), protein: Math.round(profile.weight * 2), carbs: Math.round((tdee * 0.4) / 4), fats: Math.round((tdee * 0.3) / 9), weight: profile.weight, water: 2500 };
  }
}

export async function getChatResponse(history: Message[], query: string, context: any): Promise<string> {
  const model = 'gemini-3-pro-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Query: ${query}`,
    config: {
      systemInstruction: "You are Aura AI. Be concise and bio-optimized in your responses.",
      thinkingConfig: { thinkingBudget: 8192 }
    }
  });
  return response.text || "I'm sorry, I couldn't process that.";
}