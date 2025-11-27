const userService = require('../services/userService');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await userService.getUserProfile(req.user.id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error fetching profile',
        error: error.message
      });
    }
  }

  async getUserRegistrations(req, res) {
    try {
      const registrations = await userService.getUserRegistrations(req.user.id);

      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error('Error fetching user registrations:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching registrations',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();

