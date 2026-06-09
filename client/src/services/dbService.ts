import type { UserSettings, MealItem, DashboardData, ChatMessage } from '../App';

const STORAGE_KEY = 'calorie_tracker_db';

interface DatabaseSchema {
  settings: UserSettings;
  meals: MealItem[];
  chats: ChatMessage[];
}

const DEFAULT_DB: DatabaseSchema = {
  settings: {
    calorieGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 220,
    fatGoal: 65,
    currentWeight: 168.4,
    weightGoal: 160.0
  },
  meals: [
    {
      id: 'm_1781016277320',
      name: 'Dal Rice',
      calories: 300,
      protein: 10,
      carbs: 50,
      fat: 5,
      mealType: 'Lunch',
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      imgUrl: ''
    }
  ],
  chats: [
    {
      id: 'c_init',
      sender: 'ai',
      text: "Hi there! I'm ready to help you track your meals. What are we having for lunch today?",
      timestamp: new Date().toISOString()
    }
  ]
};

// Helper: load DB
function loadDB(): DatabaseSchema {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DB));
    return DEFAULT_DB;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse database, resetting to default', e);
    return DEFAULT_DB;
  }
}

// Helper: save DB
function saveDB(db: DatabaseSchema) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// Helper: get local date YYYY-MM-DD
export function getLocalDateString(date = new Date()): string {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
}

