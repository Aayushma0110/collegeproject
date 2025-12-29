import prisma from '../utils/prisma-clients.js';
import { generateToken } from '../utils/json.js';
import bcrypt from 'bcrypt';


const allowedRoles = ["ADMIN", "DOCTOR", "PATIENT"];

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { name, email } = req.query;
    const users = await prisma.user.findMany({
      where: {
        ...(name && { name: { contains: name } }),
        ...(email && { email: { contains: email } })
      }
    });
    res.status(200).json(users);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const body = req.body;

    // Validate required fields
    if (!body.name || !body.email || !body.password || !body.role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    // Validate role against allowedRoles
    if (!allowedRoles.includes(body.role.toUpperCase())) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    // Validate optional scheduledAt if provided (ISO 8601)
    if (body.scheduledAt) {
      const parsedSched = new Date(body.scheduledAt);
      if (isNaN(parsedSched)) {
        return res.status(400).json({ message: "Invalid scheduledAt format. Use ISO 8601." });
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'email already exists' });
    }

    // Handle profile picture (optional)
    let fileUri = null;
    const file = req.files?.profile_picture;
    const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
    if (file) {
      fileUri = await saveProfilePicture(file, allowedMimes);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role.toUpperCase(), // 🔥 Ensure role matches enum

        // Array fields
        phoneNumber: Array.isArray(body.phoneNumber)
          ? body.phoneNumber
          : body.phoneNumber ? [body.phoneNumber] : [],
        profilePicture_: [],

        // Optional fields
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        gender: body.gender || null,
        medicalHistory: body.medicalHistory || null,
        specialty: body.specialty || null,
        experience: body.experience || null,
        fees: body.fees || null
      }
    });

    // Exclude password in response
    const { password, ..._user } = user;
    res.status(201).json(_user);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get one user
const getOneUser = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update user
const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;

  try {
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }

    if (body.role && !allowedRoles.includes(body.role.toUpperCase())) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: body
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "User not found" });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const deletedUser = await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "User deleted", deletedUser });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "User not found" });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const body = req.body || {};
    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid Credentials" });

    const token = generateToken(user);
    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Password change
const passwordChange = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required" });
    }

    const id = req.user.id;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({ where: { id }, data: { password: hashedPassword } });
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  getAllUsers,
  createUser,
  getOneUser,
  deleteUser,
  updateUser,
  loginUser,
  passwordChange,
};
