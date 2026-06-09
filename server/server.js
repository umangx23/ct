const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'database.json');

// Helper to read database
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database, creating default', error);
    const defaultData = {
      settings: { calorieGoal: 2000, proteinGoal: 150, carbsGoal: 220, fatGoal: 65, currentWeight: 168.4, weightGoal: 160.0 },
      meals: [],
      chats: []
    };
    writeDB(defaultData);
    return defaultData;
  }
}

// Helper to write database
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing database', error);
  }
}

// Helper to get local date string YYYY-MM-DD
function getLocalDateString(date = new Date()) {
  // Return YYYY-MM-DD in local time
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
}

// Settings API
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json(db.settings);
});

// Meals API
app.get('/api/meals', (req, res) => {
  const db = readDB();
  res.json(db.meals);
});

app.post('/api/meals', (req, res) => {
  const db = readDB();
  const newMeal = {
    id: 'm_' + Date.now(),
    name: req.body.name || 'Unnamed Meal',
    calories: Number(req.body.calories) || 0,
    protein: Number(req.body.protein) || 0,
    carbs: Number(req.body.carbs) || 0,
    fat: Number(req.body.fat) || 0,
    mealType: req.body.mealType || 'Breakfast',
    date: req.body.date || getLocalDateString(),
    timestamp: req.body.timestamp || new Date().toISOString(),
    imgUrl: req.body.imgUrl || ''
  };
  
  db.meals.push(newMeal);
  writeDB(db);
  res.status(201).json(newMeal);
});

app.delete('/api/meals/:id', (req, res) => {
  const db = readDB();
  const initialLength = db.meals.length;
  db.meals = db.meals.filter(m => m.id !== req.params.id);
  
  if (db.meals.length < initialLength) {
    writeDB(db);
    res.json({ success: true, message: 'Meal deleted' });
  } else {
    res.status(404).json({ success: false, message: 'Meal not found' });
  }
});

// Dashboard metrics API
app.get('/api/dashboard', (req, res) => {
  const db = readDB();
  const todayStr = req.query.date || getLocalDateString();
  
  // Filter meals for today
  const todayMeals = db.meals.filter(m => m.date === todayStr);
  
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
  
  // We can assume a base burned calorie amount + any added exercise
  const baseBurned = 450;
  const remainingCalories = Math.max(0, db.settings.calorieGoal - caloriesConsumed);
  
  // Get recent 5 meals
  const sortedMeals = [...db.meals].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const recentMeals = sortedMeals.slice(0, 5);
  
  // Generate weekly trends for the past 7 days (including today)
  const weeklyTrends = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    
    const dayMeals = db.meals.filter(m => m.date === dateStr);
    const dayCals = dayMeals.reduce((sum, m) => sum + m.calories, 0);
    
    // Day label (Mon, Tue, etc.)
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    weeklyTrends.push({
      date: dateStr,
      label,
      calories: dayCals
    });
  }
  
  res.json({
    settings: db.settings,
    today: {
      date: todayStr,
      caloriesConsumed,
      caloriesBurned: baseBurned,
      remainingCalories,
      proteinConsumed,
      carbsConsumed,
      fatConsumed
    },
    recentMeals,
    weeklyTrends
  });
});

