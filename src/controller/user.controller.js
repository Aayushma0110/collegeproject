import prisma from '../utils/prisma-clients.js';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '7d' }
  );
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

    const validRoles = ["PATIENT", "DOCTOR", "ADMIN"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    let profile_picture = null;
    if (req.files && req.files.profile_picture) {
      const file = req.files.profile_picture;
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedMimes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type' });
      }

      const fileName = `${Date.now()}_${file.name}`;
      const uploadDir = path.join(process.cwd(), 'uploads');
      await fs.promises.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await file.mv(filePath);
      profile_picture = `/uploads/${fileName}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      ...(phone_number && { phone_number }),
      ...(profile_picture && { profile_picture })
    };

    if (role === 'PATIENT') {
      Object.assign(userData, {
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(medicalHistory && { medicalHistory })
      });
    }

    if (role === 'DOCTOR') {
      Object.assign(userData, {
        ...(specialty && { specialty }),
        ...(experience && { experience: parseInt(experience) }),
        ...(fees && { fees: parseFloat(fees) }),
        ...(availability && { availability: JSON.parse(availability) }),
        status: 'PENDING'
      });
    }

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
//function clean(obj) {
//   return Object.fromEntries(Object.entries(obj).filter(([,v]) => v !== undefined));
// }
//await prisma.user.create({ data: clean(payload) });


export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phonenumber: true,
        profile_picture: true,
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
    const id = parseInt(req.params.id);
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
    const id = parseInt(req.params.id);
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
      if (experience) updateData.experience = parseInt(experience);
      if (fees) updateData.fees = parseFloat(fees);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
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
    const id = parseInt(req.params.id);
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
