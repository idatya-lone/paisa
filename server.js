import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/send-monthly-report', async (req, res) => {
  try {
    const { email, month, workbookBase64 } = req.body ?? {};

    if (!email || !month || !workbookBase64) {
      return res.status(400).json({ error: 'Missing required payload.' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const workbookBuffer = Buffer.from(workbookBase64, 'base64');

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(200).json({
        message: 'Email service is not configured. Report prepared successfully in mock mode.',
        mockMode: true,
        month,
        recipient: email,
      });
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Janhavi & Aditya — ${month} monthly budget report`,
      text: `Hi,\n\nPlease find attached the monthly budget report for ${month}.\n\nRegards,\nJanhavi & Aditya`,
      attachments: [
        {
          filename: `janhavi-aditya-${month}-report.xlsx`,
          content: workbookBuffer,
        },
      ],
    });

    return res.status(200).json({
      message: 'Monthly report emailed successfully.',
      mockMode: false,
      month,
      recipient: email,
    });
  } catch (error) {
    console.error('Error sending report:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to send report',
    });
  }
});

app.listen(port, () => {
  console.log(`Report email server listening on http://localhost:${port}`);
});