// Insights API
app.get('/api/insights', (req, res) => {
  const db = readDB();
  const yearMonth = req.query.month || '2023-10'; // e.g. 2023-10
  
  // Return all meals grouped by day for the requested month, or all calendar data
  const calendarDays = {};
  
  // Find all dates in the database for the given month
  db.meals.forEach(m => {
    if (m.date.startsWith(yearMonth)) {
      if (!calendarDays[m.date]) {
        calendarDays[m.date] = {
          date: m.date,
          calories: 0,
          meals: []
        };
      }
      calendarDays[m.date].calories += m.calories;
      calendarDays[m.date].meals.push(m);
    }
  });
  
  // Determine goal status for each logged day
  const formattedDays = Object.keys(calendarDays).map(dateStr => {
    const dayData = calendarDays[dateStr];
    const isOver = dayData.calories > db.settings.calorieGoal;
    // Mock workout tag on some days (e.g. odd days or Oct 5)
    const dayNum = parseInt(dateStr.split('-')[2]);
    const hasWorkout = dayNum % 2 !== 0; 
    
    return {
      date: dateStr,
      calories: dayData.calories,
      status: isOver ? 'over' : 'met',
      workout: hasWorkout,
      mealsCount: dayData.meals.length
    };
  });
  
  // Calculate average calories for the month
  const activeDays = formattedDays.length;
  const avgCalories = activeDays > 0 
    ? Math.round(formattedDays.reduce((sum, d) => sum + d.calories, 0) / activeDays) 
    : 0;
    
  // Mock weight history
  const weightProgress = [
    { date: '2023-10-01', weight: 170.2 },
    { date: '2023-10-03', weight: 169.8 },
    { date: '2023-10-05', weight: 169.5 },
    { date: '2023-10-07', weight: 169.1 },
    { date: '2023-10-09', weight: 168.8 },
    { date: '2023-10-11', weight: 168.6 },
    { date: '2023-10-13', weight: 168.4 }
  ];
  
  res.json({
    avgCalories,
    calendarDays: formattedDays,
    weightProgress,
    calorieGoal: db.settings.calorieGoal,
    currentWeight: db.settings.currentWeight
  });
});

// Chat API (AI Chatbot)
app.post('/api/chat', (req, res) => {
  const db = readDB();
  const userMessage = req.body.message || '';
  const image = req.body.image || null;
  const todayStr = getLocalDateString();
  
  // Save user message
  const userMsgObj = {
    id: 'c_' + Date.now(),
    sender: 'user',
    text: userMessage,
    timestamp: new Date().toISOString(),
    image: image
  };
  db.chats.push(userMsgObj);
  
  let aiMsgObj = {
    id: 'c_' + (Date.now() + 1),
    sender: 'ai',
    timestamp: new Date().toISOString()
  };
  
  const text = userMessage.toLowerCase();
  
  // Intelligent parsing logic
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
    // Portions confirmation
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
    
    // Automatically log this meal to database!
    const newMeal = {
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
    
    aiMsgObj.text = `Awesome! I have automatically logged **${foodName} (${portion})** to your diary for lunch:
- **Calories**: ${calories} kcal
- **Protein**: ${protein}g
- **Carbs**: ${carbs}g
- **Fats**: ${fat}g

Your daily progress ring and macronutrient charts have been updated!`;
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
    // Log oats
    const newMeal = {
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
    // Calculate remaining protein
    const todayMeals = db.meals.filter(m => m.date === todayStr);
    const proteinConsumed = todayMeals.reduce((sum, m) => sum + m.protein, 0);
    const target = db.settings.proteinGoal;
    const remaining = Math.max(0, target - proteinConsumed);
    
    aiMsgObj.text = `You have consumed **${proteinConsumed}g** of protein out of your **${target}g** goal today. You have **${remaining}g** remaining. 
    
To hit your goal, I recommend:
1. Sliced Turkey Breast (30g protein per 100g)
2. Greek Yogurt (17g protein per 150g container)
3. Canned Tuna (25g protein per can)
4. A scoop of Whey Protein powder (25g protein)`;
  } else {
    // Default reply
    aiMsgObj.text = "Hi! I am NutriAI, your supportive nutrition expert. I can help you count calories and log meals. Just tell me what you ate (e.g. 'I had Greek Yogurt for breakfast') or upload a photo, and I'll take care of the rest!";
  }
  
  db.chats.push(aiMsgObj);
  writeDB(db);
  
  res.json({
    chatHistory: db.chats,
    newMessages: [userMsgObj, aiMsgObj]
  });
});

app.get('/api/chat', (req, res) => {
  const db = readDB();
  res.json(db.chats);
});

app.delete('/api/chat', (req, res) => {
  const db = readDB();
  db.chats = [
    {
      id: 'c_init',
      sender: 'ai',
      text: "Hi there! I'm ready to help you track your meals. What are we having for lunch today?",
      timestamp: new Date().toISOString()
    }
  ];
  writeDB(db);
  res.json(db.chats);
});

// Production: serve built static client files
const clientBuildPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://192.168.0.227:${PORT}`);
});
