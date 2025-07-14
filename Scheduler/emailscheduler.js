import cron from 'node-cron';
import Email from '../Modals/emailschema.js'
import nodemailer from 'nodemailer';
// import fs from 'fs';

// Run every minute
cron.schedule('* * * * *', async () => {
  const now = new Date();

  const dueEmails = await Email.find({
    status: 'scheduled',
    scheduledAt: { $lte: new Date() }
  });

  for (const email of dueEmails) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email.to,
        subject: email.subject,
        text: email.text,
        attachments: email.attachment ? [{
          filename: email.attachment.filename,
          path: email.attachment.path
        }] : [],
      });

      email.status = 'sent';
      email.sentAt = new Date();
      await email.save();
    } catch (error) {
      console.error('Failed to send scheduled email:', error.message);
    }
  }
});
