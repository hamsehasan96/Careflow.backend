const path = require('path');
const express = require('express');
const router = express.Router();
const { authenticate, hasPermission, hasRole } = require(path.join(__dirname, '..', 'middleware', 'rbac.middleware'));
const { validate, handleValidationErrors } = require(path.join(__dirname, '..', 'middleware', 'validation.middleware'));
const { sanitizeBody } = require(path.join(__dirname, '..', 'middleware', 'sanitization.middleware'));
const { apiLimiter } = require(path.join(__dirname, '..', 'middleware', 'security.middleware'));
const { User, Role } = require(path.join(__dirname, '..', 'models'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const { sendUserNotification } = require(path.join(__dirname, '..', 'services', 'notification.service'));

// Get all users (admin only)
router.get(
  '/',
  authenticate,
  hasRole('admin'),
  async (req, res) => {
    try {
      const users = await User.findAll({
        include: [Role],
        attributes: { exclude: ['password'] }
      });
      
      res.status(200).json(users);
    } catch (error) {
      logger.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  }
);

// Get user by ID
router.get(
  '/:id',
  authenticate,
  async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Users can only access their own profile unless they're admins
      if (req.user.id !== parseInt(userId) && req.user.Role?.name !== 'admin') {
        return res.status(403).json({ message: 'You do not have permission to access this user profile' });
      }
      
      const user = await User.findByPk(userId, {
        include: [Role],
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      logger.error(`Error fetching user ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  }
);

// Update user profile
router.put(
  '/:id',
  authenticate,
  sanitizeBody,
  validate.updateUser,
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Users can only update their own profile unless they're admins
      if (req.user.id !== parseInt(userId) && req.user.Role?.name !== 'admin') {
        return res.status(403).json({ message: 'You do not have permission to update this user profile' });
      }
      
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update user fields
      const updatedUser = await user.update({
        name: req.body.name || user.name,
        email: req.body.email || user.email,
        contactNumber: req.body.contactNumber || user.contactNumber,
        jobTitle: req.body.jobTitle || user.jobTitle,
        department: req.body.department || user.department,
        preferredLanguage: req.body.preferredLanguage || user.preferredLanguage,
        profileImage: req.body.profileImage || user.profileImage,
        notificationPreferences: req.body.notificationPreferences || user.notificationPreferences
      });
      
      // Return updated user without password
      const userResponse = updatedUser.toJSON();
      delete userResponse.password;
      
      res.status(200).json(userResponse);
    } catch (error) {
      logger.error(`Error updating user ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to update user profile' });
    }
  }
);

// Change user password
router.post(
  '/:id/change-password',
  authenticate,
  sanitizeBody,
  validate.changePassword,
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Users can only change their own password
      if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ message: 'You do not have permission to change this user\'s password' });
      }
      
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify current password
      const isPasswordValid = await user.comparePassword(req.body.currentPassword);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Update password
      user.password = req.body.newPassword;
      await user.save();
      
      // Send notification about password change
      try {
        await sendUserNotification(
          user,
          'Password Changed',
          'Your password has been successfully changed. If you did not make this change, please contact support immediately.',
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4a6da7;">Password Changed</h2>
              <p>Your password has been successfully changed.</p>
              <p>If you did not make this change, please contact support immediately.</p>
              <p>Regards,<br>CareFlow Team</p>
            </div>
          `
        );
      } catch (notificationError) {
        logger.error('Failed to send password change notification:', notificationError);
        // Continue even if notification fails
      }
      
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error(`Error changing password for user ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  }
);

// Update user role (admin only)
router.put(
  '/:id/role',
  authenticate,
  hasRole('admin'),
  sanitizeBody,
  validate.updateUserRole,
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { roleId } = req.body;
      
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if role exists
      const role = await Role.findByPk(roleId);
      
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // Update user role
      await user.update({ roleId });
      
      // Return updated user with role
      const updatedUser = await User.findByPk(userId, {
        include: [Role],
        attributes: { exclude: ['password'] }
      });
      
      res.status(200).json(updatedUser);
    } catch (error) {
      logger.error(`Error updating role for user ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to update user role' });
    }
  }
);

// Invite new user (admin or manager only)
router.post(
  '/invite',
  authenticate,
  hasRole(['admin', 'manager']),
  apiLimiter,
  sanitizeBody,
  validate.inviteUser,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, name, roleId } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
      
      // Check if role exists
      const role = await Role.findByPk(roleId);
      
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Create new user
      const newUser = await User.create({
        email,
        name,
        password: tempPassword,
        roleId,
        mustChangePassword: true
      });
      
      // Send invitation email
      try {
        const { sendEmail } = require(path.join(__dirname, '..', 'services', 'notification.service'));
        
        await sendEmail(
          email,
          'Welcome to CareFlow - Your Account Invitation',
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4a6da7;">Welcome to CareFlow!</h2>
              <p>Hello ${name},</p>
              <p>You have been invited to join CareFlow as a ${role.name}.</p>
              <p>Here are your temporary login credentials:</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              </div>
              <p>Please log in and change your password as soon as possible.</p>
              <p><a href="${process.env.CLIENT_URL}/login" style="background-color: #4a6da7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to CareFlow</a></p>
              <p>If you have any questions, please contact your administrator.</p>
              <p>Regards,<br>CareFlow Team</p>
            </div>
          `,
          `Welcome to CareFlow!
          
Hello ${name},

You have been invited to join CareFlow as a ${role.name}.

Here are your temporary login credentials:
Email: ${email}
Temporary Password: ${tempPassword}

Please log in and change your password as soon as possible.

Login at: ${process.env.CLIENT_URL}/login

If you have any questions, please contact your administrator.

Regards,
CareFlow Team`
        );
      } catch (emailError) {
        logger.error('Failed to send invitation email:', emailError);
        // Continue even if email fails, but notify the admin
        return res.status(201).json({
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            roleId: newUser.roleId
          },
          message: 'User created successfully, but invitation email could not be sent',
          tempPassword
        });
      }
      
      res.status(201).json({
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          roleId: newUser.roleId
        },
        message: 'User invited successfully'
      });
    } catch (error) {
      logger.error('Error inviting user:', error);
      res.status(500).json({ message: 'Failed to invite user' });
    }
  }
);

module.exports = router;
