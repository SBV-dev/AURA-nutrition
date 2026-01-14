

export enum View {
  AUTH = 'auth',
  ONBOARDING = 'onboarding',
  TODAY = 'today',
  HISTORY = 'history',
  INSIGHTS = 'insights',
  COACH = 'coach',
  PROFILE = 'profile',
  CAMERA = 'camera',
  PLANNER = 'planner',
  CHAT = 'chat'
}

export type Gender = 'Male' | 'Female' | 'Other';
export type ActivityLevel = 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Super Active';
export type GoalType = 'Lose Weight' | 'Maintain' | 'Gain Muscle';

export type MacroPreference = 'Balanced' | 'High Carb' | 'Low Carb' | 'High Protein' | 'Keto';
export type SnackPreference = 'None' | 'Low Calorie' | 'High Protein' | 'Energy Dense';
export type SpiceLevel = 'Mild' | 'Medium' | 'Spicy' | 'Extra Hot';
export type TasteProfile = 'Savory' | 'Sweet' | 'Balanced' | 'Umami' | 'Fresh';

export interface PlanConfiguration {
  macroPreference: MacroPreference;
  snackPreference: SnackPreference;
  spiceLevel: SpiceLevel;
  tasteProfile: TasteProfile;
  dietaryRestrictions: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export type Theme = 'dark' | 'light';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  primaryGoal: GoalType;
  // Default Preferences
  macroPreference: MacroPreference;
  snackPreference: SnackPreference;
  spiceLevel: SpiceLevel;
  tasteProfile: TasteProfile;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface ShoppingCategory {
  category: string;
  items: string[];
}

export interface MealPlan {
  id: string;
  name: string;
  meals: {
    type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    description: string;
    calories: number;
    macros: MacroData;
    prepInstructions: string[];
    prepTime: string;
  }[];
  categorizedShoppingList: ShoppingCategory[];
  prepTimeTotal: string;
  chefTips: string[];
}

export interface MacroData {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface Meal {
  id: string;
  timestamp: number;
  name: string;
  calories: number;
  macros: MacroData;
  imageUrl?: string;
  items: string[];
  confidence: number;
}

export interface UserGoal {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  weight: number;
  water: number; // in ml
}

export interface NutritionEstimateResponse {
  name: string;
  calories: number;
  macros: MacroData;
  items: string[];
  confidence: number;
  reasoning: string;
}

export interface WeightEntry {
  timestamp: number;
  value: number;
}

export interface HydrationEntry {
  timestamp: number;
  amount: number;
}