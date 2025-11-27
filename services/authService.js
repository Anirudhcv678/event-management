const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

class AuthService {
  async register(email, password, name, role = 'attendee') {
    // Validate role
    if (role && !['attendee', 'organizer'].includes(role)) {
      throw new Error('Role must be either "attendee" or "organizer"');
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      role
    });

    // Generate JWT token
    const token = this.generateToken(user);

    // Remove password from response
    const userResponse = user.toJSON();

    return {
      user: userResponse,
      token
    };
  }

  async login(email, password) {
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Remove password from response
    const userResponse = user.toJSON();

    return {
      user: userResponse,
      token
    };
  }

  generateToken(user) {
    return jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }
}

module.exports = new AuthService();

