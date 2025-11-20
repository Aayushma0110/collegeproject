import prisma from '../utils/prisma-clients.js'
import { generateToken } from '../utils/json.js';
import bcrypt from 'bcrypt';


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
export const getMyAppointmentHistory = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereCondition = {};
    if (userRole === 'PATIENT') {
        whereCondition = { patientId: userId };
    } else if (userRole === 'DOCTOR') {
        whereCondition = { doctorId: userId };
    } else {
        // Admins can see all appointments, or you can restrict this
        whereCondition = {}; 
    }

    const appointments = await prisma.appointment.findMany({
        where: whereCondition,
        include: {
            doctor: { select: { name: true, specialty: true } },
            patient: { select: { name: true } }
        },
        orderBy: { scheduledAt: 'desc' }
    });

    res.json(appointments);
};

const createUser = async (req, res) => {
  try {
    const body = req.body;

    // Validate required fields
    if (!body.name || !body.email || !body.password || !body.role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: body.email
      }
    });
    if (existingUser) {
      return res.status(409).json({ error: 'email already exist' });
    }

    let fileUri = null;
    const file = req.files?.profile_picture;
    const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
    if (file) {
      fileUri = await saveProfilePicture(file, allowedMimes);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        profilePicture: fileUri,
        role: body.role // Make sure this is present and valid
      }
    });
    const { password, ..._user } = user;
    res.status(201).json(_user);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getOneUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  const loggedInUser = req.user;

  if (!loggedInUser) {
    return res.status(403).json({ error: "FORBIDDEN" });
  }
  if (loggedInUser.id !== id) {
    return res.status(403).json({ error: "FORBIDDEN: You cannot update information of other users" });
  }

  try {
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
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

const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const deletedUser = await prisma.user.delete({
      where: { id: id }
    });

    res.status(200).json({ message: "User deleted", deletedUser });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "User not found" });
  }
};

const loginUser = async (req, res) => {
  try {
    const body = req.body;
    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const token = generateToken(user);
    res.status(200).json({
      message: "Login Successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid server error" });
  }
};

const passwordChange = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required" });
    }

    const id = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const profileUpdate = async (req, res) => {
  try {
    const loggedInUser = req.user;
    if (!loggedInUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = loggedInUser.id;
    const { name, email, phone_number } = req.body;
    if (!name && !email && !phone_number) {
      return res.status(400).json({ message: "No data provided to update" });
    }

    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== id) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone_number && { phone_number }),
      },
    });
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    delete user.password;

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {
  getAllUsers,
  createUser,
  getOneUser,
  profileUpdate,
  deleteUser,
  updateUser,
  loginUser,
  passwordChange,
};


