import express from 'express';
const router = express.Router();
import { getTicketReport } from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.get('/tickets', protect, admin, getTicketReport);

export default router;