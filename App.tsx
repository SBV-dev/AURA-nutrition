
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Plus, Home, Calendar, MessageCircle, PieChart, User, Camera as CameraIcon, 
  Type as TextIcon, ChevronRight, Sparkles, Droplets, Flame, Target, 
  ArrowLeft, Utensils, Send, Loader2, Check, Zap, CheckCircle2, ShieldAlert,
  Clock, ShoppingBag, Info, X, ChevronDown, ListChecks, Trash2, Mail, Lock,
  Ruler, Weight, Activity, Trophy, Settings2, Coffee, Leaf, AlertCircle, Edit3, Save, Image as ImageIcon,
  TrendingUp, Star, Thermometer, Bookmark, History, FileText, Moon, Sun, KeyRound, LogOut
} from 'lucide-react';

import { View, Meal, UserGoal, NutritionEstimateResponse, HydrationEntry, WeightEntry, Message, MealPlan, ShoppingCategory, UserProfile, Gender, ActivityLevel, GoalType, MacroPreference, SnackPreference, SpiceLevel, TasteProfile } from './types.ts';
import { COLORS, DEFAULT_GOAL, SPRING_TRANSITION } from './constants.ts';
import { ProgressRing, MiniMacro } from './components/ProgressRing.tsx';
import { CameraView } from './components/CameraView.tsx';
import { NutritionModal } from './components/NutritionModal.tsx';
import { HydrationModal } from './components/HydrationModal.tsx';
import { BarChart, LineChart } from './components/Charts.tsx';
import { SplashLogo } from './components/SplashLogo.tsx';
import { Logo } from './components/Logo.tsx';
import { estimateNutrition, getChatResponse, generateMealPlan, calculateNutritionalGoals } from './services/geminiService.ts';
import { PageTransition } from './components/MotionWrapper.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.tsx';

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
    <motion.div 
      className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/10 to-transparent"
      animate={{ x: ['-150%', '150%'] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
    />
    <motion.div
      animate={{ 
        scale: [1, 1.15, 1],
        filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10"
    >
      <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
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

const AuthScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { login, register, resetPassword, loginWithGoogle, isLoading, error, clearError } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [view, setView] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (view === 'LOGIN') {
        await login(email, password);
        onComplete();
      } else if (view === 'REGISTER') {
        await register(email, password);
        onComplete();
      } else if (view === 'FORGOT') {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (e) {}
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onComplete();
    } catch (e) {}
  };

  const bgClasses = theme === 'dark' ? "bg-black" : "bg-slate-50 text-slate-900";
  const inputClasses = theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:bg-white/10 placeholder:text-white/30" : "bg-white border-slate-200 text-slate-900 focus:bg-white placeholder:text-slate-400 shadow-sm";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[200] ${bgClasses} flex flex-col items-center justify-center p-8 overflow-y-auto transition-colors duration-500`}>
      <button onClick={toggleTheme} className={`absolute top-8 right-8 p-3 rounded-full ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-200 text-slate-700'}`}>
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[100%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>
      <motion.div key={view} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="z-10 text-center flex flex-col items-center w-full max-w-sm">
        <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20 border backdrop-blur-xl ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
          <Logo className="w-16 h-16" />
        </div>
        <h1 className={`text-4xl font-black tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>AURA</h1>
        <p className={`mb-10 font-medium ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'}`}>
          {view === 'LOGIN' && "Access your metabolic profile."}
          {view === 'REGISTER' && "Begin your optimization journey."}
          {view === 'FORGOT' && "Recover your account access."}
        </p>
        {resetSent && view === 'FORGOT' ? (
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl w-full text-center">
             <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
             <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Check your email</h3>
             <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>We've sent a recovery link to {email}</p>
             <button onClick={() => setView('LOGIN')} className="mt-4 text-sm font-bold text-emerald-500">Back to Login</button>
           </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
            <div className="relative group">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${theme === 'dark' ? 'text-white/20 group-focus-within:text-emerald-500' : 'text-slate-400 group-focus-within:text-emerald-600'}`} />
              <input type="email" placeholder="Email address" required className={`w-full border rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500/50 transition-all font-medium ${inputClasses}`} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {view !== 'FORGOT' && (
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${theme === 'dark' ? 'text-white/20 group-focus-within:text-emerald-500' : 'text-slate-400 group-focus-within:text-emerald-600'}`} />
                <input type="password" placeholder="Password" required className={`w-full border rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500/50 transition-all font-medium ${inputClasses}`} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
            {view === 'LOGIN' && <div className="flex justify-end"><button type="button" onClick={() => setView('FORGOT')} className={`text-xs font-bold transition-colors ${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>Forgot Password?</button></div>}
            <button type="submit" disabled={isLoading} className={`w-full py-4 bg-emerald-500 text-black font-black rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70' : ''}`}>
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (view === 'LOGIN' ? 'Sign In' : (view === 'REGISTER' ? 'Create Account' : 'Send Reset Link'))}
            </button>
          </form>
        )}
        <div className="w-full flex items-center gap-4 my-8">
          <div className={`h-[1px] flex-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>or continue with</span>
          <div className={`h-[1px] flex-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`} />
        </div>
        <button type="button" onClick={handleGoogleLogin} disabled={isLoading} className={`w-full py-4 border font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700 shadow-sm'} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google Account
        </button>
        <button onClick={() => { setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN'); clearError(); setResetSent(false); }} className={`mt-8 text-xs font-bold transition-colors ${theme === 'dark' ? 'text-white/30 hover:text-white/60' : 'text-slate-400 hover:text-slate-700'}`}>
          {view === 'LOGIN' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </motion.div>
    </motion.div>
  );
};

const Onboarding: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<UserProfile>>({ gender: 'Male', activityLevel: 'Moderately Active', primaryGoal: 'Maintain', macroPreference: 'Balanced', snackPreference: 'Low Calorie', spiceLevel: 'Medium', tasteProfile: 'Balanced' });
  const update = (key: keyof UserProfile, val: any) => setData(p => ({...p, [key]: val}));
  const steps = [
    (
      <div className="space-y-6 w-full max-w-sm">
        <h2 className="text-3xl font-black">Welcome to Aura</h2>
        <p className={`font-medium ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>Let's build your metabolic profile.</p>
        <div className="space-y-4">
           <div>
             <label className={`text-xs font-bold uppercase mb-2 block ${theme === 'dark' ? 'text-white/50' : 'text-slate-400'}`}>First Name</label>
             <input value={data.name || ''} onChange={e => update('name', e.target.value)} className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-white border text-slate-900'}`} placeholder="Your Name" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`text-xs font-bold uppercase mb-2 block ${theme === 'dark' ? 'text-white/50' : 'text-slate-400'}`}>Age</label>
                <input type="number" value={data.age || ''} onChange={e => update('age', parseInt(e.target.value))} className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-white border text-slate-900'}`} placeholder="25" />
              </div>
              <div>
                 <label className={`text-xs font-bold uppercase mb-2 block ${theme === 'dark' ? 'text-white/50' : 'text-slate-400'}`}>Gender</label>
                 <select value={data.gender} onChange={e => update('gender', e.target.value)} className={`w-full p-4 rounded-2xl outline-none font-bold appearance-none ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-white border text-slate-900'}`}>
                    {['Male', 'Female', 'Other'].map(o => <option key={o}>{o}</option>)}
                 </select>
              </div>
           </div>
        </div>
        <button onClick={() => setStep(1)} disabled={!data.name || !data.age} className="w-full py-4 bg-emerald-500 text-black font-black rounded-2xl disabled:opacity-50">Continue</button>
      </div>
    ),
    (
      <div className="space-y-6 w-full max-w-sm">
        <h2 className="text-3xl font-black">Body Metrics</h2>
        <p className={`font-medium ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>For accurate caloric calculations.</p>
        <div className="space-y-4">
           <div>
             <label className={`text-xs font-bold uppercase mb-2 block ${theme === 'dark' ? 'text-white/50' : 'text-slate-400'}`}>Height (cm)</label>
             <input type="number" value={data.height || ''} onChange={e => update('height', parseInt(e.target.value))} className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-white border text-slate-900'}`} placeholder="175" />
           </div>
           <div>
             <label className={`text-xs font-bold uppercase mb-2 block ${theme === 'dark' ? 'text-white/50' : 'text-slate-400'}`}>Weight (kg)</label>
             <input type="number" value={data.weight || ''} onChange={e => update('weight', parseInt(e.target.value))} className={`w-full p-4 rounded-2xl outline-none font-bold ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-white border text-slate-900'}`} placeholder="70" />
           </div>
        </div>
        <div className="flex gap-4">
            <button onClick={() => setStep(0)} className="flex-1 py-4 font-bold opacity-50">Back</button>
            <button onClick={() => setStep(2)} disabled={!data.height || !data.weight} className="flex-1 py-4 bg-emerald-500 text-black font-black rounded-2xl disabled:opacity-50">Continue</button>
        </div>
      </div>
    ),
    (
      <div className="space-y-6 w-full max-w-sm">
        <h2 className="text-3xl font-black">Lifestyle</h2>
        <div className="space-y-4">
           <div>
             <label className={`text-xs font-bold uppercase mb-2 block ${theme === 'dark' ? 'text-white/50' : 'text-slate-400'}`}>Activity Level</label>
             <select value={data.activityLevel} onChange={e => update('activityLevel', e.target.value)} className={`w-full p-4 rounded-2xl outline-none font-bold appearance-none ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-white border text-slate-900'}`}>
                {['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Super Active'].map(o => <option key={o}>{o}</option>)}
             </select>
           </div>
           <div>
             <label className={`text-xs font-bold uppercase mb-2 block ${theme === 'dark' ? 'text-white/50' : 'text-slate-400'}`}>Primary Goal</label>
             <div className="grid grid-cols-1 gap-2">
                {(['Lose Weight', 'Maintain', 'Gain Muscle'] as GoalType[]).map(g => (
                    <button key={g} onClick={() => update('primaryGoal', g)} className={`p-4 rounded-2xl border font-bold text-left transition-all ${data.primaryGoal === g ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : `${theme === 'dark' ? 'border-transparent bg-white/5 opacity-60' : 'border-transparent bg-slate-100 text-slate-600'}`}`}>
                        {g}
                    </button>
                ))}
             </div>
           </div>
        </div>
        <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold opacity-50">Back</button>
            <button onClick={() => onComplete(data as UserProfile)} className="flex-1 py-4 bg-emerald-500 text-black font-black rounded-2xl">Complete</button>
        </div>
      </div>
    )
  ];
  return (
    <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 transition-colors duration-500 ${theme === 'dark' ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="w-full max-w-sm mb-8 flex gap-2">{[0,1,2].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-emerald-500' : `${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}`} />)}</div>
        {steps[step]}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [viewState, setViewState] = useState<'SPLASH' | 'APP'>('SPLASH');
  const [currentView, setCurrentView] = useState<View>(View.TODAY);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [hydration, setHydration] = useState<HydrationEntry[]>([]);
  const [goal, setGoal] = useState<UserGoal>(DEFAULT_GOAL);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [savedPlans, setSavedPlans] = useState<MealPlan[]>([]);
  
  const [isLoggingOpen, setIsLoggingOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState<NutritionEstimateResponse | null>(null);
  const [streakDays, setStreakDays] = useState(0);

  const [showHydrationModal, setShowHydrationModal] = useState(false);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  
  const [chatMessages, setChatMessages] = useState<Message[]>([{ role: 'model', text: 'How can I assist your nutrition today?' }]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);

  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [macroPref, setMacroPref] = useState<MacroPreference>('Balanced');
  const [snackPref, setSnackPref] = useState<SnackPreference>('Low Calorie');
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>('Medium');
  const [tasteProfile, setTasteProfile] = useState<TasteProfile>('Balanced');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [activePlanTab, setActivePlanTab] = useState<'MEALS' | 'SHOPPING'>('MEALS');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence: Load on startup
  useEffect(() => {
    if (user && !authLoading) {
      const uId = user.id;
      const storedMeals = localStorage.getItem(`aura_meals_${uId}`);
      const storedHydration = localStorage.getItem(`aura_hydration_${uId}`);
      const storedGoal = localStorage.getItem(`aura_goal_${uId}`);
      const storedProfile = localStorage.getItem(`aura_profile_${uId}`);
      const storedPlans = localStorage.getItem(`aura_plans_${uId}`);
      const storedChat = localStorage.getItem(`aura_chat_${uId}`);

      if (storedMeals) setMeals(JSON.parse(storedMeals));
      if (storedHydration) setHydration(JSON.parse(storedHydration));
      if (storedGoal) setGoal(JSON.parse(storedGoal));
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setUserProfile(parsedProfile);
        setMacroPref(parsedProfile.macroPreference || 'Balanced');
        setSnackPref(parsedProfile.snackPreference || 'Low Calorie');
        setSpiceLevel(parsedProfile.spiceLevel || 'Medium');
        setTasteProfile(parsedProfile.tasteProfile || 'Balanced');
      }
      if (storedPlans) {
        const plans = JSON.parse(storedPlans);
        setSavedPlans(plans);
        if (plans.length > 0) setMealPlan(plans[0]);
      }
      if (storedChat) setChatMessages(JSON.parse(storedChat));

      const hasOnboarded = localStorage.getItem(`aura_onboarding_${uId}`);
      setNeedsOnboarding(!hasOnboarded);
    }
  }, [user, authLoading]);

  // Persistence: Save on change
  useEffect(() => {
    if (user) {
      const uId = user.id;
      localStorage.setItem(`aura_meals_${uId}`, JSON.stringify(meals));
      localStorage.setItem(`aura_hydration_${uId}`, JSON.stringify(hydration));
      localStorage.setItem(`aura_goal_${uId}`, JSON.stringify(goal));
      localStorage.setItem(`aura_plans_${uId}`, JSON.stringify(savedPlans));
      localStorage.setItem(`aura_chat_${uId}`, JSON.stringify(chatMessages));
      if (userProfile) localStorage.setItem(`aura_profile_${uId}`, JSON.stringify(userProfile));
    }
  }, [meals, hydration, goal, userProfile, savedPlans, chatMessages, user]);

  const totals = useMemo(() => meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.macros.protein,
    carbs: acc.carbs + meal.macros.carbs,
    fats: acc.fats + meal.macros.fats,
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 }), [meals]);

  const waterTotal = useMemo(() => hydration.reduce((acc, curr) => acc + curr.amount, 0), [hydration]);

  const appBgClass = theme === 'dark' ? 'bg-black text-white' : 'bg-slate-50 text-slate-900';
  const glassClass = theme === 'dark' ? 'glass' : 'bg-white border border-slate-200 shadow-sm';
  const glassInputClass = theme === 'dark' ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400';
  const subTextClass = theme === 'dark' ? 'text-white/40' : 'text-slate-500';

  const startEditingProfile = () => { if (userProfile) { setTempProfile({...userProfile}); setIsEditingProfile(true); } };

  const saveProfile = async () => {
    if (tempProfile && user) {
      setUserProfile(tempProfile);
      localStorage.setItem(`aura_profile_${user.id}`, JSON.stringify(tempProfile));
      setIsEditingProfile(false);
      setIsCalibrating(true);
      try {
        const newGoals = await calculateNutritionalGoals(tempProfile);
        setGoal(newGoals);
      } catch (e) { console.error("Recalibration failed", e); } finally { setIsCalibrating(false); }
    }
  };

  const handleCapture = async (base64: string) => {
    setIsProcessing(true);
    try { const estimate = await estimateNutrition({ imageBase64: base64 }); setCurrentEstimate(estimate); } catch (err) { console.error(err); } finally { setIsProcessing(false); }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoggingOpen(false);
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        const mimeType = result.split(';')[0].split(':')[1];
        try { const estimate = await estimateNutrition({ imageBase64: base64String, mimeType }); setCurrentEstimate(estimate); } catch (err) { console.error(err); } finally { setIsProcessing(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualLog = async (description: string) => {
    if (!description.trim()) return;
    setIsLoggingOpen(false);
    setIsProcessing(true);
    try { const estimate = await estimateNutrition({ text: description }); setCurrentEstimate(estimate); } catch (err) { console.error(err); } finally { setIsProcessing(false); }
  };

  const handleRecalculate = async (newDescription: string) => {
    setIsProcessing(true);
    try { const estimate = await estimateNutrition({ text: newDescription }); setCurrentEstimate(estimate); } catch (err) { console.error(err); } finally { setIsProcessing(false); }
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
    const newHistory: Message[] = [...chatMessages, { role: 'user', text: msg }];
    setChatMessages(newHistory);
    setChatInput('');
    setIsChatTyping(true);
    try {
      const res = await getChatResponse(newHistory, msg, {
        profile: userProfile,
        goals: goal,
        meals: meals,
        hydration: waterTotal
      });
      setChatMessages([...newHistory, { role: 'model', text: res }]);
    } catch (err) {
      setChatMessages([...newHistory, { role: 'model', text: "Bio-database sync failed. Please check connection." }]);
    } finally { setIsChatTyping(false); }
  };

  const handleOnboardingComplete = async (profile: UserProfile) => {
    if (!user) return;
    setUserProfile(profile);
    localStorage.setItem(`aura_profile_${user.id}`, JSON.stringify(profile));
    localStorage.setItem(`aura_onboarding_${user.id}`, 'true');
    setNeedsOnboarding(false);
    setIsCalibrating(true);
    try {
      const calculatedGoal = await calculateNutritionalGoals(profile);
      setGoal(calculatedGoal);
    } catch (e) { console.error("Goal synthesis failed", e); } finally { setIsCalibrating(false); }
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    setPlanError(null);
    try {
      const plan = await generateMealPlan(goal, {
        macroPreference: macroPref,
        snackPreference: snackPref,
        spiceLevel,
        tasteProfile,
        dietaryRestrictions
      });
      setMealPlan(plan);
      setSavedPlans([plan, ...savedPlans]);
    } catch (err) {
      console.error(err);
      setPlanError("Metabolic synthesis failed. The model is currently recalibrating. Please try again.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  if (viewState === 'SPLASH') return <AnimatePresence><SplashLogo onComplete={() => setViewState('APP')} /></AnimatePresence>;
  if (!user && !authLoading) return <AuthScreen onComplete={() => {}} />;
  if (user && needsOnboarding) return <Onboarding onComplete={handleOnboardingComplete} />;

  if (isCalibrating) {
    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-center z-[200] ${appBgClass}`}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-16 h-16 border-t-2 border-emerald-500 rounded-full mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]" />
        <h2 className="text-2xl font-black tracking-tight mb-2">Synthesizing Profile</h2>
        <p className="opacity-40 font-medium">Analyzing metabolic pathways...</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto relative font-sans transition-colors duration-500 ${appBgClass}`}>
      <header className={`px-6 pt-10 pb-6 flex justify-between items-center z-20 sticky top-0 backdrop-blur-xl ${theme === 'dark' ? 'bg-black/50' : 'bg-white/50 border-b border-slate-200/50'}`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Logo className="w-6 h-6" />
            <h1 className="text-xl font-black tracking-tight">AURA</h1>
          </div>
          {currentView === View.TODAY && <StreakCounter days={streakDays} />}
        </div>
        <button onClick={() => setCurrentView(View.PROFILE)} className={`w-10 h-10 rounded-2xl flex items-center justify-center ${glassClass}`}>
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
                  <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowHydrationModal(true)} className={`p-6 rounded-[2.5rem] flex items-center justify-between cursor-pointer relative overflow-hidden group ${glassClass}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center"><Droplets className="w-6 h-6 text-cyan-400" /></div>
                      <div>
                        <p className="text-sm font-bold">Hydration</p>
                        <p className={`text-[10px] font-black uppercase ${subTextClass}`}>{waterTotal}/{goal.water}ml</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100 text-slate-600'}`}>
                       <Plus className="w-3 h-3" /> Add
                    </div>
                  </motion.div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-black tracking-tight mt-6">Timeline</h3>
                    {meals.length === 0 ? <div className={`p-12 rounded-[2.5rem] text-center opacity-30 text-xs font-bold uppercase tracking-widest ${glassClass}`}>Awaiting logs</div> : (
                      meals.map(m => (
                        <motion.div key={m.id} whileHover={{ scale: 1.02 }} className={`p-4 rounded-3xl flex items-center justify-between ${glassClass}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>🍱</div>
                            <div>
                              <p className="font-bold text-sm">{m.name}</p>
                              <p className={`text-[10px] uppercase font-black ${subTextClass}`}>{m.calories}kcal • {m.macros.protein}g protein</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-20" />
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </PageTransition>
          )}

          {currentView === View.PLANNER && (
            <PageTransition key="planner">
              <div className="flex flex-col pt-4 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-emerald-500/20"><Calendar className="w-8 h-8 text-black" /></div>
                  <div>
                    <h2 className="text-2xl font-black">Daily Architect</h2>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${subTextClass}`}>Meal Synthesis Engine</p>
                  </div>
                </div>

                {!mealPlan ? (
                  <div className={`p-8 rounded-[2.5rem] ${glassClass} space-y-8`}>
                    <div className="text-center space-y-2">
                       <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                       <h3 className="text-xl font-bold">Generate Bio-Compatible Plan</h3>
                       <p className={`text-sm ${subTextClass}`}>Tailored to your current metabolic state and preferences.</p>
                    </div>

                    <div className="space-y-6">
                       <div>
                         <label className="text-[10px] font-black uppercase text-white/40 mb-3 block">Macro Preference</label>
                         <div className="grid grid-cols-2 gap-2">
                            {['Balanced', 'Low Carb', 'High Protein', 'Keto'].map(m => (
                               <button key={m} onClick={() => setMacroPref(m as any)} className={`p-3 rounded-xl border text-xs font-bold transition-all ${macroPref === m ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 border-white/5 opacity-50'}`}>
                                 {m}
                               </button>
                            ))}
                         </div>
                       </div>
                       <div>
                         <label className="text-[10px] font-black uppercase text-white/40 mb-3 block">Dietary Restrictions</label>
                         <input value={dietaryRestrictions} onChange={e => setDietaryRestrictions(e.target.value)} placeholder="e.g. Dairy free, Nut allergy" className={`w-full p-4 rounded-xl outline-none text-sm font-bold ${glassInputClass}`} />
                       </div>
                    </div>

                    {planError && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold text-center animate-pulse">{planError}</div>}

                    <button onClick={handleGeneratePlan} disabled={isGeneratingPlan} className="w-full py-5 bg-emerald-500 text-black font-black rounded-[1.8rem] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                      {isGeneratingPlan ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Zap className="w-5 h-5 fill-black" /> Synthesize Plan</>}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 backdrop-blur-md">
                       {(['MEALS', 'SHOPPING'] as const).map(t => (
                         <button key={t} onClick={() => setActivePlanTab(t)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activePlanTab === t ? 'bg-white text-black shadow-lg' : 'opacity-40'}`}>
                           {t}
                         </button>
                       ))}
                    </div>

                    {activePlanTab === 'MEALS' ? (
                      <div className="space-y-4">
                        {mealPlan.meals.map((m, i) => (
                           <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`p-6 rounded-[2rem] space-y-4 ${glassClass}`}>
                             <div className="flex justify-between items-start">
                                <div>
                                   <div className="flex items-center gap-2 mb-1">
                                      {m.type === 'Breakfast' && <Coffee className="w-4 h-4 text-emerald-400" />}
                                      {m.type === 'Lunch' && <Sun className="w-4 h-4 text-orange-400" />}
                                      {m.type === 'Dinner' && <Moon className="w-4 h-4 text-indigo-400" />}
                                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{m.type}</span>
                                   </div>
                                   <h4 className="text-lg font-black">{m.description}</h4>
                                </div>
                                <div className="text-right">
                                   <p className="text-xl font-black text-emerald-400">{m.calories}</p>
                                   <p className="text-[9px] font-black uppercase opacity-40">kcal</p>
                                </div>
                             </div>
                             <div className="flex gap-4">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400" /> <span className="text-[10px] font-bold">{m.macros.protein}g P</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400" /> <span className="text-[10px] font-bold">{m.macros.carbs}g C</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-400" /> <span className="text-[10px] font-bold">{m.macros.fats}g F</span></div>
                             </div>
                             <div className="pt-4 border-t border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Instructions</p>
                                <ul className="space-y-2">
                                   {m.prepInstructions.map((step, si) => (
                                     <li key={si} className="text-xs font-medium flex gap-3"><span className="text-emerald-500 font-black">{si+1}.</span> {step}</li>
                                   ))}
                                </ul>
                             </div>
                           </motion.div>
                        ))}
                        <button onClick={() => setMealPlan(null)} className={`w-full p-5 rounded-[1.8rem] text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity border border-white/5`}>
                           Discard and Regenerate
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                         {mealPlan.categorizedShoppingList.map((cat, ci) => (
                            <motion.div key={ci} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-[2rem] ${glassClass}`}>
                               <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-emerald-500" /> {cat.category}</h4>
                               <ul className="space-y-3">
                                  {cat.items.map((it, ii) => (
                                    <li key={ii} className="flex items-center gap-3 group cursor-pointer">
                                       <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                                          <Check className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100" />
                                       </div>
                                       <span className="text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">{it}</span>
                                    </li>
                                  ))}
                               </ul>
                            </motion.div>
                         ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </PageTransition>
          )}

          {currentView === View.INSIGHTS && (
            <PageTransition key="insights">
              <div className="flex flex-col pt-4 gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-500/20"><PieChart className="w-8 h-8 text-white" /></div>
                  <div>
                    <h2 className="text-2xl font-black">Metabolic Pulse</h2>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${subTextClass}`}>Live Analytics</p>
                  </div>
                </div>

                <div className={`p-8 rounded-[2.5rem] ${glassClass}`}>
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black">7-Day Calorie Trend</h3>
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                   </div>
                   <BarChart 
                      data={[2100, 2350, 1980, 2200, 2450, 2100, totals.calories]} 
                      labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']} 
                      maxValue={3000} 
                      color={COLORS.primary} 
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className={`p-6 rounded-[2rem] ${glassClass}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${subTextClass}`}>Avg Protein</p>
                      <p className="text-2xl font-black">154<span className="text-xs ml-1 opacity-40">g</span></p>
                      <div className="h-1 w-full bg-blue-500/20 rounded-full mt-3 overflow-hidden">
                         <div className="h-full bg-blue-500 w-[85%]" />
                      </div>
                   </div>
                   <div className={`p-6 rounded-[2rem] ${glassClass}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${subTextClass}`}>Compliance</p>
                      <p className="text-2xl font-black">92<span className="text-xs ml-1 opacity-40">%</span></p>
                      <div className="h-1 w-full bg-emerald-500/20 rounded-full mt-3 overflow-hidden">
                         <div className="h-full bg-emerald-500 w-[92%]" />
                      </div>
                   </div>
                </div>
              </div>
            </PageTransition>
          )}

          {currentView === View.CHAT && (
            <PageTransition key="chat">
              <div className="flex flex-col h-full pt-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-indigo-500 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-500/20"><MessageCircle className="w-8 h-8 text-white" /></div>
                  <div>
                    <h2 className="text-2xl font-black">Aura intelligence</h2>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${subTextClass}`}>Active thinking mode</p>
                  </div>
                </div>
                <div className="flex-1 space-y-4 pb-12 overflow-y-auto no-scrollbar">
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-5 rounded-[2rem] ${m.role === 'user' ? 'bg-indigo-500 text-white' : `${glassClass}`}`}>
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  ))}
                  {isChatTyping && <div className={`p-4 rounded-2xl w-fit flex gap-1.5 animate-pulse ${glassClass}`}><div className="w-2 h-2 bg-indigo-500/40 rounded-full" /><div className="w-2 h-2 bg-indigo-500/40 rounded-full" /><div className="w-2 h-2 bg-indigo-500/40 rounded-full" /></div>}
                </div>
                <div className={`sticky bottom-4 p-3 rounded-[2.5rem] flex items-center gap-2 border shadow-2xl ${glassClass}`}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Query Aura..." className={`flex-1 bg-transparent px-4 outline-none text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} onKeyDown={e => e.key === 'Enter' && handleChatSend()} />
                  <button onClick={handleChatSend} className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center active:scale-90 transition-transform"><Send className="w-5 h-5 text-white" /></button>
                </div>
              </div>
            </PageTransition>
          )}

          {currentView === View.PROFILE && (
            <PageTransition key="profile">
              <div className="py-12 flex flex-col items-center text-center w-full">
                <div className="w-28 h-28 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 relative">
                  <User className="w-12 h-12 text-emerald-500" />
                  {!isEditingProfile && <button onClick={startEditingProfile} className={`absolute bottom-0 right-0 p-3 rounded-full border transition-colors ${theme === 'dark' ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}><Edit3 className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-slate-600'}`} /></button>}
                </div>
                {isEditingProfile && tempProfile ? (
                   <div className="mb-8 space-y-4 w-full px-4">
                     <input value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} className={`text-3xl font-black bg-transparent border-b text-center w-full outline-none focus:border-emerald-500 p-2 ${theme === 'dark' ? 'border-white/20' : 'border-slate-200'}`} placeholder="Your Name" />
                     <button onClick={saveProfile} className="w-full py-4 bg-emerald-500 text-black font-black rounded-2xl flex items-center justify-center gap-2 mt-4"><Save className="w-5 h-5" /> Save Changes</button>
                   </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-black mb-1">{userProfile?.name || user?.email.split('@')[0]}</h2>
                    <p className={`font-medium mb-4 ${subTextClass}`}>Tier 1 Member • {userProfile?.primaryGoal || 'Optimizing'}</p>
                    <button onClick={toggleTheme} className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 mb-8 ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-700'}`}>{theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</button>
                  </>
                )}
                <button onClick={logout} className={`w-full p-6 rounded-[2rem] flex justify-center items-center gap-3 text-rose-500 font-bold ${glassClass} mt-10`}><LogOut className="w-5 h-5" /> Sign Out</button>
              </div>
            </PageTransition>
          )}
        </AnimatePresence>
      </main>

      <div className={`fixed bottom-0 inset-x-0 h-40 flex justify-center items-center z-50 pointer-events-none bg-gradient-to-t ${theme === 'dark' ? 'from-black via-black/80' : 'from-white via-white/80'} to-transparent`}>
        <div className={`pointer-events-auto flex items-center gap-2 backdrop-blur-3xl p-3 rounded-[2.8rem] border shadow-2xl translate-y-[-15px] ${theme === 'dark' ? 'bg-neutral-900/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
          <button onClick={() => setCurrentView(View.TODAY)} className={`p-4 rounded-2xl transition-all duration-300 ${currentView === View.TODAY ? 'text-emerald-400 bg-emerald-500/10' : `${subTextClass}`}`}><Home /></button>
          <button onClick={() => setCurrentView(View.PLANNER)} className={`p-4 rounded-2xl transition-all duration-300 ${currentView === View.PLANNER ? 'text-emerald-400 bg-emerald-500/10' : `${subTextClass}`}`}><Calendar /></button>
          <button onClick={() => setIsLoggingOpen(!isLoggingOpen)} className="w-18 h-18 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-black shadow-xl shadow-emerald-500/30 active:scale-95 transition-all mx-2"><Plus className={`w-9 h-9 stroke-[3] transition-transform duration-500 ${isLoggingOpen ? 'rotate-45' : ''}`} /></button>
          <button onClick={() => setCurrentView(View.CHAT)} className={`p-4 rounded-2xl transition-all duration-300 ${currentView === View.CHAT ? 'text-emerald-400 bg-emerald-500/10' : `${subTextClass}`}`}><MessageCircle /></button>
          <button onClick={() => setCurrentView(View.INSIGHTS)} className={`p-4 rounded-2xl transition-all duration-300 ${currentView === View.INSIGHTS ? 'text-emerald-400 bg-emerald-500/10' : `${subTextClass}`}`}><PieChart /></button>
        </div>
      </div>

      <AnimatePresence>
        {showHydrationModal && <HydrationModal currentAmount={waterTotal} target={goal.water} onClose={() => setShowHydrationModal(false)} onAdd={(amount) => setHydration([...hydration, { timestamp: Date.now(), amount }])} />}
        {isLoggingOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLoggingOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[55]" />
            <motion.div initial={{ y: 100, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 100, opacity: 0, scale: 0.9 }} className="fixed bottom-40 left-8 right-8 z-[60] flex flex-col gap-5">
               <button onClick={() => { setCurrentView(View.CAMERA); setIsLoggingOpen(false); }} className="w-full bg-white text-black p-7 rounded-[2.5rem] flex items-center justify-between font-black shadow-2xl active:scale-95 transition-transform"><div className="flex items-center gap-5"><div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center"><CameraIcon className="w-6 h-6" /></div><div className="text-left"><p className="text-lg">Meal Scan AI</p><p className="text-[10px] text-black/30 uppercase font-black">Visual analysis</p></div></div><ChevronRight className="opacity-30" /></button>
               <button onClick={() => fileInputRef.current?.click()} className="w-full bg-indigo-500 text-white p-7 rounded-[2.5rem] flex items-center justify-between font-black shadow-2xl active:scale-95 transition-transform"><div className="flex items-center gap-5"><div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><ImageIcon className="w-6 h-6 text-white" /></div><div className="text-left"><p className="text-lg">Upload Log</p><p className="text-[10px] text-indigo-200 uppercase font-black">Gallery import</p></div></div><ChevronRight className="opacity-30" /></button>
               <div className={`p-8 rounded-[3rem] border flex flex-col gap-6 shadow-2xl ${glassClass}`}><div className={`flex items-center gap-4 px-2 opacity-30 text-[11px] font-black uppercase tracking-[0.2em]`}><TextIcon className="w-5 h-5" /> Manual log</div><div className="relative"><input autoFocus onKeyDown={e => e.key === 'Enter' && handleManualLog(e.currentTarget.value)} placeholder="Describe meal..." className={`w-full p-5 rounded-[1.8rem] outline-none font-bold ${glassInputClass}`} /><button onClick={(e) => { const input = (e.currentTarget.previousSibling as HTMLInputElement); handleManualLog(input.value); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"><ChevronRight className="w-6 h-6 text-black" /></button></div></div>
            </motion.div>
             <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          </>
        )}
        {currentView === View.CAMERA && <CameraView onCapture={handleCapture} onClose={() => setCurrentView(View.TODAY)} isProcessing={isProcessing} />}
        {currentEstimate && <NutritionModal estimate={currentEstimate} onConfirm={confirmLog} onCancel={() => setCurrentEstimate(null)} onRecalculate={handleRecalculate} isRecalculating={isProcessing} />}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