export const dbService = {
  getSettings(): UserSettings {
    const db = loadDB();
    return db.settings;
  },

  updateSettings(newSettings: Partial<UserSettings>): UserSettings {
    const db = loadDB();
    db.settings = { ...db.settings, ...newSettings };
    saveDB(db);
    return db.settings;
  },

  getMeals(): MealItem[] {
    const db = loadDB();
    return db.meals;
  },

  addMeal(meal: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: string;
    date?: string;
    imgUrl?: string;
  }): MealItem {
    const db = loadDB();
    const todayStr = getLocalDateString();
    const newMeal: MealItem = {
      id: 'm_' + Date.now() + Math.random().toString(36).substr(2, 4),
      name: meal.name || 'Unnamed Meal',
      calories: Number(meal.calories) || 0,
      protein: Number(meal.protein) || 0,
      carbs: Number(meal.carbs) || 0,
      fat: Number(meal.fat) || 0,
      mealType: meal.mealType || 'Breakfast',
      date: meal.date || todayStr,
      timestamp: new Date().toISOString(),
      imgUrl: meal.imgUrl || ''
    };
    db.meals.push(newMeal);
    saveDB(db);
    return newMeal;
  },

  deleteMeal(id: string): boolean {
    const db = loadDB();
    const initialLength = db.meals.length;
    db.meals = db.meals.filter(m => m.id !== id);
    if (db.meals.length < initialLength) {
      saveDB(db);
      return true;
    }
    return false;
  },

  getDashboardData(selectedDate?: string): DashboardData {
    const db = loadDB();
    const targetDate = selectedDate || getLocalDateString();

    // Filter meals for selected day
    const todayMeals = db.meals.filter(m => m.date === targetDate);

    // Calculate sums
    let caloriesConsumed = 0;
    let proteinConsumed = 0;
    let carbsConsumed = 0;
    let fatConsumed = 0;

    todayMeals.forEach(m => {
      caloriesConsumed += m.calories;
      proteinConsumed += m.protein;
      carbsConsumed += m.carbs;
      fatConsumed += m.fat;
    });

    const baseBurned = 450;
    const remainingCalories = Math.max(0, db.settings.calorieGoal - caloriesConsumed);

    // Recent 5 meals sorted by timestamp
    const sortedMeals = [...db.meals].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    // filter only today's meals for recent list to match backend logic
    const recentMeals = sortedMeals.filter(m => m.date === targetDate).slice(0, 5);

    // Weekly trends for past 7 days ending today
    const weeklyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);

      const dayMeals = db.meals.filter(m => m.date === dateStr);
      const dayCals = dayMeals.reduce((sum, m) => sum + m.calories, 0);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });

      weeklyTrends.push({
        date: dateStr,
        label,
        calories: dayCals
      });
    }

    return {
      settings: db.settings,
      today: {
        date: targetDate,
        caloriesConsumed,
        caloriesBurned: baseBurned,
        remainingCalories,
        proteinConsumed,
        carbsConsumed,
        fatConsumed
      },
      recentMeals,
      weeklyTrends
    };
  },

  getInsights(monthStr?: string) {
    const db = loadDB();
    const targetMonth = monthStr || '2023-10'; // e.g. 2023-10
    const calendarDays: Record<string, { date: string; calories: number; mealsCount: number }> = {};

    db.meals.forEach(m => {
      if (m.date.startsWith(targetMonth)) {
        if (!calendarDays[m.date]) {
          calendarDays[m.date] = {
            date: m.date,
            calories: 0,
            mealsCount: 0
          };
        }
        calendarDays[m.date].calories += m.calories;
        calendarDays[m.date].mealsCount += 1;
      }
    });

    // Format calendar days, determine goals
    const formattedDays = Object.keys(calendarDays).map(dateStr => {
      const dayData = calendarDays[dateStr];
      const isOver = dayData.calories > db.settings.calorieGoal;
      const dayNum = parseInt(dateStr.split('-')[2]);
      const hasWorkout = dayNum % 2 !== 0;

      return {
        date: dateStr,
        calories: dayData.calories,
        status: (isOver ? 'over' : 'met') as 'over' | 'met',
        workout: hasWorkout,
        mealsCount: dayData.mealsCount
      };
    });

    // Average calories
    const activeDays = formattedDays.length;
    const avgCalories = activeDays > 0
      ? Math.round(formattedDays.reduce((sum, d) => sum + d.calories, 0) / activeDays)
      : 0;

    // Weight progress mock
    const weightProgress = [
      { date: '2023-10-01', weight: 170.2 },
      { date: '2023-10-03', weight: 169.8 },
      { date: '2023-10-05', weight: 169.5 },
      { date: '2023-10-07', weight: 169.1 },
      { date: '2023-10-09', weight: 168.8 },
      { date: '2023-10-11', weight: 168.6 },
      { date: '2023-10-13', weight: 168.4 }
    ];

    return {
      avgCalories,
      calendarDays: formattedDays,
      weightProgress,
      calorieGoal: db.settings.calorieGoal,
      currentWeight: db.settings.currentWeight
    };
  },

  getChats(): ChatMessage[] {
    const db = loadDB();
    return db.chats;
  },

  sendChat(messageText: string, image: string | null = null): { chatHistory: ChatMessage[]; newMessages: ChatMessage[] } {
    const db = loadDB();
    const todayStr = getLocalDateString();

    const userMsgObj: ChatMessage = {
      id: 'c_' + Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
      image: image || undefined
    };
    db.chats.push(userMsgObj);

    const aiMsgObj: ChatMessage = {
      id: 'c_' + (Date.now() + 1),
      sender: 'ai',
      timestamp: new Date().toISOString(),
      text: ''
    };

    const text = messageText.toLowerCase();

    // Natural Language Parsing for Local AI Simulation
    if (image || text.includes('salad') || text.includes('chicken salad') || text.includes('photo') || text.includes('upload')) {
      aiMsgObj.text = "That looks delicious and packed with nutrients! I can identify mixed greens, cherry tomatoes, avocado, and grilled chicken. To log the calories accurately, could you clarify the portion size of the chicken?";
      aiMsgObj.portionSuggestion = {
        foodName: "Grilled Chicken Salad",
        options: [
          { label: "About 4 oz (Medium)", calories: 420, protein: 38, carbs: 10, fat: 22 },
          { label: "About 6 oz (Large)", calories: 540, protein: 52, carbs: 12, fat: 25 },
          { label: "About 8 oz (Extra Large)", calories: 660, protein: 66, carbs: 14, fat: 28 }
        ]
      };
    } else if (text.includes('4 oz') || text.includes('6 oz') || text.includes('8 oz') || text.includes('about')) {
      let foodName = "Grilled Chicken Salad";
      let calories = 420;
      let protein = 38;
      let carbs = 10;
      let fat = 22;
      let portion = "4 oz";

      if (text.includes('6 oz')) {
        calories = 540; protein = 52; carbs = 12; fat = 25; portion = "6 oz";
      } else if (text.includes('8 oz')) {
        calories = 660; protein = 66; carbs = 14; fat = 28; portion = "8 oz";
      }

      // Automatically log the meal!
      const newMeal: MealItem = {
        id: 'm_' + Date.now(),
        name: `${foodName} (${portion})`,
        calories,
        protein,
        carbs,
        fat,
        mealType: 'Lunch',
        date: todayStr,
        timestamp: new Date().toISOString(),
        imgUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150'
      };
      db.meals.push(newMeal);

      aiMsgObj.text = `Awesome! I have automatically logged **${foodName} (${portion})** to your diary for lunch:\n- **Calories**: ${calories} kcal\n- **Protein**: ${protein}g\n- **Carbs**: ${carbs}g\n- **Fats**: ${fat}g\n\nYour daily progress ring and macronutrient charts have been updated!`;
    } else if (text.includes('oats') || text.includes('oatmeal') || text.includes('breakfast')) {
      aiMsgObj.text = "Oatmeal is an excellent choice! I scanned the nutritional profiles and estimate a typical bowl of Steel-cut Oatmeal with Blueberries & Honey to be: \n\n- **Calories**: 310 kcal \n- **Protein**: 12g \n- **Carbs**: 52g \n- **Fats**: 6g\n\nWould you like me to log this breakfast for you?";
      aiMsgObj.portionSuggestion = {
        foodName: "Oatmeal & Berries",
        options: [
          { label: "Log 1 Bowl (Standard)", calories: 310, protein: 12, carbs: 52, fat: 6 },
          { label: "Cancel", calories: 0, protein: 0, carbs: 0, fat: 0 }
        ]
      };
    } else if (text.includes('log') && (text.includes('bowl') || text.includes('oatmeal'))) {
      const newMeal: MealItem = {
        id: 'm_' + Date.now(),
        name: "Oatmeal & Berries",
        calories: 310,
        protein: 12,
        carbs: 52,
        fat: 6,
        mealType: 'Breakfast',
        date: todayStr,
        timestamp: new Date().toISOString(),
        imgUrl: 'https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?w=150'
      };
      db.meals.push(newMeal);
      aiMsgObj.text = `Done! I've logged **Oatmeal & Berries** (310 kcal, 12g Protein, 52g Carbs, 6g Fats) for breakfast. Let me know if there's anything else you'd like to add!`;
    } else if (text.includes('protein') || text.includes('how much')) {
      const todayMeals = db.meals.filter(m => m.date === todayStr);
      const proteinConsumed = todayMeals.reduce((sum, m) => sum + m.protein, 0);
      const target = db.settings.proteinGoal;
      const remaining = Math.max(0, target - proteinConsumed);

      aiMsgObj.text = `You have consumed **${proteinConsumed}g** of protein out of your **${target}g** goal today. You have **${remaining}g** remaining. \n\nTo hit your goal, I recommend:\n1. Sliced Turkey Breast (30g protein per 100g)\n2. Greek Yogurt (17g protein per 150g container)\n3. Canned Tuna (25g protein per can)\n4. A scoop of Whey Protein powder (25g protein)`;
    } else {
      aiMsgObj.text = "Hi! I am NutriAI, your supportive nutrition expert. I can help you count calories and log meals. Just tell me what you ate (e.g. 'I had Greek Yogurt for breakfast') or upload a photo, and I'll take care of the rest!";
    }

    db.chats.push(aiMsgObj);
    saveDB(db);

    return {
      chatHistory: db.chats,
      newMessages: [userMsgObj, aiMsgObj]
    };
  },

  clearChats(): ChatMessage[] {
    const db = loadDB();
    db.chats = [
      {
        id: 'c_init',
        sender: 'ai',
        text: "Hi there! I'm ready to help you track your meals. What are we having for lunch today?",
        timestamp: new Date().toISOString()
      }
    ];
    saveDB(db);
    return db.chats;
  }
};
