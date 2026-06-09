import React, { useState, useEffect } from 'react';
import './HealthInsights.css';
import type { MealItem } from '../App';

interface HealthInsightsProps {
  calorieGoal: number;
  onNavigate: (tab: 'dashboard' | 'assistant' | 'insights' | 'settings', prefillMessage?: string) => void;
}

interface CalendarDayInfo {
  date: string;
  calories: number;
  status: 'met' | 'over';
  workout: boolean;
  mealsCount: number;
}

interface WeightPoint {
  date: string;
  weight: number;
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ calorieGoal, onNavigate }) => {
  const [calendarDays, setCalendarDays] = useState<CalendarDayInfo[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightPoint[]>([]);
  const [avgCalories, setAvgCalories] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Selected day state
  const [selectedDate, setSelectedDate] = useState<string>('2023-10-04');
  const [selectedDayMeals, setSelectedDayMeals] = useState<MealItem[]>([]);
  const [allMeals, setAllMeals] = useState<MealItem[]>([]);

  // Fetch insights data
  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/insights?month=2023-10');
      if (res.ok) {
        const data = await res.json();
        setCalendarDays(data.calendarDays);
        setWeightHistory(data.weightProgress);
        setAvgCalories(data.avgCalories);
      }
      
      // Fetch all meals to filter for selected day details
      const mealsRes = await fetch('/api/meals');
      if (mealsRes.ok) {
        const mealsData = await mealsRes.json();
        setAllMeals(mealsData);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  // Update selected day meals whenever selected date or all meals changes
  useEffect(() => {
    const dayMeals = allMeals.filter(m => m.date === selectedDate);
    setSelectedDayMeals(dayMeals);
  }, [selectedDate, allMeals]);

  // Calendar setup: October 2023. Starts on Sunday, has 31 days.
  const daysInOctober = 31;
  const yearMonth = '2023-10';

  // Helper to find calendar info for a specific day number (1-indexed)
  const getDayInfo = (dayNum: number): CalendarDayInfo | null => {
    const paddedDay = dayNum.toString().padStart(2, '0');
    const dateStr = `${yearMonth}-${paddedDay}`;
    const found = calendarDays.find(d => d.date === dateStr);
    
    if (found) return found;

    // If day is in database meals but not in calendarDays, create mock
    const matchingMeals = allMeals.filter(m => m.date === dateStr);
    if (matchingMeals.length > 0) {
      const dayCals = matchingMeals.reduce((sum, m) => sum + m.calories, 0);
      return {
        date: dateStr,
        calories: dayCals,
        status: dayCals > calorieGoal ? 'over' : 'met',
        workout: dayNum % 2 !== 0, // Mock workout
        mealsCount: matchingMeals.length
      };
    }
    return null;
  };

  // Selected Day Calculations
  const selectedDayCalories = selectedDayMeals.reduce((sum, m) => sum + m.calories, 0);
  const selectedDayProtein = selectedDayMeals.reduce((sum, m) => sum + m.protein, 0);
  const selectedDayCarbs = selectedDayMeals.reduce((sum, m) => sum + m.carbs, 0);
  const selectedDayFat = selectedDayMeals.reduce((sum, m) => sum + m.fat, 0);
  
  const isSelectedDayOverLimit = selectedDayCalories > calorieGoal;

  // CSS Donut style percentage clip path calculation removed as clip-path handles visual overlay

  // Weight chart SVG line calculations
  // Weight range: e.g. 167 - 171 lbs. Width 300, Height 80.
  const svgW = 320;
  const svgH = 100;
  const minW = 167;
  const maxW = 171;
  const weightPoints = weightHistory.map((p, idx) => {
    const x = (idx / (weightHistory.length - 1)) * (svgW - 20) + 10;
    // Invert Y because SVG coordinates start from top
    const y = svgH - ((p.weight - minW) / (maxW - minW)) * (svgH - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  const handleAskAiAboutDay = () => {
    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const query = `Can you analyze my nutrition log for ${formattedDate}? I had ${selectedDayCalories} kcal (${selectedDayProtein}g Protein, ${selectedDayCarbs}g Carbs, ${selectedDayFat}g Fat).`;
    onNavigate('assistant', query);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--on-surface-variant)' }}>
        <p>Loading Health Insights...</p>
      </div>
    );
  }

  return (
    <div className="insights-container animate-fade-in">
      
      {/* Left Column: Calendar & Trends */}
      <div className="insights-main">
        
        {/* Calendar Card */}
        <section className="lifted-card calendar-card">
          <div className="calendar-header">
            <h3>October 2023</h3>
            <div className="calendar-nav-btns">
              <button className="icon-btn" title="Previous Month">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="icon-btn" title="Next Month">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="calendar-weekdays">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="calendar-grid">
            {Array.from({ length: daysInOctober }).map((_, idx) => {
              const dayNum = idx + 1;
              const paddedDay = dayNum.toString().padStart(2, '0');
              const dateStr = `${yearMonth}-${paddedDay}`;
              const dayInfo = getDayInfo(dayNum);
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dayNum}
                  className={`calendar-day-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <span className="day-number">{dayNum}</span>
                  <div className="day-indicator-dots">
                    {dayInfo && (
                      <span className={`day-dot ${dayInfo.status}`}></span>
                    )}
                    {dayInfo && dayInfo.workout && (
                      <span className="day-dot workout"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <span className="day-dot met"></span> Goal Met
            </div>
            <div className="legend-item">
              <span className="day-dot over"></span> Over Limit
            </div>
            <div className="legend-item">
              <span className="day-dot workout"></span> Workout
            </div>
          </div>
        </section>

        {/* Trends Row */}
        <div className="trends-grid">
          {/* Calorie Trend */}
          <div className="lifted-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="calendar-header">
              <div>
                <h4 className="card-title">Calorie Trend</h4>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                  Avg: {avgCalories} kcal / day
                </p>
              </div>
              <span className="trend-insight-badge">On Track</span>
            </div>

            <div className="trend-bars-container">
              {/* Target Line at 75% height */}
              <div className="trend-chart-bg-line" style={{ bottom: '70%' }}></div>
              
              {/* Show trend for Oct 1 to Oct 7 */}
              {Array.from({ length: 7 }).map((_, idx) => {
                const dayNum = idx + 1;
                const info = getDayInfo(dayNum);
                const cals = info ? info.calories : 0;
                // Height scale max 3000 kcal
                const pct = Math.min(100, Math.round((cals / 2800) * 100));
                return (
                  <div 
                    key={dayNum} 
                    className={`trend-chart-bar ${info ? info.status : 'met'}`}
                    style={{ height: `${Math.max(12, pct)}%` }}
                    title={`Oct ${dayNum}: ${cals} kcal`}
                  ></div>
                );
              })}
            </div>
            <div className="calendar-weekdays" style={{ marginTop: '12px', marginBottom: 0 }}>
              <div>Oct 1</div>
              <div>Oct 2</div>
              <div>Oct 3</div>
              <div>Oct 4</div>
              <div>Oct 5</div>
              <div>Oct 6</div>
              <div>Oct 7</div>
            </div>
          </div>

          {/* Weight progress line graph */}
          <div className="lifted-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="calendar-header">
              <div>
                <h4 className="card-title">Weight Progress</h4>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                  Current: {weightHistory[weightHistory.length - 1]?.weight || 168.4} lbs
                </p>
              </div>
              <span className="trend-insight-badge" style={{ backgroundColor: 'rgba(0, 88, 190, 0.08)', color: 'var(--secondary)', borderColor: 'rgba(0, 88, 190, 0.15)' }}>
                Predict: -1.2 lb
              </span>
            </div>

            {weightHistory.length > 1 ? (
              <div className="trend-svg-container">
                <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none">
                  {/* Grid guidelines */}
                  <line x1="0" y1="10" x2={svgW} y2="10" stroke="var(--outline-variant)" strokeWidth="0.5" strokeDasharray="4" />
                  <line x1="0" y1="50" x2={svgW} y2="50" stroke="var(--outline-variant)" strokeWidth="0.5" strokeDasharray="4" />
                  <line x1="0" y1="90" x2={svgW} y2="90" stroke="var(--outline-variant)" strokeWidth="0.5" strokeDasharray="4" />
                  
                  {/* Weight plot line */}
                  <polyline
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={weightPoints}
                  />

                  {/* Future trend line (dashed prediction) */}
                  <line 
                    x1={svgW - 40} 
                    y1={svgH - ((168.4 - minW) / (maxW - minW)) * (svgH - 20) - 10} 
                    x2={svgW - 10} 
                    y2={svgH - ((167.2 - minW) / (maxW - minW)) * (svgH - 20) - 10}
                    stroke="var(--secondary)" 
                    strokeWidth="3" 
                    strokeDasharray="4" 
                  />
                </svg>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
                <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>Loading weight data...</p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '8px' }}>
              <span>Oct 1</span>
              <span>Oct 7</span>
              <span>Oct 13</span>
              <span>Predicted</span>
            </div>
          </div>
        </div>

      </div>

      {/* Right Sidebar: Day Details */}
      <aside className="glass-panel insights-sidebar">
        <div className="detail-sidebar-header">
          <div>
            <h3 className="detail-sidebar-title">
              {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Details
            </h3>
            <p className={`detail-status-text ${isSelectedDayOverLimit ? 'over' : ''}`}>
              {selectedDayMeals.length === 0 
                ? 'No Meals Logged' 
                : isSelectedDayOverLimit ? 'Over Limit' : 'Goal Achieved'}
            </p>
          </div>
        </div>

        {/* Calories Donut Chart */}
        <div className="donut-chart-container">
          <div className="css-donut">
            <div className={`css-donut-overlay ${isSelectedDayOverLimit ? 'over' : ''}`}></div>
            <div className="donut-calories-number">{selectedDayCalories}</div>
            <div className="donut-calories-unit">/ {calorieGoal} kcal</div>
          </div>
        </div>

        {/* Macros Row */}
        <div className="sidebar-macros-row">
          <div className="sidebar-macro-cell">
            <div className="sidebar-macro-lbl">Carbs</div>
            <div className="sidebar-macro-val carbs">{selectedDayCarbs}g</div>
          </div>
          <div className="sidebar-macro-cell">
            <div className="sidebar-macro-lbl">Protein</div>
            <div className="sidebar-macro-val protein">{selectedDayProtein}g</div>
          </div>
          <div className="sidebar-macro-cell">
            <div className="sidebar-macro-lbl">Fat</div>
            <div className="sidebar-macro-val fat">{selectedDayFat}g</div>
          </div>
        </div>

        {/* Meals Logs */}
        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-background)', marginBottom: '8px' }}>
          Meal Log
        </h4>
        
        <div className="sidebar-meals-log no-scrollbar">
          {selectedDayMeals.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', padding: '12px 0' }}>
              No food recorded for this date.
            </p>
          ) : (
            selectedDayMeals.map((m) => (
              <div key={m.id} className="sidebar-meal-row">
                <div>
                  <div className="sidebar-meal-name">{m.name}</div>
                  <div className="sidebar-meal-desc">{m.mealType}</div>
                </div>
                <div className="sidebar-meal-cals">{m.calories} kcal</div>
              </div>
            ))
          )}
        </div>

        {/* Ask AI Trigger */}
        <button 
          className="btn-secondary" 
          onClick={handleAskAiAboutDay}
          disabled={selectedDayMeals.length === 0}
          style={{ width: '100%' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_awesome</span>
          Ask AI about this day
        </button>
      </aside>

    </div>
  );
};

export default HealthInsights;
