const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // For development, use a test account or configure with real SMTP
  // In production, use proper SMTP credentials
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter;
};

// Send event registration confirmation email
const sendRegistrationEmail = async (userEmail, eventDetails) => {
  try {
    // If email credentials are not configured, log to console instead
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('\n=== EMAIL NOTIFICATION (Email service not configured) ===');
      console.log(`To: ${userEmail}`);
      console.log(`Subject: Event Registration Confirmation`);
      console.log(`Body: You have successfully registered for "${eventDetails.title}"`);
      console.log(`Event Date: ${eventDetails.date}`);
      console.log(`Event Time: ${eventDetails.time}`);
      console.log('========================================================\n');
      return { success: true, message: 'Email logged to console (email service not configured)' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@eventmanagement.com',
      to: userEmail,
      subject: 'Event Registration Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Event Registration Confirmed!</h2>
          <p>Hello,</p>
          <p>You have successfully registered for the following event:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">${eventDetails.title}</h3>
            <p><strong>Date:</strong> ${eventDetails.date}</p>
            <p><strong>Time:</strong> ${eventDetails.time}</p>
            <p><strong>Description:</strong> ${eventDetails.description || 'N/A'}</p>
          </div>
          <p>We look forward to seeing you at the event!</p>
          <p>Best regards,<br>Event Management Team</p>
        </div>
      `,
      text: `
        Event Registration Confirmed!
        
        You have successfully registered for the following event:
        
        Title: ${eventDetails.title}
        Date: ${eventDetails.date}
        Time: ${eventDetails.time}
        Description: ${eventDetails.description || 'N/A'}
        
        We look forward to seeing you at the event!
        
        Best regards,
        Event Management Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendRegistrationEmail
};

