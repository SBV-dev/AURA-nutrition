
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Plus, Home, Calendar, MessageCircle, PieChart, User, Camera as CameraIcon, 
  Type as TextIcon, ChevronRight, Sparkles, Droplets, Flame, Target, 
  ArrowLeft, Utensils, Send, Loader2, Check, Zap, CheckCircle2, ShieldAlert,
  Clock, ShoppingBag, Info, X, ChevronDown, ListChecks, Trash2, Mail, Lock,
  Ruler, Weight, Activity, Trophy, Settings2, Coffee, Leaf, AlertCircle, Edit3, Save, Image as ImageIcon,
  TrendingUp, Star, Thermometer
} from 'lucide-react';

import { View, Meal, UserGoal, NutritionEstimateResponse, HydrationEntry, WeightEntry, Message, MealPlan, ShoppingCategory, UserProfile, Gender, ActivityLevel, GoalType, MacroPreference, SnackPreference, SpiceLevel, TasteProfile } from './types';
import { COLORS, DEFAULT_GOAL, SPRING_TRANSITION } from './constants';
import { ProgressRing, MiniMacro } from './components/ProgressRing';
import { CameraView } from './components/CameraView';
import { NutritionModal } from './components/NutritionModal';
import { HydrationModal } from './components/HydrationModal';
import { BarChart, LineChart } from './components/Charts';
import { SplashLogo } from './components/SplashLogo';
import { Logo } from './components/Logo';
import { estimateNutrition, getChatResponse, generateMealPlan, calculateNutritionalGoals } from './services/geminiService';
import { PageTransition } from './components/MotionWrapper';

