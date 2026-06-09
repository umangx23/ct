import React, { useState } from 'react';
import './Settings.css';
import type { UserSettings } from '../App';

interface SettingsProps {
  settings: UserSettings;
  onSettingsUpdate: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsUpdate }) => {
  const [calorieGoal, setCalorieGoal] = useState<number>(settings.calorieGoal);
  const [proteinGoal, setProteinGoal] = useState<number>(settings.proteinGoal);
  const [carbsGoal, setCarbsGoal] = useState<number>(settings.carbsGoal);
  const [fatGoal, setFatGoal] = useState<number>(settings.fatGoal);
  const [currentWeight, setCurrentWeight] = useState<number>(settings.currentWeight);
  const [weightGoal, setWeightGoal] = useState<number>(settings.weightGoal);
  
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    // Basic Validation
    if (calorieGoal <= 0 || proteinGoal < 0 || carbsGoal < 0 || fatGoal < 0 || currentWeight <= 0 || weightGoal <= 0) {
      setAlert({ type: 'error', message: 'Please enter valid positive numbers.' });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calorieGoal,
          proteinGoal,
          carbsGoal,
          fatGoal,
          currentWeight,
          weightGoal
        })
      });

      if (res.ok) {
        setAlert({ type: 'success', message: 'Goals updated successfully!' });
        onSettingsUpdate();
      } else {
        setAlert({ type: 'error', message: 'Failed to save settings. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setAlert({ type: 'error', message: 'Server connection failed.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-container animate-fade-in">
      <form onSubmit={handleSubmit} className="lifted-card">
        
        {alert && (
          <div className={`settings-alert ${alert.type}`}>
            <span className="material-symbols-outlined">
              {alert.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {alert.message}
          </div>
        )}

        <h4 className="settings-section-title">Daily Energy & Macro Goals</h4>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="calorie-limit">Daily Calorie Target (kcal)</label>
            <input
              id="calorie-limit"
              type="number"
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(Number(e.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="protein-target">Protein Goal (g)</label>
            <input
              id="protein-target"
              type="number"
              value={proteinGoal}
              onChange={(e) => setProteinGoal(Number(e.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="carbs-target">Carbs Goal (g)</label>
            <input
              id="carbs-target"
              type="number"
              value={carbsGoal}
              onChange={(e) => setCarbsGoal(Number(e.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="fats-target">Fats Goal (g)</label>
            <input
              id="fats-target"
              type="number"
              value={fatGoal}
              onChange={(e) => setFatGoal(Number(e.target.value))}
            />
          </div>
        </div>

        <h4 className="settings-section-title">Body Metrics</h4>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="curr-weight">Current Weight (lbs)</label>
            <input
              id="curr-weight"
              type="number"
              step="0.1"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(Number(e.target.value))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="target-weight">Goal Weight (lbs)</label>
            <input
              id="target-weight"
              type="number"
              step="0.1"
              value={weightGoal}
              onChange={(e) => setWeightGoal(Number(e.target.value))}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={saving}
          >
            <span className="material-symbols-outlined">save</span>
            {saving ? 'Saving...' : 'Save Goals'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;
