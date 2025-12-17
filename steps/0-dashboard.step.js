import fs from 'fs';
import path from 'path';

export const config = {
  name: 'ServeDashboard',
  type: 'api',
  path: '/dashboard', 
  method: 'GET',
  emits: []
};

export const handler = async (req, { logger }) => {
  try {
    
    const filePath = path.join(process.cwd(), 'public', 'index.html');
    
    const html = fs.readFileSync(filePath, 'utf-8');

    logger.info("🖥️ Serving Dashboard UI");
    return {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  } catch (err) {
    logger.error("Failed to load dashboard: " + err.message);
    return { status: 500, body: "Error loading dashboard. Make sure public/index.html exists." };
  }
};