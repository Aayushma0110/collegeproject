// src/controllers/user.controller.js
import prisma from '../utils/prisma-clients.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { uploadFile } from '../utils/upload.js'; // <-- upload utility

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};


const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

/**
 * Determine an accessible file path for upload utilities.
 * Supports multer (req.file.path) and express-fileupload (file.tempFilePath).
 */
const getTempFilePath = (file) => {
  if (!file) return null;
  // multer
  if (file.path) return file.path;
  // express-fileupload
  if (file.tempFilePath) return file.tempFilePath;
  // older shape
  if (file.tempFile) return file.tempFile; // fallback
  return null;
};

export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone_number,
      dateOfBirth,
      gender,
      medicalHistory,
      specialty,
      experience,
      fees,
      availability
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email', 'password', 'role']
      });
    }

    const validRoles = ['PATIENT', 'DOCTOR', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Handle profile picture upload via upload utility
    let profile_picture = null;
    let tempFilePathToRemove = null; // clean up if we create temp file usage

    const file =
      // multer single file: req.file
      req.file ||
      // express-fileupload: req.files && req.files.profile_picture
      (req.files && req.files.profile_picture) ||
      null;

    if (file) {
      // Basic MIME check if available
      const mimetype = file.mimetype || file.mimetypeType || null;
      if (mimetype) {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedMimes.includes(mimetype)) {
          return res.status(400).json({ error: 'Invalid file type' });
        }
      }

      const filePath = getTempFilePath(file);

      // If the upload middleware didn't provide a path (rare), write the buffer to a temp file
      if (!filePath && file.data) {
        // express-fileupload provides file.data (buffer)
        const tmpDir = path.join(process.cwd(), 'tmp_uploads');
        await fs.promises.mkdir(tmpDir, { recursive: true });
        const tmpName = `${Date.now()}_${file.name || 'upload'}`;
        const tmpPath = path.join(tmpDir, tmpName);
        await fs.promises.writeFile(tmpPath, file.data);
        tempFilePathToRemove = tmpPath;
      }

      const uploadPath = filePath || tempFilePathToRemove;
      if (uploadPath) {
        try {
          profile_picture = await uploadFile(uploadPath);
        } finally {
          // Try to remove any temp file we created or that multer/express-fileupload left (if it makes sense)
          try {
            if (tempFilePathToRemove) await fs.promises.unlink(tempFilePathToRemove).catch(() => {});
            // Note: if using multer, don't unlink here because multer either stores permanently or cleans up
          } catch (e) {
            // non-fatal
          }
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Build user data according to role. Use clean() to drop undefined values
    const baseData = {
      name,
      email,
      password: hashedPassword,
      role,
      phone_number,
      profile_picture
    };

    const roleSpecific = {};
    if (role === 'PATIENT') {
      if (dateOfBirth) roleSpecific.dateOfBirth = new Date(dateOfBirth);
      if (gender) roleSpecific.gender = gender;
      if (medicalHistory) roleSpecific.medicalHistory = medicalHistory;
    }

    if (role === 'DOCTOR') {
      if (specialty) roleSpecific.specialty = specialty;
      if (experience) roleSpecific.experience = Number.isFinite(Number(experience)) ? parseInt(experience, 10) : undefined;
      if (fees) roleSpecific.fees = Number.isFinite(Number(fees)) ? parseFloat(fees) : undefined;
      if (availability) {
        try {
          roleSpecific.availability = typeof availability === 'string' ? JSON.parse(availability) : availability;
        } catch (e) {
          return res.status(400).json({ error: 'Invalid availability format; expected JSON' });
        }
      }
      roleSpecific.status = 'PENDING';
    }

    const userData = clean({ ...baseData, ...roleSpecific });

    const user = await prisma.user.create({ data: userData });
    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone_number: true, // fixed field name
        profile_picture: true
      }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOneUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get one user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, password, dateOfBirth, gender, medicalHistory, specialty, experience, fees } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updateData = {};

    if (name) updateData.name = name;
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== id) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      updateData.email = email;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (user.role === 'PATIENT') {
      if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
      if (gender) updateData.gender = gender;
      if (medicalHistory) updateData.medicalHistory = medicalHistory;
    }

    if (user.role === 'DOCTOR') {
      if (specialty) updateData.specialty = specialty;
      if (experience) updateData.experience = Number.isFinite(Number(experience)) ? parseInt(experience, 10) : undefined;
      if (fees) updateData.fees = Number.isFinite(Number(fees)) ? parseFloat(fees) : undefined;
    }

    const cleaned = clean(updateData);
    const updatedUser = await prisma.user.update({
      where: { id },
      data: cleaned
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json({ message: 'User updated successfully', user: userWithoutPassword });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ message: 'Login successful', token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
