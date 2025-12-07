import Ticket from '../models/ticketModel.js';
import mongoose from 'mongoose';

const getTicketReport = async (req, res) => {
  try {
    const { status, agentId, priority } = req.query;

    const matchCriteria = {};
    if (status) matchCriteria.status = status;
    if (priority) matchCriteria.priority = priority;
    if (agentId) matchCriteria.agent = new mongoose.Types.ObjectId(agentId);

    const report = await Ticket.aggregate([
      { $match: matchCriteria },
      
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      
      { $sort: { count: -1 } },
    ]);

    const totalTickets = await Ticket.countDocuments(matchCriteria);

    res.status(200).json({
      totalTickets,
      report,
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { getTicketReport };