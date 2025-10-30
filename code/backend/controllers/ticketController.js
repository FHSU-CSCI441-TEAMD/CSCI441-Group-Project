import Ticket from '../models/ticketModel.js';
import Comment from '../models/commentModel.js';
import User from '../models/userModel.js';
import {
  sendTicketUpdateEmail,
  sendNewCommentEmail,
  sendAssignmentEmail
} from '../services/emailService.js';

const createTicket = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    const ticket = new Ticket({
      customer: req.user._id,
      title,
      description,
      priority,
    });

    const createdTicket = await ticket.save();
    res.status(201).json(createdTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllTickets = async (req, res) => {
  try {
    let tickets;

    if (req.user.role === 'Admin') {
      tickets = await Ticket.find({}).populate('customer', 'name email');
    } else if (req.user.role === 'Agent') {
      tickets = await Ticket.find({
        agent: req.user._id
      }).populate('customer', 'name email');
    } else {
      tickets = await Ticket.find({ customer: req.user._id });
    }

    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('agent', 'name email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name email role' },
      });

    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    const isCustomer = req.user.role === 'Customer';
    const isOwner = ticket.customer._id.toString() === req.user._id.toString();

    if (isCustomer && !isOwner) {
      res.status(403);
      throw new Error('User not authorized to view this ticket');
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addCommentToTicket = async (req, res) => {
  try {
    const { text } = req.body;
    const ticketId = req.params.id;
    const author = req.user;

    if (!text) {
      res.status(400);
      throw new Error('Comment text is required');
    }

    const ticket = await Ticket.findById(ticketId).populate('customer');
    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    const comment = await Comment.create({
      text,
      author: author._id,
      ticket: ticketId,
    });

    await Ticket.findByIdAndUpdate(ticketId, {
      $push: { comments: comment._id },
    });

    await sendNewCommentEmail(ticket.customer, author, ticket);

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name email role'
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTicket = async (req, res) => {
  if (req.user.role === 'Customer') {
    res.status(403);
    throw new Error('User not authorized for this action');
  }

  try {
    const { status, agentId } = req.body;
    // Populate customer info for the status update email
    const ticket = await Ticket.findById(req.params.id).populate('customer');

    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    let statusChanged = false;

    if (status && status !== ticket.status) {
      ticket.status = status;
      statusChanged = true;
    }

    if (agentId && agentId.toString() !== ticket.agent?.toString()) {
      ticket.agent = agentId;
      
      const agentToNotify = await User.findById(agentId);
      
      if (agentToNotify) {
        await sendAssignmentEmail(agentToNotify, ticket);
      }
    }

    const updatedTicket = await ticket.save();

    if (statusChanged) {
      await sendTicketUpdateEmail(ticket.customer, updatedTicket);
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  createTicket,
  getAllTickets,
  getTicketById,
  addCommentToTicket,
  updateTicket,
};