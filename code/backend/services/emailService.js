import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Support Desk" <${process.env.EMAIL_FROM}>`,
      to: userEmail,
      subject: 'Your Password Reset Request',
      text: `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
      html: `
        <p>You are receiving this email because you (or someone else) have requested the reset of a password.</p>
        <p>Please click on the following link to complete the process:</p>
        <a href="${resetUrl}">Reset Your Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendTicketUpdateEmail = async (customer, ticket) => {
  try {
    const mailOptions = {
      from: `"Support Desk" <${process.env.EMAIL_FROM}>`,
      to: customer.email,
      subject: `Update on your ticket #${ticket._id}`,
      text: `Hi ${customer.name},\n\nThe status of your ticket "${ticket.title}" has been updated to: ${ticket.status}.\n\nYou can view the ticket here: http://localhost:3000/tickets/${ticket._id}`, // Assumes a React frontend route
      html: `
        <p>Hi ${customer.name},</p>
        <p>The status of your ticket "${ticket.title}" has been updated to: <strong>${ticket.status}</strong>.</p>
        <p>You can view your ticket <a href="http://localhost:3000/tickets/${ticket._id}">here</a>.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Ticket update email sent to ${customer.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendNewCommentEmail = async (userToNotify, commenter, ticket) => {
  // Don't send an email if the user is commenting on their own ticket
  if (userToNotify._id.toString() === commenter._id.toString()) {
    return;
  }
  
  try {
    const mailOptions = {
      from: `"Support Desk" <${process.env.EMAIL_FROM}>`,
      to: userToNotify.email,
      subject: `New comment on your ticket #${ticket._id}`,
      text: `Hi ${userToNotify.name},\n\n${commenter.name} has added a new comment to your ticket "${ticket.title}".\n\nYou can view the comment here: http://localhost:3000/tickets/${ticket._id}`,
      html: `
        <p>Hi ${userToNotify.name},</p>
        <p><strong>${commenter.name}</strong> has added a new comment to your ticket "${ticket.title}".</p>
        <p>You can view the comment <a href="http://localhost:3000/tickets/${ticket._id}">here</a>.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`New comment email sent to ${userToNotify.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendAssignmentEmail = async (agent, ticket) => {
  try {
    const mailOptions = {
      from: `"Support Desk" <${process.env.EMAIL_FROM}>`,
      to: agent.email,
      subject: `New Ticket Assigned to You: #${ticket._id}`,
      text: `Hi ${agent.name},\n\nA new ticket, "${ticket.title}", has been assigned to you.\n\nYou can view the ticket here: http://localhost:3000/tickets/${ticket._id}`, // Assumes a React frontend route
      html: `
        <p>Hi ${agent.name},</p>
        <p>A new ticket, "${ticket.title}", has been assigned to you.</p>
        <p>You can view the ticket <a href="http://localhost:3000/tickets/${ticket._id}">here</a>.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Assignment email sent to ${agent.email}`);
  } catch (error) {
    console.error('Error sending assignment email:', error);
  }
};

export { sendPasswordResetEmail, sendTicketUpdateEmail, sendNewCommentEmail, sendAssignmentEmail };