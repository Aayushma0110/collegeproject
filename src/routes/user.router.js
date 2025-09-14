import { Router } from "express";
import {getALLUsers,createUser,getOneUser,deleteUser,updateUser} from './../controller/users.controller.js';

const router  = Router();
router.get('/',getALLUsers);
router.get('/:id', getOneUser);
router.delete(':/id',deleteUser); 
router.put(':/id', updateUser);
    router.get('/profile',(req,res)=>{
        res.send('User profile page');

    });


router.post('/', createUser);
// router.get('/',(req,res)=>{
//     res.send('hello from user routers!');
// })
export default router;
//// src/routes/user.routes.js
import express from "express";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", verifyToken, getProfile);
router.put("/me", verifyToken, updateProfile);

export default router;
