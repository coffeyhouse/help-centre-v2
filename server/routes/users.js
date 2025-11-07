import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const USERS_FILE = path.join(__dirname, '..', '..', 'public', 'data', 'users.json');

/**
 * Helper function to read users from JSON file
 */
async function readUsers() {
  try {
    const content = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading users file:', error);
    throw new Error('Failed to read users');
  }
}

/**
 * Helper function to write users to JSON file
 */
async function writeUsers(data) {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing users file:', error);
    throw new Error('Failed to save users');
  }
}

/**
 * Helper function to generate a unique user ID
 */
function generateUserId(existingUsers) {
  const userIds = existingUsers.map(u => {
    const match = u.id.match(/^user-(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  });
  const maxId = Math.max(0, ...userIds);
  return `user-${maxId + 1}`;
}

/**
 * GET /api/users
 * Get all users or a specific user by ID (query param)
 */
router.get('/', async (req, res) => {
  try {
    const data = await readUsers();

    // If userId query param is provided, return specific user
    const { userId } = req.query;
    if (userId) {
      const user = data.users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(user);
    }

    // Return all users
    res.json(data);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/users
 * Create a new user
 * Body: { name, email, persona, ownedProducts }
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, persona, ownedProducts } = req.body;

    // Validation
    if (!name || !email || !persona) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, and persona are required'
      });
    }

    // Read existing users
    const data = await readUsers();

    // Check if email already exists
    const emailExists = data.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return res.status(409).json({
        error: 'A user with this email already exists'
      });
    }

    // Create new user
    const newUser = {
      id: generateUserId(data.users),
      name,
      email,
      persona,
      ownedProducts: ownedProducts || []
    };

    // Add to users array
    data.users.push(newUser);

    // Save to file
    await writeUsers(data);

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/users/:id
 * Update an existing user
 * Body: { name?, email?, persona?, ownedProducts? }
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, persona, ownedProducts } = req.body;

    // Read existing users
    const data = await readUsers();

    // Find user
    const userIndex = data.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If email is being changed, check if new email already exists
    if (email && email.toLowerCase() !== data.users[userIndex].email.toLowerCase()) {
      const emailExists = data.users.some(
        (u, idx) => idx !== userIndex && u.email.toLowerCase() === email.toLowerCase()
      );
      if (emailExists) {
        return res.status(409).json({
          error: 'A user with this email already exists'
        });
      }
    }

    // Update user (only update provided fields)
    const updatedUser = {
      ...data.users[userIndex],
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(persona !== undefined && { persona }),
      ...(ownedProducts !== undefined && { ownedProducts })
    };

    data.users[userIndex] = updatedUser;

    // Save to file
    await writeUsers(data);

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user (optional - for completeness)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Read existing users
    const data = await readUsers();

    // Find user
    const userIndex = data.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove user
    const deletedUser = data.users.splice(userIndex, 1)[0];

    // Save to file
    await writeUsers(data);

    res.json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
