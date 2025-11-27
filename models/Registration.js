const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Create compound index to prevent duplicate registrations
registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);

