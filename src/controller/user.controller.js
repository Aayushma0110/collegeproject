import prisma from '../utils/prisma-clients.js';
import { generateToken } from '../utils/json.js';
import bcrypt from 'bcrypt';
import { sendEmail } from '../config/email.config.js';


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
    if (!body.name || !body.email || !body.password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    // Derive role (default to PATIENT)
    const roleValue = (body.role || 'PATIENT').toUpperCase();
    if (!allowedRoles.includes(roleValue)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    // Create base user
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: roleValue,
        phoneNumber: Array.isArray(body.phoneNumber)
          ? body.phoneNumber
          : body.phoneNumber ? [body.phoneNumber]
          : body.phone ? [body.phone] : [],
        profilePicture: body.profilePicture || null
      }
    });

    // Create patient profile if PATIENT role
    if (roleValue === 'PATIENT') {
      const patientData = { userId: user.id };
      if (body.dateOfBirth) patientData.dateOfBirth = new Date(body.dateOfBirth);
      if (body.gender) patientData.gender = body.gender;
      if (body.address) patientData.address = body.address;
      if (body.medicalHistory) patientData.medicalHistory = body.medicalHistory;

      await prisma.patientProfile.create({ data: patientData });
    }

    // Create doctor profile if DOCTOR role
    if (roleValue === 'DOCTOR') {
      const doctorData = { userId: user.id };
      if (body.degree) doctorData.degree = body.degree;
      if (body.nmcNumber) doctorData.nmcNumber = body.nmcNumber;
      if (body.institute) doctorData.institute = body.institute;
      if (body.specialty) doctorData.specialty = body.specialty;
      if (body.experience) doctorData.experience = body.experience;
      if (body.bio) doctorData.bio = body.bio;
      if (body.fees) doctorData.fees = body.fees;
      if (body.location) doctorData.location = body.location;
      if (body.city) doctorData.city = body.city;

      await prisma.doctorProfile.create({ data: doctorData });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get one user
const getOneUser = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
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
  const { name, phoneNumber, password, role } = req.body;

  try {
    // Build update data with only allowed fields
    const updateData = {};
    
    if (name) updateData.name = name;
    if (phoneNumber && Array.isArray(phoneNumber)) updateData.phoneNumber = phoneNumber;
    if (role && allowedRoles.includes(role.toUpperCase())) updateData.role = role.toUpperCase();

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (role && !allowedRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
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
        role: user.role,
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

// Get current user profile (authenticated user)
const getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: true,
        patientProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return profile based on role
    if (user.role === 'DOCTOR') {
      return res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber
        },
        profile: user.doctorProfile
      });
    } else if (user.role === 'PATIENT') {
      return res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber
        },
        profile: user.patientProfile
      });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Test email endpoint
const testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const testEmail = email || req.user?.email || 'test@example.com';

    const result = await sendEmail({
      to: testEmail,
      subject: '✅ Email Configuration Test - MediConnect',
      text: 'If you receive this email, your email configuration is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60;">✅ Email Test Successful!</h2>
          <p>Your email configuration is working correctly.</p>
          <p style="color: #666; margin-top: 30px;">Best regards,<br><strong>MediConnect Team</strong></p>
        </div>
      `
    });

    if (result.success) {
      res.json({ message: `Test email sent successfully to ${testEmail}`, success: true });
    } else {
      res.status(500).json({ message: 'Failed to send test email', error: result.error });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
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
  getCurrentUserProfile,
  testEmail,
};