const StreakCounter: React.FC<{ days: number }> = ({ days }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0, y: -5 }}
    animate={{ 
      scale: 1, 
      opacity: 1, 
      y: 0,
      borderColor: ["rgba(249, 115, 22, 0.2)", "rgba(249, 115, 22, 0.6)", "rgba(249, 115, 22, 0.2)"],
      boxShadow: [
        "0 0 0px rgba(249, 115, 22, 0)",
        "0 0 12px rgba(249, 115, 22, 0.3)",
        "0 0 0px rgba(249, 115, 22, 0)"
      ]
    }}
    transition={{
      borderColor: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      default: { duration: 0.4 }
    }}
    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-rose-500/10 rounded-full border border-orange-500/20 backdrop-blur-md relative overflow-hidden group mt-1"
  >
    {/* Internal Shimmer */}
    <motion.div 
      className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/10 to-transparent"
      animate={{ x: ['-150%', '150%'] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
    />
    
    {/* Live Flame Animation */}
    <motion.div
      animate={{ 
        scale: [1, 1.15, 1],
        filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10"
    >
      <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
      
      {/* Spark Particles (Simulated with absolute divs) */}
      <motion.div 
        animate={{ y: [0, -8], opacity: [1, 0], x: [0, 2] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
        className="absolute -top-1 right-0 w-0.5 h-0.5 bg-orange-300 rounded-full"
      />
    </motion.div>
    
    <span className="text-[10px] font-black text-orange-100 uppercase tracking-wide relative z-10">
      <span className="text-orange-400 mr-0.5">{days}</span> Day Streak
    </span>
  </motion.div>
);

const AuthWall: React.FC<{ onLogin: () => void; onSignUp: () => void }> = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
       if (isLoginView) {
         onLogin();
       } else {
         onSignUp();
       }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[100%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="z-10 text-center flex flex-col items-center w-full max-w-sm">
        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20 border border-white/5 backdrop-blur-xl">
          <Logo className="w-16 h-16" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-2">AURA</h1>
        <p className="text-white/40 mb-10 font-medium">Log in to sync your metabolic profile.</p>
        
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="email" 
              placeholder="Email address"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="password" 
              placeholder="Password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-4 bg-emerald-500 text-black font-black rounded-2xl shadow-xl active:scale-95 transition-transform mt-2"
          >
            {isLoginView ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="w-full flex items-center gap-4 my-8">
          <div className="h-[1px] flex-1 bg-white/10" />
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">or continue with</span>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        <button 
          onClick={isLoginView ? onLogin : onSignUp}
          className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google Account
        </button>

        <button 
          onClick={() => setIsLoginView(!isLoginView)}
          className="mt-8 text-xs font-bold text-white/30 hover:text-white/60 transition-colors"
        >
          {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </motion.div>
    </motion.div>
  );
};

const Onboarding: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    age: 25,
    gender: 'Male',
    height: 175,
    weight: 70,
    activityLevel: 'Moderately Active',
    primaryGoal: 'Maintain',
    macroPreference: 'Balanced',
    snackPreference: 'Low Calorie',
    spiceLevel: 'Medium',
    tasteProfile: 'Balanced'
  });

  const nextStep = () => {
    if (step < 5) setStep(step + 1); // Increased steps count
    else onComplete(profile as UserProfile);
  };

  const steps = [
    {
      title: "Welcome",
      description: "Let's personalize your Aura.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-white/40">What should we call you?</label>
            <input 
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl font-bold outline-none focus:border-emerald-500"
              placeholder="Name"
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-white/40">Age</label>
              <input 
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xl font-bold outline-none focus:border-emerald-500"
                value={profile.age}
                onChange={e => setProfile({...profile, age: parseInt(e.target.value)})}
              />
            </div>
             <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-white/40">Gender</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-lg font-bold outline-none focus:border-emerald-500 appearance-none"
                value={profile.gender}
                onChange={e => setProfile({...profile, gender: e.target.value as Gender})}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Bio Metrics",
      description: "For precise calorie calculations.",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2"><Ruler className="w-4 h-4" /> Height (cm)</label>
            <div className="relative">
              <input 
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-3xl font-black outline-none focus:border-emerald-500 text-center"
                value={profile.height}
                onChange={e => setProfile({...profile, height: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2"><Weight className="w-4 h-4" /> Weight (kg)</label>
            <div className="relative">
               <input 
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-3xl font-black outline-none focus:border-emerald-500 text-center"
                value={profile.weight}
                onChange={e => setProfile({...profile, weight: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Lifestyle",
      description: "How active are you daily?",
      content: (
        <div className="space-y-3">
          {(['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Super Active'] as ActivityLevel[]).map(level => (
            <button
              key={level}
              onClick={() => setProfile({...profile, activityLevel: level})}
              className={`w-full p-4 rounded-2xl border text-left transition-all ${profile.activityLevel === level ? 'bg-emerald-500 text-black border-emerald-500 font-bold' : 'bg-white/5 border-white/10 text-white/60'}`}
            >
              {level}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Target",
      description: "What is your primary goal?",
      content: (
        <div className="grid grid-cols-1 gap-4">
           {(['Lose Weight', 'Maintain', 'Gain Muscle'] as GoalType[]).map(g => (
             <button
              key={g}
              onClick={() => setProfile({...profile, primaryGoal: g})}
              className={`w-full p-6 rounded-[2rem] border flex flex-col items-center gap-2 transition-all ${profile.primaryGoal === g ? 'bg-indigo-500 text-white border-indigo-500 shadow-xl shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-white/60'}`}
            >
              <Trophy className={`w-8 h-8 ${profile.primaryGoal === g ? 'text-white' : 'text-white/20'}`} />
              <span className="font-bold text-lg">{g}</span>
            </button>
           ))}
        </div>
      )
    },
    {
      title: "Preferences",
      description: "Tailor your food experience.",
      content: (
        <div className="space-y-6">
          {/* Diet Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">Default Meal Style</label>
            <div className="flex flex-wrap gap-2">
              {(['Balanced', 'High Carb', 'Low Carb', 'High Protein', 'Keto'] as MacroPreference[]).map(type => (
                <button
                  key={type}
                  onClick={() => setProfile({...profile, macroPreference: type})}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${profile.macroPreference === type ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/50'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Snack Style */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">Snack Preference</label>
            <div className="flex flex-wrap gap-2">
              {(['None', 'Low Calorie', 'High Protein', 'Energy Dense'] as SnackPreference[]).map(type => (
                <button
                  key={type}
                  onClick={() => setProfile({...profile, snackPreference: type})}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${profile.snackPreference === type ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/50'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

           {/* Spice & Taste Row */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">Spice Level</label>
                <select 
                  value={profile.spiceLevel} 
                  onChange={e => setProfile({...profile, spiceLevel: e.target.value as SpiceLevel})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold outline-none"
                >
                  {['Mild', 'Medium', 'Spicy', 'Extra Hot'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
               <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 flex items-center gap-2">Taste</label>
                <select 
                  value={profile.tasteProfile} 
                  onChange={e => setProfile({...profile, tasteProfile: e.target.value as TasteProfile})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold outline-none"
                >
                  {['Savory', 'Sweet', 'Balanced', 'Umami', 'Fresh'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
           </div>
        </div>
      )
    },
    {
      title: "Review",
      description: "Ready to synthesize your protocol?",
      content: (
        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-white/40 font-medium">Profile</span>
            <span className="font-bold">{profile.name}, {profile.age}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-white/40 font-medium">Body</span>
            <span className="font-bold">{profile.height}cm, {profile.weight}kg</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-white/40 font-medium">Activity</span>
            <span className="font-bold text-right">{profile.activityLevel}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/40 font-medium">Goal</span>
            <span className="font-black text-emerald-400 text-right">{profile.primaryGoal}</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col p-8">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-4xl font-black mb-2">{steps[step].title}</h2>
            <p className="text-white/40 font-medium">{steps[step].description}</p>
          </div>
          {steps[step].content}
        </motion.div>
      </div>
      
      <div className="w-full max-w-sm mx-auto flex items-center justify-between">
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-emerald-500' : 'w-2 bg-white/10'}`} />
          ))}
        </div>
        <button 
          onClick={nextStep}
          className="px-8 py-4 bg-white text-black font-black rounded-2xl active:scale-95 transition-transform flex items-center gap-2"
        >
          {step === steps.length - 1 ? 'Complete' : 'Next'} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'SPLASH' | 'AUTH' | 'ONBOARDING' | 'APP'>('SPLASH');
  const [currentView, setCurrentView] = useState<View>(View.TODAY);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [hydration, setHydration] = useState<HydrationEntry[]>([]);
  const [goal, setGoal] = useState<UserGoal>(DEFAULT_GOAL);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [isLoggingOpen, setIsLoggingOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState<NutritionEstimateResponse | null>(null);
  const [streakDays] = useState(0);

  // New Hydration UI State
  const [showHydrationModal, setShowHydrationModal] = useState(false);
  
  // Insight Selection State
  const [selectedCalorieIndex, setSelectedCalorieIndex] = useState<number | null>(null);
  const [selectedHydrationIndex, setSelectedHydrationIndex] = useState<number | null>(null);
  const [selectedWeightIndex, setSelectedWeightIndex] = useState<number | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  
  // Chat
  const [chatMessages, setChatMessages] = useState<Message[]>([{ role: 'model', text: 'How can I assist your nutrition today?' }]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Planner State
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [macroPref, setMacroPref] = useState<MacroPreference>('Balanced');
  const [snackPref, setSnackPref] = useState<SnackPreference>('Low Calorie');
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>('Medium');
  const [tasteProfile, setTasteProfile] = useState<TasteProfile>('Balanced');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [editableShoppingList, setEditableShoppingList] = useState<ShoppingCategory[]>([]);

  // File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totals = useMemo(() => meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.macros.protein,
    carbs: acc.carbs + meal.macros.carbs,
    fats: acc.fats + meal.macros.fats,
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 }), [meals]);

  const waterTotal = useMemo(() => hydration.reduce((acc, curr) => acc + curr.amount, 0), [hydration]);

  // Profile Edit Handlers
  const startEditingProfile = () => {
    if (userProfile) {
      setTempProfile({...userProfile});
      setIsEditingProfile(true);
    }
  };

  const saveProfile = async () => {
    if (tempProfile) {
      setUserProfile(tempProfile);
      setIsEditingProfile(false);
      setIsCalibrating(true);
      try {
        const newGoals = await calculateNutritionalGoals(tempProfile);
        setGoal(newGoals);
      } catch (e) {
        console.error("Recalibration failed", e);
      } finally {
        setIsCalibrating(false);
      }
    }
  };

  const handleCapture = async (base64: string) => {
    setIsProcessing(true);
    try {
      const estimate = await estimateNutrition({ imageBase64: base64 });
      setCurrentEstimate(estimate);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoggingOpen(false);
      setIsProcessing(true);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        // result format: "data:image/jpeg;base64,/9j/4AAQ..."
        const base64String = result.split(',')[1];
        const mimeType = result.split(';')[0].split(':')[1];

        try {
          const estimate = await estimateNutrition({ imageBase64: base64String, mimeType });
          setCurrentEstimate(estimate);
        } catch (err) {
          console.error(err);
        } finally {
          setIsProcessing(false);
          // Clear input so same file can be selected again
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualLog = async (description: string) => {
    if (!description.trim()) return;
    setIsLoggingOpen(false);
    setIsProcessing(true);
    try {
      const estimate = await estimateNutrition({ text: description });
      setCurrentEstimate(estimate);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecalculate = async (newDescription: string) => {
    setIsProcessing(true);
    try {
      // Use the manual log logic but keep the modal open by updating the current estimate
      const estimate = await estimateNutrition({ text: newDescription });
      setCurrentEstimate(estimate);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmLog = () => {
    if (currentEstimate) {
      const newMeal: Meal = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        name: currentEstimate.name,
        calories: currentEstimate.calories,
        macros: currentEstimate.macros,
        items: currentEstimate.items,
        confidence: currentEstimate.confidence
      };
      setMeals([newMeal, ...meals]);
      setCurrentEstimate(null);
      setCurrentView(View.TODAY);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setIsChatTyping(true);
    try {
      // Pass the complete user context for accurate AI analysis
      const res = await getChatResponse(chatMessages, msg, {
        profile: userProfile,
        goals: goal,
        meals: meals,
        hydration: waterTotal
      });
      setChatMessages(prev => [...prev, { role: 'model', text: res }]);
    } catch (err) {
      console.error("Chat error", err);
      setChatMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to my bio-database. Please try again." }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  const createPlan = async () => {
    setIsGeneratingPlan(true);
    setPlanError(null);
    setMealPlan(null);
    try {
      const plan = await generateMealPlan(goal, {
        macroPreference: macroPref,
        snackPreference: snackPref,
        spiceLevel: spiceLevel,
        tasteProfile: tasteProfile,
        dietaryRestrictions
      });
      if (plan && plan.meals) {
        setMealPlan(plan);
        setEditableShoppingList(plan.categorizedShoppingList || []);
      } else {
        setPlanError("AI could not generate a valid plan. Please try again.");
      }
    } catch (err) {
      console.error("Plan Gen Error:", err);
      setPlanError("Protocol Synthesis Failed. Please check connection and try again.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const removeShoppingItem = (catIdx: number, itemIdx: number) => {
    const newList = [...editableShoppingList];
    newList[catIdx].items.splice(itemIdx, 1);
    if (newList[catIdx].items.length === 0) {
      newList.splice(catIdx, 1);
    }
    setEditableShoppingList(newList);
  };

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setUserProfile(profile);
    // Initialize planner defaults from profile
    setMacroPref(profile.macroPreference || 'Balanced');
    setSnackPref(profile.snackPreference || 'Low Calorie');
    setSpiceLevel(profile.spiceLevel || 'Medium');
    setTasteProfile(profile.tasteProfile || 'Balanced');

    setViewState('APP'); // Temporarily show app while loading
    setIsCalibrating(true);
    try {
      const calculatedGoal = await calculateNutritionalGoals(profile);
      setGoal(calculatedGoal);
    } catch (e) {
      console.error("Failed to calc goals", e);
    } finally {
      setIsCalibrating(false);
    }
  };

  // Views
  if (viewState === 'SPLASH') {
    return (
      <AnimatePresence>
        <SplashLogo onComplete={() => setViewState('AUTH')} />
      </AnimatePresence>
    );
  }

  if (viewState === 'AUTH') {
    return <AuthWall onLogin={() => setViewState('APP')} onSignUp={() => setViewState('ONBOARDING')} />;
  }

  if (viewState === 'ONBOARDING') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (isCalibrating) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[200]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-16 h-16 border-t-2 border-emerald-500 rounded-full mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
        />
        <h2 className="text-2xl font-black tracking-tight mb-2">Synthesizing Protocol</h2>
        <p className="text-white/40 font-medium">Gemini is analyzing your biometrics...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-black text-white relative font-sans">
      <header className="px-6 pt-10 pb-6 flex justify-between items-center z-20 sticky top-0 bg-black/50 backdrop-blur-xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Logo className="w-6 h-6" />
            <h1 className="text-xl font-black tracking-tight">AURA</h1>
          </div>
          {currentView === View.TODAY && (
            <StreakCounter days={streakDays} />
          )}
        </div>
        <button onClick={() => setCurrentView(View.PROFILE)} className="w-10 h-10 rounded-2xl glass flex items-center justify-center">
          <User className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-44 relative z-10">
        <AnimatePresence mode="wait">
          {currentView === View.TODAY && (
            <PageTransition key="today">
              <div className="flex flex-col items-center py-8">
                <ProgressRing value={totals.calories} total={goal.calories} size={280} stroke={16} color={COLORS.primary} label="Remaining" />
                
                <div className="grid grid-cols-3 gap-6 my-12 w-full">
                  <MiniMacro label="Protein" value={totals.protein} total={goal.protein} color={COLORS.protein} />
                  <MiniMacro label="Carbs" value={totals.carbs} total={goal.carbs} color={COLORS.carbs} />
                  <MiniMacro label="Fats" value={totals.fats} total={goal.fats} color={COLORS.fats} />
                </div>

                <div className="w-full space-y-4">
                  <motion.div 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowHydrationModal(true)}
                    className="p-6 rounded-[2.5rem] glass flex items-center justify-between border border-white/5 cursor-pointer relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                        <Droplets className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Hydration</p>
                        <p className="text-[10px] font-black text-white/30 uppercase">{waterTotal}/{goal.water}ml</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                       <Plus className="w-3 h-3" /> Add
                    </div>
                  </motion.div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-black tracking-tight mt-6">Bio Timeline</h3>
                    {meals.length === 0 ? (
                      <div className="p-12 glass rounded-[2.5rem] text-center opacity-30 text-xs font-bold uppercase tracking-widest">Awaiting Nutrient Logs</div>
                    ) : (
                      meals.map(m => (
                        <div key={m.id} className="p-4 rounded-3xl glass border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">🍱</div>
                            <div>
                              <p className="font-bold text-sm">{m.name}</p>
                              <p className="text-[10px] text-white/40 uppercase font-black">{m.calories}kcal • {m.macros.protein}g protein</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </PageTransition>
          )}

          {currentView === View.PLANNER && (
            <PageTransition key="planner">
              <div className="py-8 space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black">Meal Planning</h2>
                    <p className="text-white/40 text-sm font-medium">Get meal ideas optimized to your tastes</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Calendar className="text-emerald-500 w-5 h-5" />
                  </div>
                </div>

                <div className="p-6 glass rounded-[2.5rem] space-y-6">
                  {/* Header Stats */}
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Target Goal</p>
                      <p className="text-sm font-bold">{goal.calories} kcal</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Protein Aim</p>
                      <p className="text-sm font-bold">{goal.protein} g</p>
                    </div>
                  </div>

                  {/* Configuration Area */}
                  <div className="space-y-6">
                    {/* Macro Focus Selector */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-emerald-500" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Meal Composition</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(['Balanced', 'High Carb', 'Low Carb', 'High Protein', 'Keto'] as MacroPreference[]).map(type => (
                          <button
                            key={type}
                            onClick={() => setMacroPref(type)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${macroPref === type ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Snack Strategy Selector */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-amber-500" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Snack Strategy</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {(['None', 'Low Calorie', 'High Protein', 'Energy Dense'] as SnackPreference[]).map(type => (
                           <button
                            key={type}
                            onClick={() => setSnackPref(type)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${snackPref === type ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                           >
                             {type}
                           </button>
                         ))}
                      </div>
                    </div>

                    {/* Taste & Spice Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Spice Level */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-rose-500" />
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Spice Level</p>
                        </div>
                        <select 
                          value={spiceLevel} 
                          onChange={e => setSpiceLevel(e.target.value as SpiceLevel)}
                          className="w-full bg-white/5 p-3 rounded-xl outline-none focus:ring-1 ring-emerald-500 text-xs font-bold text-white appearance-none"
                        >
                          {['Mild', 'Medium', 'Spicy', 'Extra Hot'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* Taste Profile */}
                       <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-indigo-500" />
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Taste</p>
                        </div>
                        <select 
                          value={tasteProfile} 
                          onChange={e => setTasteProfile(e.target.value as TasteProfile)}
                          className="w-full bg-white/5 p-3 rounded-xl outline-none focus:ring-1 ring-emerald-500 text-xs font-bold text-white appearance-none"
                        >
                          {['Savory', 'Sweet', 'Balanced', 'Umami', 'Fresh'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Custom Input */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-white/40" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Custom Nuances</p>
                      </div>
                      <input 
                        value={dietaryRestrictions} 
                        onChange={e => setDietaryRestrictions(e.target.value)}
                        placeholder="e.g. No dairy, spicy food, vegan..."
                        className="w-full bg-white/5 p-4 rounded-2xl outline-none focus:ring-1 ring-emerald-500 text-sm font-medium text-white placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {planError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      <p className="text-xs font-bold text-rose-200">{planError}</p>
                    </motion.div>
                  )}

                  <button 
                    onClick={createPlan}
                    disabled={isGeneratingPlan}
                    className="w-full py-5 bg-emerald-500 text-black font-black rounded-[2rem] flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 mt-4 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                  >
                    {isGeneratingPlan ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5 fill-black" />} 
                    Create Meal Plan
                  </button>
                </div>

                {mealPlan && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
                    <div className="p-6 glass rounded-[3rem] border border-emerald-500/10">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black">{mealPlan.name}</h3>
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                          <Clock className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase text-emerald-400">{mealPlan.prepTimeTotal}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-8">
                        {mealPlan.meals.map((m, i) => (
                          <div key={i} className="space-y-4">
                            <div className="flex items-start gap-4 p-5 bg-white/5 rounded-[2rem]">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <Utensils className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-base mb-1">{m.type}: {m.description}</p>
                                <div className="flex items-center gap-3 mb-4">
                                  <span className="text-[10px] text-white/40 uppercase font-black">{m.calories}kcal</span>
                                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                                  <span className="text-[10px] text-white/40 uppercase font-black">{m.prepTime}</span>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Prep Steps</p>
                                  {m.prepInstructions.map((step, sIdx) => (
                                    <div key={sIdx} className="flex gap-3 text-xs font-medium text-white/70 leading-relaxed">
                                      <span className="text-emerald-500 font-bold">{sIdx + 1}.</span>
                                      <p>{step}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-8 glass rounded-[3rem] space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="flex items-center gap-3 font-black uppercase text-sm tracking-widest text-white/40">
                          <ShoppingBag className="w-5 h-5" /> Shopping List
                        </h4>
                        <span className="text-[10px] font-black uppercase text-white/20">Aura Refined</span>
                      </div>
                      
                      <div className="space-y-6">
                        {editableShoppingList.map((cat, cIdx) => (
                          <div key={cIdx} className="space-y-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500/50">{cat.category}</p>
                            <div className="grid grid-cols-1 gap-2">
                              {cat.items.map((item, iIdx) => (
                                <motion.div 
                                  layout
                                  key={item}
                                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group"
                                >
                                  <span className="text-xs font-semibold text-white/80">{item}</span>
                                  <button onClick={() => removeShoppingItem(cIdx, iIdx)} className="p-1.5 text-white/10 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-8 glass rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                      <h4 className="flex items-center gap-3 font-black uppercase text-sm tracking-widest text-indigo-400">
                        <Zap className="w-5 h-5" /> Chef Tips
                      </h4>
                      <ul className="space-y-3">
                        {mealPlan.chefTips.map((tip, tIdx) => (
                          <li key={tIdx} className="flex gap-3 text-xs font-medium text-indigo-200/70 italic leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>
            </PageTransition>
          )}

          {currentView === View.CHAT && (
            <PageTransition key="chat">
              <div className="flex flex-col h-full pt-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-indigo-500 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-500/20">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Aura Intelligence</h2>
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Active Thinking Mode</p>
                  </div>
                </div>

                {/* Medical Disclaimer Banner */}
                <div className="mb-4 mx-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex gap-3 items-start">
                   <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                   <p className="text-[10px] font-medium text-indigo-200/70 leading-relaxed">
                     <strong className="text-indigo-300">Disclaimer:</strong> Aura AI provides nutritional tracking and estimates for informational purposes only. It is not a medical device and does not offer medical advice, diagnosis, or treatment. Always consult a healthcare professional.
                   </p>
                </div>

                <div className="flex-1 space-y-4 pb-12 overflow-y-auto no-scrollbar">
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-5 rounded-[2rem] ${m.role === 'user' ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'glass border border-white/10'}`}>
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  ))}
                  {isChatTyping && <div className="p-4 glass rounded-2xl w-fit flex gap-1.5 animate-pulse">
                    <div className="w-2 h-2 bg-indigo-500/40 rounded-full" />
                    <div className="w-2 h-2 bg-indigo-500/40 rounded-full" />
                    <div className="w-2 h-2 bg-indigo-500/40 rounded-full" />
                  </div>}
                </div>
                <div className="sticky bottom-4 glass p-3 rounded-[2.5rem] flex items-center gap-2 border border-white/10 shadow-2xl">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Query Aura..." className="flex-1 bg-transparent px-4 outline-none text-sm font-bold text-white placeholder:text-white/30" onKeyDown={e => e.key === 'Enter' && handleChatSend()} />
                  <button onClick={handleChatSend} className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center active:scale-90 transition-transform"><Send className="w-5 h-5 text-white" /></button>
                </div>
              </div>
            </PageTransition>
          )}

          {currentView === View.INSIGHTS && (
            <PageTransition key="insights">
              <div className="py-8 space-y-10">
                <h2 className="text-3xl font-black">Metabolic Insights</h2>
                
                {/* Calorie Chart */}
                <div className="p-8 glass rounded-[2.5rem] space-y-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Weekly Protocol Adherence</p>
                   <BarChart 
                     data={[0, 0, 0, 0, 0, 0, totals.calories]} 
                     labels={['M','T','W','T','F','S','T']} 
                     maxValue={goal.calories} 
                     color={COLORS.primary} 
                     onSelect={setSelectedCalorieIndex}
                     selectedIndex={selectedCalorieIndex}
                   />
                   <AnimatePresence>
                     {selectedCalorieIndex !== null && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-4 border-t border-white/5">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-emerald-400">
                               {selectedCalorieIndex === 6 ? `${totals.calories} kcal` : '0 kcal'}
                            </span>
                            <span className="text-[10px] uppercase text-white/30 font-black">Day {selectedCalorieIndex + 1}</span>
                         </div>
                         <p className="text-xs text-white/50 leading-relaxed">
                            {selectedCalorieIndex === 6 ? "Your metabolic intake is active." : "No protocol data logged for this cycle."}
                         </p>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

                {/* Hydration Chart */}
                <div className="p-8 glass rounded-[2.5rem] space-y-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/50">Hydration Velocity (ml)</p>
                   <BarChart 
                     data={[0, 0, 0, 0, 0, 0, waterTotal]} 
                     labels={['M','T','W','T','F','S','T']} 
                     maxValue={goal.water} 
                     color={COLORS.water} 
                     onSelect={setSelectedHydrationIndex}
                     selectedIndex={selectedHydrationIndex}
                   />
                   <AnimatePresence>
                     {selectedHydrationIndex !== null && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-4 border-t border-white/5">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-cyan-400">
                               {selectedHydrationIndex === 6 ? `${waterTotal} ml` : '0 ml'}
                            </span>
                            <span className="text-[10px] uppercase text-white/30 font-black">Day {selectedHydrationIndex + 1}</span>
                         </div>
                         <p className="text-xs text-white/50 leading-relaxed">
                            {selectedHydrationIndex === 6 ? "Hydration levels are tracking." : "Fluid intake data unavailable."}
                         </p>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

                {/* Weight Chart */}
                <div className="p-8 glass rounded-[2.5rem] space-y-6">
                   <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Bio Mass Trajectory</p>
                     <TrendingUp className="w-4 h-4 text-white/20" />
                   </div>
                   <LineChart 
                     data={new Array(7).fill(userProfile?.weight || 0)} 
                     color={COLORS.protein} 
                     onSelect={setSelectedWeightIndex}
                     selectedIndex={selectedWeightIndex}
                   />
                   <AnimatePresence>
                     {selectedWeightIndex !== null && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-4 border-t border-white/5">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-blue-400">
                               {userProfile?.weight || 0} kg
                            </span>
                            <span className="text-[10px] uppercase text-white/30 font-black">Measurement {selectedWeightIndex + 1}</span>
                         </div>
                         <p className="text-xs text-white/50 leading-relaxed">
                            Baseline established. Consistent tracking required for trend analysis.
                         </p>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </div>
            </PageTransition>
          )}

          {currentView === View.PROFILE && (
            <PageTransition key="profile">
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 relative">
                  <User className="w-12 h-12 text-emerald-500" />
                  {!isEditingProfile && (
                    <button 
                      onClick={startEditingProfile}
                      className="absolute bottom-0 right-0 p-3 bg-white/10 rounded-full border border-white/10 hover:bg-white/20 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                
                {isEditingProfile && tempProfile ? (
                   <div className="mb-8 space-y-4 w-full px-4">
                     <input 
                       value={tempProfile.name} 
                       onChange={e => setTempProfile({...tempProfile, name: e.target.value})}
                       className="text-3xl font-black bg-transparent border-b border-white/20 text-center w-full outline-none focus:border-emerald-500 p-2"
                     />
                     <div className="flex gap-2 justify-center">
                       <button onClick={() => setTempProfile({...tempProfile, primaryGoal: 'Lose Weight'})} className={`px-3 py-1 rounded-full text-xs font-bold ${tempProfile.primaryGoal === 'Lose Weight' ? 'bg-indigo-500' : 'bg-white/10'}`}>Lose Weight</button>
                       <button onClick={() => setTempProfile({...tempProfile, primaryGoal: 'Maintain'})} className={`px-3 py-1 rounded-full text-xs font-bold ${tempProfile.primaryGoal === 'Maintain' ? 'bg-indigo-500' : 'bg-white/10'}`}>Maintain</button>
                       <button onClick={() => setTempProfile({...tempProfile, primaryGoal: 'Gain Muscle'})} className={`px-3 py-1 rounded-full text-xs font-bold ${tempProfile.primaryGoal === 'Gain Muscle' ? 'bg-indigo-500' : 'bg-white/10'}`}>Gain Muscle</button>
                     </div>
                   </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-black mb-1">{userProfile?.name || 'Alpha Explorer'}</h2>
                    <p className="text-white/40 font-medium mb-12">Tier 1 Biohacker • {userProfile?.primaryGoal || 'Optimizing'}</p>
                  </>
                )}
                
                <div className="w-full space-y-6">
                  {userProfile && (
                     <div className="p-8 glass rounded-[2.5rem] border border-white/5 space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                           <span className="text-xs font-bold uppercase text-white/30">Stats</span>
                           {isEditingProfile ? (
                             <span className="text-xs font-bold text-amber-500 uppercase flex items-center gap-1"><Edit3 className="w-3 h-3" /> Editing</span>
                           ) : (
                             <span className="text-xs font-bold text-emerald-500 uppercase">Live</span>
                           )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-left">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-white/20">Height (cm)</p>
                            {isEditingProfile && tempProfile ? (
                              <input 
                                type="number"
                                value={tempProfile.height}
                                onChange={e => setTempProfile({...tempProfile, height: parseInt(e.target.value) || 0})}
                                className="w-full bg-white/5 rounded-lg p-2 text-xl font-black outline-none focus:ring-1 ring-emerald-500"
                              />
                            ) : (
                              <p className="text-xl font-black">{userProfile.height}cm</p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-white/20">Weight (kg)</p>
                            {isEditingProfile && tempProfile ? (
                              <input 
                                type="number"
                                value={tempProfile.weight}
                                onChange={e => setTempProfile({...tempProfile, weight: parseInt(e.target.value) || 0})}
                                className="w-full bg-white/5 rounded-lg p-2 text-xl font-black outline-none focus:ring-1 ring-emerald-500"
                              />
                            ) : (
                              <p className="text-xl font-black">{userProfile.weight}kg</p>
                            )}
                          </div>
                           <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-white/20">Age</p>
                            {isEditingProfile && tempProfile ? (
                              <input 
                                type="number"
                                value={tempProfile.age}
                                onChange={e => setTempProfile({...tempProfile, age: parseInt(e.target.value) || 0})}
                                className="w-full bg-white/5 rounded-lg p-2 text-xl font-black outline-none focus:ring-1 ring-emerald-500"
                              />
                            ) : (
                              <p className="text-xl font-black">{userProfile.age}</p>
                            )}
                          </div>
                           <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-white/20">Activity</p>
                            {isEditingProfile && tempProfile ? (
                               <select 
                                 value={tempProfile.activityLevel}
                                 onChange={e => setTempProfile({...tempProfile, activityLevel: e.target.value as ActivityLevel})}
                                 className="w-full bg-white/5 rounded-lg p-2 text-sm font-bold outline-none focus:ring-1 ring-emerald-500 appearance-none"
                               >
                                 <option value="Sedentary">Sedentary</option>
                                 <option value="Lightly Active">Lightly Active</option>
                                 <option value="Moderately Active">Moderately Active</option>
                                 <option value="Very Active">Very Active</option>
                               </select>
                            ) : (
                              <p className="text-sm font-bold truncate">{userProfile.activityLevel}</p>
                            )}
                          </div>
                        </div>
                        
                        {isEditingProfile && (
                           <motion.button 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             onClick={saveProfile}
                             className="w-full py-4 bg-emerald-500 text-black font-black rounded-2xl flex items-center justify-center gap-2"
                           >
                             <Save className="w-5 h-5" /> Save Protocol
                           </motion.button>
                        )}
                     </div>
                  )}

                  {!isEditingProfile && (
                    <button 
                      onClick={() => setViewState('AUTH')}
                      className="w-full p-6 glass rounded-[2rem] flex justify-center items-center gap-3 text-rose-400 font-bold hover:bg-rose-500/10 transition-colors"
                    >
                      Logout Session
                    </button>
                  )}
                </div>
              </div>
            </PageTransition>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Dock */}
      <div className="fixed bottom-0 inset-x-0 h-40 flex justify-center items-center z-50 pointer-events-none bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="pointer-events-auto flex items-center gap-2 bg-neutral-900/90 backdrop-blur-3xl p-3 rounded-[2.8rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] translate-y-[-15px]">
          <button onClick={() => setCurrentView(View.TODAY)} className={`p-4 rounded-2xl transition-all duration-300 ${currentView === View.TODAY ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/20'}`}><Home /></button>
          <button onClick={() => setCurrentView(View.PLANNER)} className={`p-4 rounded-2xl transition-all duration-300 ${currentView === View.PLANNER ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/20'}`}><Calendar /></button>
          <button 
            onClick={() => setIsLoggingOpen(!isLoggingOpen)}
            className="w-18 h-18 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-black shadow-xl shadow-emerald-500/30 active:scale-95 transition-all mx-2"
          >
            <Plus className={`w-9 h-9 stroke-[3] transition-transform duration-500 ${isLoggingOpen ? 'rotate-45' : ''}`} />
          </button>
          <button onClick={() => setCurrentView(View.CHAT)} className={`p-4 rounded-2xl transition-all duration-300 ${currentView === View.CHAT ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/20'}`}><MessageCircle /></button>
          <button onClick={() => setCurrentView(View.INSIGHTS)} className={`p-4 rounded-2xl transition-all duration-300 ${currentView === View.INSIGHTS ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/20'}`}><PieChart /></button>
        </div>
      </div>

      <AnimatePresence>
        {/* Hydration Modal */}
        {showHydrationModal && (
          <HydrationModal 
            currentAmount={waterTotal}
            target={goal.water}
            onClose={() => setShowHydrationModal(false)}
            onAdd={(amount) => setHydration([...hydration, { timestamp: Date.now(), amount }])}
          />
        )}
        
        {isLoggingOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLoggingOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[55]" />
            <motion.div initial={{ y: 100, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 100, opacity: 0, scale: 0.9 }} className="fixed bottom-40 left-8 right-8 z-[60] flex flex-col gap-5">
              
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              
              <button 
                onClick={() => { setCurrentView(View.CAMERA); setIsLoggingOpen(false); }} 
                className="w-full bg-white text-black p-7 rounded-[2.5rem] flex items-center justify-between font-black shadow-2xl active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center"><CameraIcon className="w-6 h-6" /></div>
                  <div className="text-left">
                    <p className="text-lg">Bio Scan AI</p>
                    <p className="text-[10px] text-black/30 uppercase font-black">Camera Analysis</p>
                  </div>
                </div>
                <ChevronRight className="opacity-30" />
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="w-full bg-indigo-500 text-white p-7 rounded-[2.5rem] flex items-center justify-between font-black shadow-2xl shadow-indigo-500/20 active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><ImageIcon className="w-6 h-6 text-white" /></div>
                  <div className="text-left">
                    <p className="text-lg">Upload Bio-Data</p>
                    <p className="text-[10px] text-indigo-200 uppercase font-black">Gallery Import</p>
                  </div>
                </div>
                <ChevronRight className="opacity-30" />
              </button>

              <div className="p-8 rounded-[3rem] glass border border-white/10 flex flex-col gap-6 shadow-2xl">
                <div className="flex items-center gap-4 px-2 opacity-30 text-[11px] font-black uppercase tracking-[0.2em]"><TextIcon className="w-5 h-5" /> Quick Protocol Log</div>
                <div className="relative">
                  <input autoFocus onKeyDown={e => e.key === 'Enter' && handleManualLog(e.currentTarget.value)} placeholder="Log by description..." className="w-full bg-white/5 p-5 rounded-[1.8rem] outline-none font-bold placeholder:text-white/10 text-white" />
                  <button onClick={(e) => { const input = (e.currentTarget.previousSibling as HTMLInputElement); handleManualLog(input.value); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center active:scale-90 transition-transform">
                    <ChevronRight className="w-6 h-6 text-black" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
        {currentView === View.CAMERA && <CameraView onCapture={handleCapture} onClose={() => setCurrentView(View.TODAY)} isProcessing={isProcessing} />}
        {currentEstimate && (
          <NutritionModal 
            estimate={currentEstimate} 
            onConfirm={confirmLog} 
            onCancel={() => setCurrentEstimate(null)} 
            onRecalculate={handleRecalculate}
            isRecalculating={isProcessing}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
