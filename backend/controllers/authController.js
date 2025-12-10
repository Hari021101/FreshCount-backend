import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/firebase.js';

// Register a new user (Admin only can create users)
export const register = async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ message: 'Back-end service unavailable: Database not initialized (missing serviceAccountKey.json)' });
    }
    const { email, password, name, role } = req.body;

    // Validate input
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (role !== 'admin' && role !== 'staff') {
      return res.status(400).json({ message: 'Role must be either admin or staff' });
    }

    // Check if user already exists
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    if (!usersSnapshot.empty) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document
    const userRef = db.collection('users').doc();
    await userRef.set({
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userRef.id,
        email,
        name,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    // Check if db is initialized
    if (!db) {
      return res.status(503).json({ message: 'Database service unavailable' }); 
    }
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (usersSnapshot.empty) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: userDoc.id, email: userData.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ message: 'Back-end service unavailable: Database not initialized (missing serviceAccountKey.json)' });
    }
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email,
      name: doc.data().name,
      role: doc.data().role,
      createdAt: doc.data().createdAt
    }));

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
  try {

    if (!db) {
      return res.status(503).json({ message: 'Back-end service unavailable: Database not initialized (missing serviceAccountKey.json)' });
    }
    const { userId } = req.params;
    const { role } = req.body;

    if (role !== 'admin' && role !== 'staff') {
      return res.status(400).json({ message: 'Role must be either admin or staff' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    await userRef.update({ role });

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {

    if (!db) {
      return res.status(503).json({ message: 'Back-end service unavailable: Database not initialized (missing serviceAccountKey.json)' });
    }
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    await userRef.delete();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// Update Profile (Self)
export const updateProfile = async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ message: 'Database service unavailable' });
    }
    const { userId } = req.user;
    const { name, email, phone, dob, avatarUrl } = req.body;

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email; // Note: Changing email might require re-verification in a real app
    if (phone) updates.phone = phone;
    if (dob) updates.dob = dob;
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    if (Object.keys(updates).length > 0) {
      await userRef.update(updates);
    }

    const updatedDoc = await userRef.get();
    
    // Return updated user data (excluding password)
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        password: undefined 
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ message: 'Database service unavailable' });
    }
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    const isPasswordValid = await bcrypt.compare(currentPassword, userData.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRef.update({ password: hashedPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};
