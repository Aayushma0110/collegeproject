import express from 'express';
import fileUpload from 'express-fileupload';
import {
  createUser,
  getAllUsers,
  getOneUser,
  updateUser,
  deleteUser,
  loginUser
} from '../controller/user.controller.js';

const router = express.Router();

router.use(fileUpload());

router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);
router.get('/:id', getOneUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
