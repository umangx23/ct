import React from 'react';
import './Dashboard.css';
import type { DashboardData } from '../App';

interface DashboardProps {
  data: DashboardData;
  onLogMealClick: () => void;
  onNavigate: (tab: 'dashboard' | 'assistant' | 'insights' | 'settings') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onLogMealClick, onNavigate }) => {
  const { settings, today, recentMeals, weeklyTrends } = data;

  // Calorie calculations
  const caloriePercent = Math.min(
    100,
    Math.round((today.caloriesConsumed / settings.calorieGoal) * 100)
  );

  // Helper: round n to the nearest 5 for CSS step class lookup
  const snap5 = (n: number) => Math.round(Math.min(100, n) / 5) * 5;

  // SVG configurations for 180px container:
  // Radius = 70. Circumference = 2 * Math.PI * 70 = 439.82
  const r = 70;
  const circ = 2 * Math.PI * r;
  const strokeDashoffset = circ - (caloriePercent / 100) * circ;

  // Macro percentages
  const proteinPercent = Math.min(100, Math.round((today.proteinConsumed / settings.proteinGoal) * 100));
  const carbsPercent = Math.min(100, Math.round((today.carbsConsumed / settings.carbsGoal) * 100));
  const fatPercent = Math.min(100, Math.round((today.fatConsumed / settings.fatGoal) * 100));

  // Determine status message
  const getStatus = () => {
    if (today.caloriesConsumed > settings.calorieGoal) {
      return { text: 'Over Limit', className: 'danger', icon: 'warning' };
    } else if (today.caloriesConsumed > settings.calorieGoal * 0.9) {
      return { text: 'Near Limit', className: 'warning', icon: 'error_outline' };
    } else {
      return { text: 'On Track', className: '', icon: 'auto_awesome' };
    }
  };

  const status = getStatus();

  // Delete meal handler
  const handleDeleteMeal = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        const res = await fetch(`/api/meals/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          // Trigger a reload of the parent data
          onNavigate('dashboard'); // This resets/refetches via navigation trigger
          window.location.reload(); // Quick refresh to update totals
        }
      } catch (error) {
        console.error('Error deleting meal:', error);
      }
    }
  };

  // Find maximum calories in weekly trends to scale bars
  const maxWeeklyCals = Math.max(...weeklyTrends.map(t => t.calories), 1000);

  return (
    <div className="dashboard-grid animate-fade-in">
      
      {/* 1. Daily Progress Ring */}
      <section className="lifted-card progress-card">
        <div className="card-header-container">
          <h3 className="card-title">Calories</h3>
          <span className={`status-badge ${status.className}`}>
            <span className="material-symbols-outlined icon-sm">
              {status.icon}
            </span>
            {status.text}
          </span>
        </div>

        <div className="progress-ring-container">
          <svg className="progress-ring-svg" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              className="progress-ring-circle-bg"
              cx="80"
              cy="80"
              r={r}
              fill="transparent"
              strokeWidth="10"
            />
            {/* Animated progress circle */}
            <circle
              className="progress-ring-circle"
              cx="80"
              cy="80"
              r={r}
              fill="transparent"
              strokeWidth="10"
              strokeDasharray={circ}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="progress-ring-text">
            <span className="progress-calories">
              {today.caloriesConsumed.toLocaleString()}
            </span>
            <span className="progress-goal">
              / {settings.calorieGoal.toLocaleString()} kcal
            </span>
          </div>
        </div>

        <div className="progress-stats-footer">
          <div className="stat-item">
            <p className="stat-label">Burned</p>
            <p className="stat-value primary">{today.caloriesBurned} kcal</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Remaining</p>
            <p className="stat-value">
              {Math.max(0, settings.calorieGoal - today.caloriesConsumed)} kcal
            </p>
          </div>
        </div>
      </section>

      {/* 2. Macronutrients Breakdown */}
      <section className="lifted-card macros-card">
        <h3 className="card-title macros-card-title">Macronutrients</h3>
        
        <div className="macros-container">
          {/* Protein */}
          <div className="macro-row">
            <div className="macro-info">
              <span className="macro-name">
                <span className="macro-dot protein"></span> Protein
              </span>
              <span className="macro-val">{today.proteinConsumed}g / {settings.proteinGoal}g</span>
            </div>
            <div className="macro-progress-bar">
              <div className={`macro-progress-fill protein fill-pct-${snap5(proteinPercent)}`}></div>
            </div>
          </div>

          {/* Carbs */}
          <div className="macro-row">
            <div className="macro-info">
              <span className="macro-name">
                <span className="macro-dot carbs"></span> Carbs
              </span>
              <span className="macro-val">{today.carbsConsumed}g / {settings.carbsGoal}g</span>
            </div>
            <div className="macro-progress-bar">
              <div className={`macro-progress-fill carbs fill-pct-${snap5(carbsPercent)}`}></div>
            </div>
          </div>

          {/* Fats */}
          <div className="macro-row">
            <div className="macro-info">
              <span className="macro-name">
                <span className="macro-dot fat"></span> Fats
              </span>
              <span className="macro-val">{today.fatConsumed}g / {settings.fatGoal}g</span>
            </div>
            <div className="macro-progress-bar">
              <div className={`macro-progress-fill fat fill-pct-${snap5(fatPercent)}`}></div>
            </div>
          </div>
        </div>

        <div className="macros-footer">
          <span className="material-symbols-outlined">info</span>
          <p>
            {proteinPercent < 80 
              ? "Focus on hitting your protein goal today." 
              : "Great job! You've met your protein baseline for the day."}
          </p>
        </div>
      </section>

      {/* 3. Weekly Trends */}
      <section className="lifted-card weekly-trends-card">
        <div className="trends-header">
          <h3 className="card-title">Weekly Trend</h3>
          <span className="trends-badge">
            <span className="material-symbols-outlined icon-xs">insights</span>
            AI Predicted
          </span>
        </div>

        <div className="trends-chart">
          {weeklyTrends.map((t, idx) => {
            const height = Math.max(10, Math.round((t.calories / maxWeeklyCals) * 100));
            const isToday = idx === weeklyTrends.length - 1;
            return (
              <div key={t.date} className="trend-bar-container">
                <div className="trend-bar-tooltip">
                  {t.calories} kcal
                </div>
                <div className={`trend-bar ${isToday ? 'current' : ''} bar-h-${snap5(height)}`}></div>
                <span className="trend-bar-label">{t.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Recent Meals */}
      <section className="lifted-card meals-list-card">
        <div className="meals-list-header">
          <h3 className="card-title">Recent Meals</h3>
          <button 
            onClick={onLogMealClick}
            className="add-meal-link"
          >
            + Add Meal
          </button>
        </div>

        <div className="meals-list-content no-scrollbar">
          {recentMeals.length === 0 ? (
            <div className="no-meals-state">
              <span className="material-symbols-outlined icon-3xl no-meals-icon">
                no_food
              </span>
              <p className="no-meals-text">No meals logged yet today.</p>
            </div>
          ) : (
            recentMeals.map((meal) => (
              <div key={meal.id} className="meal-row-item">
                <div className="meal-img-wrapper">
                  {meal.imgUrl ? (
                    <img src={meal.imgUrl} alt={meal.name} />
                  ) : (
                    <span className="material-symbols-outlined meal-img-placeholder">
                      restaurant
                    </span>
                  )}
                </div>
                <div className="meal-details">
                  <div className="meal-title-row">
                    <h4 className="meal-name">{meal.name}</h4>
                    <span className="meal-type-tag">{meal.mealType}</span>
                  </div>
                  <p className="meal-meta">
                    {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' • '}P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                  </p>
                </div>
                <div className="meal-cal-section">
                  <span className="meal-cals">{meal.calories}</span>
                  <span className="meal-cal-unit">kcal</span>
                </div>
                <button 
                  className="meal-delete-btn" 
                  onClick={() => handleDeleteMeal(meal.id)}
                  title="Delete meal"
                >
                  <span className="material-symbols-outlined icon-lg">
                    delete
                  </span>
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. AI Call to Action */}
      <section className="glass-panel ai-callout-card">
        <div className="ai-icon-container">
          <span className="material-symbols-outlined icon-xl">
            smart_toy
          </span>
        </div>
        <h3>Need Meal Ideas?</h3>
        <p>Ask NutriAI for recipes based on your remaining macros or scan a food photo.</p>
        <button className="btn-secondary" onClick={() => onNavigate('assistant')}>
          <span className="material-symbols-outlined icon-md">
            chat_bubble
          </span>
          Chat with AI
        </button>
      </section>

    </div>
  );
};

export default Dashboard;
