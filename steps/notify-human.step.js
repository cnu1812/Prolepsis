// steps/notify-human.step.js
import { Buffer } from 'buffer';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  name: 'NotifyHuman',
  type: 'event',
  subscribes: ['system.patch_route'], // Listen for reroutes
  emits: []
};

// --- CONFIGURATION ---
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const FROM_NUM = process.env.TWILIO_FROM;
const TO_NUM = process.env.TWILIO_TO;

export const handler = async (event, { logger }) => {
    const data = event.data || event;
    const { missionId, isAdminTrigger, reason } = data;
  
    // --- STRICT FILTER: ADMIN ONLY ---
    // If this did not come from the Admin Panel, IGNORE IT.
    if (!isAdminTrigger) {
        return; 
    }
  
    // 2. CONSTRUCT MESSAGE
    const msgBody = `🚨 ADMIN COMMAND 🚨\n\nVessel: ${missionId}\nAction: ${reason}\n\nAuthorized by Grandmaster Control.`;
  
    logger.info(`📱 SENDING SECURE ADMIN SMS to ${TO_NUM}...`);
  
    if (TWILIO_SID === "YOUR_TWILIO_SID") {
      logger.warn("⚠️ TWILIO NOT CONFIGURED. Skipping SMS.");
      return;
    }
  
    // 3. SEND VIA TWILIO API
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
  
      if (res.ok) logger.info(`✅ ADMIN SMS SENT!`);
      else logger.error(`❌ SMS FAILED: ${await res.text()}`);
      
    } catch (e) {
      logger.error(`❌ NETWORK ERROR: ${e.message}`);
    }
  };