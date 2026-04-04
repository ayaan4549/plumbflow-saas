import twilio from "twilio";

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const fromPhone = process.env.TWILIO_PHONE;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const sendSMS = async (to: string, message: string) => {
  if (!client || !fromPhone) {
    console.log("Twilio not configured. Skipping SMS.");
    return;
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: fromPhone,
      to: to,
    });
    console.log(`SMS sent successfully: ${result.sid}`);
    return result;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};
