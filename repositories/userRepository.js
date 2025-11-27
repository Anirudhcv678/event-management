const User = require('../models/User');

class UserRepository {
  // Find user by email
  async findByEmail(email) {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  async findById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Create new user
  async create(userData) {
    try {
      const user = new User({
        email: userData.email.toLowerCase(),
        password: userData.password,
        name: userData.name,
        role: userData.role || 'attendee'
      });
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  // Get all users (for admin purposes)
  async getAll() {
    try {
      return await User.find().select('-password');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserRepository();

