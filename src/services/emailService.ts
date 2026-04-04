import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.EMAIL_FROM;

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  if (!apiKey || !fromEmail) {
    console.log("SendGrid not configured. Skipping Email.");
    return;
  }

  const msg = {
    to,
    from: fromEmail,
    subject,
    text,
    html: html || text,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending Email:", error);
    throw error;
  }
};
