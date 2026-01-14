
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionEstimateResponse, MealPlan, UserGoal, UserProfile, PlanConfiguration, Meal, Message } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Robust utility to extract JSON from model response
function cleanJsonText(text: string): string {
  if (!text) return '{}';
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) return match[1].trim();
  return text.replace(/```json|```/g, '').trim();
}

const NUTRITION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "A concise, accurate name for the food item or meal, including specific cultural dish names if applicable (e.g., 'Kimchi Jjigae' instead of 'Spicy Soup')" },
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
      description: "List of identified ingredients with estimated quantities (e.g. '100g Chicken Breast')"
    },
    confidence: { type: Type.NUMBER, description: "Confidence score 0-1" },
    reasoning: { type: Type.STRING, description: "Brief explanation of identification and portion assumptions" }
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
    parts.push({ text: "Analyze this meal image. Identify the specific global dish, cuisine origin, ingredients, and estimate standard serving sizes." });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: NUTRITION_SCHEMA,
      systemInstruction: `You are a world-class culinary nutritionist with encyclopedic knowledge of every cuisine, street food, and traditional dish from every country (e.g., Jollof, Pad Thai, Feijoada, Borscht, Dim Sum, Injera, Mole, etc.). 
      
      Your goal is high accuracy in identifying global foods. 
      1. Analyze the input to detect the specific cuisine and dish name.
      2. Identify authentic ingredients based on the dish's origin.
      3. Estimate nutrition based on traditional preparation methods for that specific culture.
      4. If portion sizes are not specified, assume standard serving sizes for that specific dish's culture.
      5. Break down complex meals into ingredients.`
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
  
  const prompt = `Create a comprehensive 1-day bio-optimized meal plan.
  
  Target Metrics:
  - Calories: ${goals.calories}
  - Protein: ${goals.protein}g
  
  Configuration:
  - Meal Composition: ${config.macroPreference}
  - Snack Strategy: ${config.snackPreference}
  - Spice Tolerance: ${config.spiceLevel}
  - Flavor Profile: ${config.tasteProfile}
  - Notes/Restrictions: ${config.dietaryRestrictions || "None"}
  
  Requirements:
  1. Detailed prep instructions.
  2. Categorized shopping list.
  3. Total prep time.
  4. Chef tips.
  
  Ensure the meals strictly adhere to the spice tolerance and flavor profile requested.`;

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
      systemInstruction: "You are a professional nutritionist. Generate practical, healthy, and accurate meal plans tailored to the user's specific flavor and spice preferences.",
      thinkingConfig: { thinkingBudget: 8192 }
    }
  });

  try {
    const text = cleanJsonText(response.text || "{}");
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse meal plan JSON", e);
    throw new Error("Failed to generate meal plan.");
  }
}

export async function calculateNutritionalGoals(profile: UserProfile): Promise<UserGoal> {
  const model = 'gemini-3-flash-preview';

  // Calculate BMR using Mifflin-St Jeor Equation
  const s = profile.gender === 'Male' ? 5 : -161;
  const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + s;

  // Calculate TDEE based on activity level
  const activityMultipliers: Record<string, number> = {
    'Sedentary': 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
    'Super Active': 1.9
  };
  const multiplier = activityMultipliers[profile.activityLevel] || 1.375;
  const tdee = bmr * multiplier;

  const response = await ai.models.generateContent({
    model,
    contents: `Calculate optimal daily nutritional goals for this user profile: ${JSON.stringify(profile)}.
    
    Baseline Mathematical Calculation (Mifflin-St Jeor):
    - BMR: ${Math.round(bmr)} kcal
    - TDEE: ${Math.round(tdee)} kcal
    
    Use this baseline to scientifically adjust calories and macros based on their specific goal (${profile.primaryGoal}).
    Return JSON.`,
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
     // Fallback to TDEE estimate if AI fails
     return { 
       calories: Math.round(tdee), 
       protein: Math.round(profile.weight * 2), // ~2g per kg
       carbs: Math.round((tdee * 0.4) / 4), 
       fats: Math.round((tdee * 0.3) / 9),
       weight: profile.weight, 
       water: 2500 
     };
  }
}

interface ChatContext {
  profile: UserProfile | null;
  goals: UserGoal;
  meals: Meal[];
  hydration: number;
}

export async function getChatResponse(
  history: Message[], 
  query: string, 
  context: ChatContext
): Promise<string> {
  const model = 'gemini-3-pro-preview';
  
  // Calculate current totals for context
  const totals = context.meals.reduce((acc, m) => ({
    calories: acc.calories + m.calories,
    protein: acc.protein + m.macros.protein,
    carbs: acc.carbs + m.macros.carbs,
    fats: acc.fats + m.macros.fats,
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const contextPrompt = `
    CURRENT USER CONTEXT:
    - Profile: ${JSON.stringify(context.profile)}
    - Daily Goals: ${JSON.stringify(context.goals)}
    - Consumed Today: ${JSON.stringify(totals)}
    - Hydration Today: ${context.hydration}ml / ${context.goals.water}ml
    - Logged Meals Breakdown: ${JSON.stringify(context.meals.map(m => ({ name: m.name, cal: m.calories, p: m.macros.protein })))}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: `Context: ${contextPrompt}\n\nChat History: ${JSON.stringify(history)}\n\nUser Query: ${query}`,
    config: {
      systemInstruction: `You are Aura, an advanced AI nutrition assistant. 
      
      CRITICAL DISCLAIMER PROTOCOL:
      1. You must explicitly state that you are an AI and NOT a doctor or medical professional.
      2. Your advice is for informational and tracking purposes only.
      3. Do not provide medical diagnoses or treatment advice. If a professional medical opinion is needed, tell them to consult a qualified expert.
      
      BEHAVIOR:
      - Use provided context for specific advice.
      - Be encouraging yet concise.`,
      thinkingConfig: { thinkingBudget: 8192 }
    }
  });
  return response.text || "I'm sorry, I couldn't process that.";
}
