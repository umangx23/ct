import React, { useState, useEffect } from 'react';
import './LogMealModal.css';

interface LogMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogMeal: (meal: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: string;
  }) => void;
}

const LogMealModal: React.FC<LogMealModalProps> = ({ isOpen, onClose, onLogMeal }) => {
  const [name, setName] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fat, setFat] = useState<string>('');
  const [mealType, setMealType] = useState<string>('Lunch');

  const [formError, setFormError] = useState<string | null>(null);

  // Reset fields when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setMealType('Lunch');
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validation
    if (!name.trim()) {
      setFormError('Please enter a food name.');
      return;
    }
    const calsNum = Number(calories);
    if (calories === '' || isNaN(calsNum) || calsNum < 0) {
      setFormError('Please enter a valid positive calorie count.');
      return;
    }

    onLogMeal({
      name: name.trim(),
      calories: calsNum,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      mealType
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">Log New Meal</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && (
              <div className="settings-alert error modal-error-alert">
                <span className="material-symbols-outlined icon-sm">error</span>
                <span className="modal-error-text">{formError}</span>
              </div>
            )}

            <div className="modal-fields-stack">
              
              <div className="form-field">
                <label htmlFor="food-name">Food Name *</label>
                <input
                  id="food-name"
                  type="text"
                  placeholder="e.g., Tuna Wrap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid modal-type-cals-grid">
                <div className="form-field">
                  <label htmlFor="meal-type">Meal Type</label>
                  <select
                    id="meal-type"
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="modal-select"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="calories">Calories (kcal) *</label>
                  <input
                    id="calories"
                    type="number"
                    placeholder="e.g., 350"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="macros-fields-grid">
                <div className="form-field">
                  <label htmlFor="protein">Protein (g)</label>
                  <input
                    id="protein"
                    type="number"
                    placeholder="0"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="carbs">Carbs (g)</label>
                  <input
                    id="carbs"
                    type="number"
                    placeholder="0"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="fat">Fat (g)</label>
                  <input
                    id="fat"
                    type="number"
                    placeholder="0"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-flat" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <span className="material-symbols-outlined">add</span>
              Log Meal
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default LogMealModal;
