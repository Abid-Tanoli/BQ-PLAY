const mongoose = require('mongoose');

const CommentarySchema = new mongoose.Schema({
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  timestamp: { type: Date, default: Date.now },
  text: { type: String, required: true },
  over: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Commentary', CommentarySchema);