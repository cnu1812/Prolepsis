import { Buffer } from 'buffer';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  name: 'NotifyHuman',
  type: 'event',
  subscribes: ['system.patch_route'],
  emits: []
};


const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const FROM_NUM = process.env.TWILIO_FROM;
const TO_NUM = process.env.TWILIO_TO;

export const handler = async (event, { logger }) => {
  const data = event.data || event;
  const { missionId, isAdminTrigger, reason } = data;

 
  if (!isAdminTrigger) {
      return; 
  }

  const msgBody = `🚨 PROLEPSIS ADMIN ALERT 🚨\n\nVessel: ${missionId}\nAction: ${reason}\n\nAuthorized by Grandmaster Control.`;

  logger.info(`📱 SENDING SMS to ${TO_NUM}...`);

  if (!TWILIO_SID || TWILIO_SID.includes("YOUR_")) {
    logger.warn("⚠️ TWILIO CREDENTIALS MISSING. Check .env file.");
    return;
  }

  try {
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');
    const params = new URLSearchParams({
      'Body': msgBody,
      'From': FROM_NUM,
      'To': TO_NUM
    });

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (res.ok) logger.info(` SMS SENT SUCCESSFULLY!`);
    else logger.error(` TWILIO ERROR: ${await res.text()}`);
    
  } catch (e) {
    logger.error(` NETWORK ERROR: ${e.message}`);
  }
};