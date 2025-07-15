import nodemailer from 'nodemailer';
import fs from 'fs';
import Email from '../Modals/emailschema.js';



export const scheduleEmail = async (req, res) => {
  try {
    const { to, subject, text, scheduledAt } = req.body;
    const file = req.file;

    const isScheduled =
      scheduledAt && new Date(scheduledAt) > new Date();

    const emailData = new Email({
      to,
      subject,
      text,
      scheduledAt: isScheduled ? new Date(scheduledAt) : null,
      status: isScheduled ? 'scheduled' : 'sent',
      sentAt: isScheduled ? null : new Date(),
      attachment: file
        ? {
            filename: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size,
          }
        : undefined,
    });

    await emailData.save();

    // ✅ If NOT scheduled, send immediately
    if (!isScheduled) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text,
        attachments: file
          ? [
              {
                filename: file.originalname,
                path: file.path,
              },
            ]
          : [],
      });
    }

    res.status(200).json({
      message: isScheduled
        ? 'Email scheduled successfully'
        : 'Email sent immediately',
      email: emailData,
    });
  } catch (err) {
    console.error('Error in scheduleEmail:', err.message);
    res.status(500).json({ message: err.message });
  }
};



export const getEmailsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const allowedStatuses = ['sent', 'scheduled'];
    let filter = {};
    let sort = { createdAt: -1 };

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Use "sent" or "scheduled".' });
      }

      filter = { status };
      sort = status === 'sent' ? { sentAt: -1 } : { scheduledAt: 1 };
    }

    const emails = await Email.find(filter).sort(sort);
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
