const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  frequency: { type: String, required: true, enum: ['daily', 'weekly', 'monthly'] },
  targetDays: { type: Number, required: true },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  completedDates: [{ type: Date }],
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Habit", habitSchema);