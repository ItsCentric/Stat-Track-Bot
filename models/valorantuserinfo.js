const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const valorantUserInfoSchema = new Schema({
  discordUserId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  tagline: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  }
});

const ValorantUserInfo = mongoose.model('ValorantUserInfo', valorantUserInfoSchema);

module.exports = ValorantUserInfo;