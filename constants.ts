
import { UserGoal } from './types';

export const DEFAULT_GOAL: UserGoal = {
  calories: 2200,
  protein: 160,
  carbs: 220,
  fats: 70,
  weight: 75,
  water: 2500
};

export const COLORS = {
  primary: '#10B981', // Emerald
  protein: '#3B82F6', // Blue
  carbs: '#F59E0B',   // Amber
  fats: '#EC4899',    // Pink
  water: '#06B6D4',   // Cyan
  bg: '#050505',
  card: 'rgba(255, 255, 255, 0.03)',
  chartGradient: ['#10B981', '#3B82F6']
};

export const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  mass: 1
};

export const STAGGER_CHILDREN = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};
