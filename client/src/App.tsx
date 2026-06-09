import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import AiAssistant from './components/AiAssistant';
import HealthInsights from './components/HealthInsights';
import Settings from './components/Settings';
import LogMealModal from './components/LogMealModal';

export interface UserSettings {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  currentWeight: number;
  weightGoal: number;
}

export interface TodayStats {
  date: string;
  caloriesConsumed: number;
  caloriesBurned: number;
  remainingCalories: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
}

export interface WeeklyTrendItem {
  date: string;
  label: string;
  calories: number;
}

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  date: string;
  timestamp: string;
  imgUrl?: string;
}

export interface DashboardData {
  settings: UserSettings;
  today: TodayStats;
  recentMeals: MealItem[];
  weeklyTrends: WeeklyTrendItem[];
}

function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'assistant' | 'insights' | 'settings'>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [prefillChatText, setPrefillChatText] = useState<string | null>(null);

  // Fetch dashboard summary
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Load local storage theme if set
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const handleThemeToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleManualMealLog = async (mealData: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: string;
  }) => {
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData)
      });
      if (res.ok) {
        setShowLogModal(false);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error logging meal:', error);
    }
  };

  const handleNavigate = (tab: 'dashboard' | 'assistant' | 'insights' | 'settings', prefill?: string) => {
    setCurrentTab(tab);
    if (prefill) {
      setPrefillChatText(prefill);
    }
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': return "Today's Overview";
      case 'assistant': return "NutriAI Assistant";
      case 'insights': return "Health Insights";
      case 'settings': return "App Settings";
      default: return "NutriAI";
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Sidenav */}
      <aside className="desktop-sidebar">
        <div className="sidebar-header">
          <div className="profile-avatar">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB667NqXJ9lY-Eu6MQxp1KIoJ5YehfzkYiJzPGVJJGAryyHgpgWYQGLQDoWRls-5xFpiJIXCtZGHLmIkG6cKcs3GjjNIeSMVVbhjYnPQ3UWMKi2rxmIuuhMjLxg2BpZkwgxNvzXyUxcWdcYMigRWelrI2P4TaTD6ND2Grr0GZ7Zm7090ZPPSDrK0IWK9zSPsyTaaBf6PJAeeDpo1qsbs_o_QGBYNH3ZBUgZkCjQGlTGOqPBA_MXAoQxs9kBXDEavmlgsCaHN699-H6v" 
              alt="User Profile" 
            />
          </div>
          <div className="brand-details">
            <h2>NutriAI</h2>
            <p>Supportive Expert</p>
          </div>
        </div>

        <div className="sidebar-btn-container">
          <button className="btn-primary" onClick={() => setShowLogModal(true)}>
            <span className="material-symbols-outlined">add</span>
            Log New Meal
          </button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('dashboard')}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </button>
          <button 
            className={`nav-item ${currentTab === 'assistant' ? 'active' : ''}`}
            onClick={() => setCurrentTab('assistant')}
          >
            <span className="material-symbols-outlined">smart_toy</span>
            AI Assistant
          </button>
          <button 
            className={`nav-item ${currentTab === 'insights' ? 'active' : ''}`}
            onClick={() => setCurrentTab('insights')}
          >
            <span className="material-symbols-outlined">calendar_month</span>
            Health Insights
          </button>
        </nav>

        <div className="sidebar-footer">
          <button 
            className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentTab('settings')}
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </button>
          <button className="nav-item" onClick={handleThemeToggle}>
            <span className="material-symbols-outlined">
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </aside>

      {/* Desktop Header */}
      <header className="desktop-header">
        <div className="header-title">
          <h2>{getPageTitle()}</h2>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search foods..." />
          </div>
          <button className="icon-btn" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="icon-btn" aria-label="Theme toggle" onClick={handleThemeToggle}>
            <span className="material-symbols-outlined">
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="mobile-header">
        <h1>{getPageTitle()}</h1>
        <button className="icon-btn" aria-label="Profile">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="main-canvas">
        {loading && !dashboardData ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <p>Loading NutriAI Calorie Tracker...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && dashboardData && (
              <Dashboard 
                data={dashboardData} 
                onLogMealClick={() => setShowLogModal(true)}
                onNavigate={handleNavigate}
              />
            )}
            {currentTab === 'assistant' && (
              <AiAssistant 
                onMealLogged={fetchDashboardData} 
                prefillMessage={prefillChatText}
                onClearPrefill={() => setPrefillChatText(null)}
              />
            )}
            {currentTab === 'insights' && dashboardData && (
              <HealthInsights 
                calorieGoal={dashboardData.settings.calorieGoal} 
                onNavigate={handleNavigate}
              />
            )}
            {currentTab === 'settings' && dashboardData && (
              <Settings 
                settings={dashboardData.settings} 
                onSettingsUpdate={fetchDashboardData} 
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <button 
          className={`mobile-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <span className="material-symbols-outlined">dashboard</span>
          Dashboard
        </button>
        <button 
          className={`mobile-nav-item ${currentTab === 'assistant' ? 'active' : ''}`}
          onClick={() => setCurrentTab('assistant')}
        >
          <span className="material-symbols-outlined">smart_toy</span>
          Assistant
        </button>
        <button 
          className={`mobile-nav-item ${currentTab === 'insights' ? 'active' : ''}`}
          onClick={() => setCurrentTab('insights')}
        >
          <span className="material-symbols-outlined">insights</span>
          Insights
        </button>
        <button 
          className={`mobile-nav-item ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentTab('settings')}
        >
          <span className="material-symbols-outlined">settings</span>
          Settings
        </button>
      </nav>

      {/* Manual Meal Log Modal */}
      <LogMealModal 
        isOpen={showLogModal} 
        onClose={() => setShowLogModal(false)} 
        onLogMeal={handleManualMealLog}
      />
    </div>
  );
}

export default App;
