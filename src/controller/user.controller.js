import { prisma } from '../utils/prisma-client.js';
import { generateToken } from '../utils/json.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import {updateProfile} from "../utils/upload.js"
const uploadDir=path.join(process.cwd(),'upload'); //kun caii file ma file upload garne

// const getAllUsers=(req,res)=>{
// let users;

//we use .then method rarely in production level backend in camparison to async await.
// prisma.User.findMany().then(
//     (data)=> {
//         users =data;
//           res.status(200).json(users);
//     },
// );
// //res.status(200).json(users);
// }

//wrap function with async keyword while creating function with function keyword
// async function getUsers(req,res){
// }
const getAllUsers = async (req, res) => {
  try {
    const {name,email}=req.query;
    const users = await prisma.user.findMany({
      where:{
       ...( name&&{name:{contains:name}}),
       ...(email&&{email:{contains:email}})
      }
    }
    );
    res.status(200).json(users);
  }
  catch (error) {
    console.log(error);
    res.status(200).json({ error: 'Internal server error' });
  }
};
const createUser = async (req, res) => {
  console.log(req.user); //admin le matra attach garna milne thauma use hunxa
  try {
    const body = req.body;
    const existingUser = await prisma.user.findUnique({
      where: {
        email:body.email
      }

    });
    if (existingUser) {
      return res.status(409).json({ error: 'email already exist' })
    }
    //if folder available:do nothing ,if folder isnot available then create the folder 
    // if(!fs.existsSync(uploadDir)){
    //   fs.mkdirSync(uploadDir);
    // }
     const file=req.files?.profile_picture;
       const allowedMimes= ["image/jpeg", "image/png", "image/gif"];
  const fileUri= await updateProfile(file,allowedMimes); 
    const salt =await bcrypt.genSalt(10);
    const hashedPassword =await bcrypt.hash(body.password,salt);
    //npm install bcrypt
//const hashedPassword=hash(password)
//login
//userinthash=hash(body.password)
//compare(dataspacepasswordhash,userinput hash)
  
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone_number: body.phone_number,
        password: hashedPassword,
        profile_picture:fileUri
      }
    });
    const {password, ..._user}=user;
    res.status(201).json(_user); //204 to delete ,200 to get,201 send status
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });//500 server error .status code
  }
};
const getOneUser = async (req, res) => {
  const id = req.params.id;
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(id)
    }

  }).then(user => {
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    res.status(200).json(user);
  }).catch((error) => {
    console.log(error);
  });
}
const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const body=req.body;
  console.log("Updating User",req.user);
  const loggedInUser = req.user; 
  //Update User Function(Update Controller)
  //if logged in vako user le matra afno info update garna milyo
  //afaile update garna khojirake xa vane matra update garna milne natra error FORBIDDEN(403)
  //books,author and genre ko cord api
//product api dazaz app add,delete,edit

  if (!loggedInUser ) {
      res.status(403).json({error:"FORBIDDEN"});
  }
      if (loggedInUser.id !== id) {
      return res.status(403).json({ error: "FORBIDDEN: You cannot update information of other users" });
    }


try {

     if(body.password){
          const salt = await bcrypt.genSalt(10);
       body.password = await bcrypt.hash(body.password, salt);
     }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: req.body
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
}
const loginUser = async (req, res) => {
  //take email and password from re.body
  //find user using email
  //if user is found then check password and generate token,if not found invalid credentials error
  // use case of the token
  try {
    const body = req.body;
    const { email, password=hashlogPassword } = body;
    //select one user from email
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    })


    console.log(user)
    //if no user found then throw invalid credentials
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const isMatch=await bcrypt.compare(body.password,user.password);
    //we will change this logic later after implementing hashing
    if(!isMatch) {
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
        phone_number: user.phone_number
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid server error" });
  }
}
const passwordChange = async (req, res) => {
  try{
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required" });
    }

   const user = await prisma.user.findUnique({
      where: { id},
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
      where: { id},
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password changed successfully" });
  }catch(error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const profileUpdate=async(req,res)=>{
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


// ------------------- GET PROFILE -------------------
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    delete user.password

    res.json(user); // returns full user object including password
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- UPDATE PROFILE -------------------
export const updateProfile = async (req, res) => {
  try {
    const data = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    delete updateUser.password; 

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
  profileUpdate
};


