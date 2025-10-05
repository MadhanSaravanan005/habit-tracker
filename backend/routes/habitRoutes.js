const express = require("express");
const Habit = require("../models/Habit");
const router = express.Router();

// Get all habits
router.get("/", async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new habit
router.post("/", async (req, res) => {
  try {
    const { name, description, category, frequency, targetDays } = req.body;
    const habit = new Habit({ name, description, category, frequency, targetDays });
    const savedHabit = await habit.save();
    res.status(201).json(savedHabit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update habit (mark as completed for today)
router.put("/:id/complete", async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const alreadyCompleted = habit.completedDates.some(date => 
      new Date(date).setHours(0, 0, 0, 0) === today.getTime()
    );

    if (!alreadyCompleted) {
      habit.completedDates.push(today);
      habit.streak += 1;
      if (habit.streak > habit.longestStreak) {
        habit.longestStreak = habit.streak;
      }
      await habit.save();
    }

    res.json(habit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reset habit streak
router.put("/:id/reset", async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    habit.streak = 0;
    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a habit
router.delete("/:id", async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id);
    if (!habit) return res.status(404).json({ error: "Habit not found" });
    res.json({ message: "Habit deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;