import mongoose from 'mongoose';

const userQuestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest',
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  claimed: {
    type: Boolean,
    default: false
  },
  lastReset: {
    type: Date,
    default: Date.now
  }
});

// Index unique pour éviter les doublons user+quest
userQuestSchema.index({ user: 1, quest: 1 }, { unique: true });

const UserQuest = mongoose.model('UserQuest', userQuestSchema);

export default UserQuest; 