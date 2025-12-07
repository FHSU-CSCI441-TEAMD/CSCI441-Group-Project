// written by: Nirak
// tested by: Nirak
// debugged by: Nirak

import express from 'express';
const router = express.Router();
import { getUserProfile, createUserByAdmin, updateUserProfile, getAllUsers, } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/', protect, admin, createUserByAdmin);

router.get('/', protect, admin, getAllUsers);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;