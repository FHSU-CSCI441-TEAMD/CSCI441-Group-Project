import express from 'express';

const router = express.Router();

import {
  createTicket,
  getAllTickets,
  getTicketById,
  addCommentToTicket,
  updateTicket,
} from '../controllers/ticketController.js';
import { protect, agentOrAdmin } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, createTicket)
    .get(protect, getAllTickets);

router.route('/:id')
    .get(protect, getTicketById)
    .put(protect, agentOrAdmin, updateTicket);

router.route('/:id/comments')
    .post(protect, addCommentToTicket);

export default router;