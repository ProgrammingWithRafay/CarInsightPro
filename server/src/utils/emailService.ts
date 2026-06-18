/**
 * Replaces Nodemailer with Brevo's HTTP REST API to completely bypass
 * Railway's outbound SMTP firewall.
 */

/**
 * Helper function to send an email using Brevo's REST API via native fetch.
 */
const sendBrevoEmail = async (toEmail: string, toName: string, subject: string, htmlContent: string, senderName: string = "CarInsight Pro") => {
  const apiKey = process.env.SMTP_PASS;
  const senderEmail = process.env.EMAIL_FROM || 'carinsight.app@gmail.com';

  if (!apiKey) {
    console.error('Missing Brevo API Key (SMTP_PASS)');
    return null;
  }

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [
      {
        email: toEmail,
        name: toName || 'User'
      }
    ],
    subject: subject,
    htmlContent: htmlContent
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Brevo API Error:', response.status, response.statusText, errorData);
      throw new Error(`Brevo API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`✉️  Email sent via Brevo HTTP API to ${toEmail} (Message ID: ${data.messageId})`);
    return data;
  } catch (err) {
    console.error('Failed to send HTTP email via Brevo:', err);
    throw err;
  }
};

/**
 * Sends a welcome/verification email containing a unique confirmation link.
 */
export const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify/${token}`;

  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0e1117; color: #e0e0e0; border-radius: 12px; overflow: hidden; border: 1px solid #2a2d35;">
      <div style="background: linear-gradient(135deg, #1E63FF 0%, #0d47a1 100%); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 1px;">CarInsight Pro</h1>
        <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px;">Email Verification</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <h2 style="margin: 0 0 16px; font-size: 22px; color: #ffffff;">Hello, ${name}!</h2>
        <p style="font-size: 15px; line-height: 1.7; color: #a0a0a0; margin-bottom: 30px;">
          Thank you for registering with CarInsight Pro. To complete your registration and gain full access to our analytics platform, please verify your email address.
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${verificationUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #1E63FF 0%, #4285f4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(30, 99, 255, 0.4);">
            Verify My Email
          </a>
        </div>
        
        <p style="font-size: 13px; line-height: 1.6; color: #666; margin-top: 30px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="font-size: 12px; color: #1E63FF; word-break: break-all; background: #1a1d24; padding: 12px; border-radius: 6px; border: 1px solid #2a2d35;">
          ${verificationUrl}
        </p>
        
        <p style="font-size: 13px; color: #666; margin-top: 25px;">
          This link will expire in <strong style="color: #e0e0e0;">24 hours</strong>.
        </p>
      </div>
      
      <div style="background: #0a0c10; padding: 20px 30px; text-align: center; border-top: 1px solid #2a2d35;">
        <p style="margin: 0; font-size: 11px; color: #555;">
          &copy; ${new Date().getFullYear()} CarInsight Pro. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return sendBrevoEmail(email, name, 'Verify Your Email - CarInsight Pro', htmlContent);
};

/**
 * Notifies a user via email when an admin updates their support ticket status
 */
export const sendSupportTicketUpdateEmail = async (email: string, name: string, subject: string, status: string, newReply?: string) => {
  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0e1117; color: #e0e0e0; border-radius: 12px; overflow: hidden; border: 1px solid #2a2d35;">
      <div style="background: linear-gradient(135deg, #1E63FF 0%, #0d47a1 100%); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 1px;">CarInsight Pro</h1>
        <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px;">Support Ticket Update</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <h2 style="margin: 0 0 16px; font-size: 22px; color: #ffffff;">Hello, ${name}!</h2>
        <p style="font-size: 15px; line-height: 1.7; color: #a0a0a0; margin-bottom: 20px;">
          There has been an update to your support ticket: <strong>"${subject}"</strong>.
        </p>
        <p style="font-size: 15px; line-height: 1.7; color: #a0a0a0; margin-bottom: 20px;">
          The current status is now: <strong style="color: #ffffff;">${status}</strong>
        </p>
        
        ${newReply ? `
        <div style="margin-top: 30px; padding: 20px; background: #1a1d24; border-radius: 8px; border-left: 4px solid #1E63FF;">
          <h3 style="margin: 0 0 10px; font-size: 16px; color: #ffffff;">New Message from Support:</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #d0d0d0; white-space: pre-wrap;">${newReply}</p>
        </div>
        ` : ''}
        
      </div>
      
      <div style="background: #0a0c10; padding: 20px 30px; text-align: center; border-top: 1px solid #2a2d35;">
        <p style="margin: 0; font-size: 11px; color: #555;">
          &copy; ${new Date().getFullYear()} CarInsight Pro. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return sendBrevoEmail(email, name, `Update on your Support Ticket: ${subject}`, htmlContent, "CarInsight Pro Support");
};

/**
 * Sends an automated confirmation email immediately after a user submits a new ticket.
 */
export const sendSupportTicketCreatedEmail = async (email: string, name: string, subject: string) => {
  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0e1117; color: #e0e0e0; border-radius: 12px; overflow: hidden; border: 1px solid #2a2d35;">
      <div style="background: linear-gradient(135deg, #1E63FF 0%, #0d47a1 100%); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 1px;">CarInsight Pro</h1>
        <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px;">Support Ticket Received</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <h2 style="margin: 0 0 16px; font-size: 22px; color: #ffffff;">Hello, ${name}!</h2>
        <p style="font-size: 15px; line-height: 1.7; color: #a0a0a0; margin-bottom: 20px;">
          We have received your support request: <strong>"${subject}"</strong>.
        </p>
        <p style="font-size: 15px; line-height: 1.7; color: #a0a0a0; margin-bottom: 20px;">
          Our support team will review your message and get back to you as soon as possible. You will receive an email update here once we reply.
        </p>
      </div>
      
      <div style="background: #0a0c10; padding: 20px 30px; text-align: center; border-top: 1px solid #2a2d35;">
        <p style="margin: 0; font-size: 11px; color: #555;">
          &copy; ${new Date().getFullYear()} CarInsight Pro. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return sendBrevoEmail(email, name, `Support Ticket Received: ${subject}`, htmlContent, "CarInsight Pro Support");
};

/**
 * Delivers a secure password reset link to the user.
 */
export const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${token}`;

  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0e1117; color: #e0e0e0; border-radius: 12px; overflow: hidden; border: 1px solid #2a2d35;">
      <div style="background: linear-gradient(135deg, #1E63FF 0%, #0d47a1 100%); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 1px;">CarInsight Pro</h1>
        <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px;">Password Reset</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <h2 style="margin: 0 0 16px; font-size: 22px; color: #ffffff;">Hello, ${name}!</h2>
        <p style="font-size: 15px; line-height: 1.7; color: #a0a0a0; margin-bottom: 30px;">
          We received a request to reset your password. Click the button below to choose a new password. If you didn't make this request, you can safely ignore this email.
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #1E63FF 0%, #4285f4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(30, 99, 255, 0.4);">
            Reset My Password
          </a>
        </div>
        
        <p style="font-size: 13px; line-height: 1.6; color: #666; margin-top: 30px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="font-size: 12px; color: #1E63FF; word-break: break-all; background: #1a1d24; padding: 12px; border-radius: 6px; border: 1px solid #2a2d35;">
          ${resetUrl}
        </p>
        
        <p style="font-size: 13px; color: #666; margin-top: 25px;">
          This link will expire in <strong style="color: #e0e0e0;">1 hour</strong>.
        </p>
      </div>
      
      <div style="background: #0a0c10; padding: 20px 30px; text-align: center; border-top: 1px solid #2a2d35;">
        <p style="margin: 0; font-size: 11px; color: #555;">
          &copy; ${new Date().getFullYear()} CarInsight Pro. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return sendBrevoEmail(email, name, 'Reset Your Password - CarInsight Pro', htmlContent);
};
