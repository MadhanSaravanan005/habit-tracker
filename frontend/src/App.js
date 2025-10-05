import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHabits, addHabit, completeHabit, resetHabit, deleteHabit } from "./redux/habitSlice";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const habits = useSelector((state) => state.habits.list);
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    category: "", 
    frequency: "daily", 
    targetDays: 30 
  });

  useEffect(() => { 
    dispatch(fetchHabits()); 
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addHabit(form));
    setForm({ 
      name: "", 
      description: "", 
      category: "", 
      frequency: "daily", 
      targetDays: 30 
    });
  };

  const handleComplete = (id) => {
    dispatch(completeHabit(id));
  };

  const handleReset = (id) => {
    dispatch(resetHabit(id));
  };

  const handleDelete = (id) => {
    dispatch(deleteHabit(id));
  };

  const isCompletedToday = (habit) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return habit.completedDates.some(date => 
      new Date(date).setHours(0, 0, 0, 0) === today.getTime()
    );
  };

  const getCompletionRate = (habit) => {
    const totalDays = habit.targetDays;
    const completedDays = habit.completedDates.length;
    return Math.round((completedDays / totalDays) * 100);
  };

  return (
    <div className="container">
      <h2>Habit Tracker</h2>
      
      {/* Add Habit Form */}
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          placeholder="Habit Name" 
          value={form.name} 
          onChange={(e) => setForm({ ...form, name: e.target.value })} 
          required 
        />
        <input 
          type="text"
          placeholder="Description" 
          value={form.description} 
          onChange={(e) => setForm({ ...form, description: e.target.value })} 
          required 
        />
        <select 
          value={form.category} 
          onChange={(e) => setForm({ ...form, category: e.target.value })} 
          required
        >
          <option value="">Select Category</option>
          <option value="Health">Health</option>
          <option value="Fitness">Fitness</option>
          <option value="Learning">Learning</option>
          <option value="Productivity">Productivity</option>
          <option value="Mindfulness">Mindfulness</option>
          <option value="Social">Social</option>
          <option value="Creative">Creative</option>
          <option value="Career">Career</option>
          <option value="Other">Other</option>
        </select>
        <select 
          value={form.frequency} 
          onChange={(e) => setForm({ ...form, frequency: e.target.value })} 
          required
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <input 
          type="number"
          placeholder="Target Days" 
          min="1"
          max="365"
          value={form.targetDays} 
          onChange={(e) => setForm({ ...form, targetDays: parseInt(e.target.value) })} 
          required 
        />
        <button type="submit">Add Habit</button>
      </form>

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <div className="empty-state">
          <p>No habits found. Create your first habit above!</p>
        </div>
      ) : (
        <div className="habits-grid">
          {habits.map((habit) => (
            <div key={habit._id} className="habit-card">
              <h3>{habit.name}</h3>
              <p>{habit.description}</p>
              
              <div className="frequency-badge">
                {habit.frequency}
              </div>
              <span className="category-badge">
                {habit.category}
              </span>
              
              <div className="habit-stats">
                <div className="stat">
                  <span className="stat-number">{habit.streak}</span>
                  <span className="stat-label">Current Streak</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{habit.longestStreak}</span>
                  <span className="stat-label">Best Streak</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{getCompletionRate(habit)}%</span>
                  <span className="stat-label">Completion</span>
                </div>
              </div>
              
              <div className="habit-actions">
                <button 
                  className="complete-btn"
                  onClick={() => handleComplete(habit._id)}
                  disabled={isCompletedToday(habit)}
                >
                  {isCompletedToday(habit) ? '✅ Done Today' : '✓ Mark Complete'}
                </button>
                <button 
                  className="reset-btn"
                  onClick={() => handleReset(habit._id)}
                  title="Reset Streak"
                >
                  Reset
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(habit._id)}
                  title="Delete Habit"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;