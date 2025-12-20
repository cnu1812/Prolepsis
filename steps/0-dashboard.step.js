import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const config = {
  name: 'ServeDashboard',
  type: 'api',
  path: '/dashboard', 
  method: 'GET',
  emits: []
};

export const handler = async (req, { logger }) => {
  try {
   
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '..', 'public', 'index.html');
    
    
    logger.info(`🔍 Looking for dashboard at: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at ${filePath}`);
    }

    const html = fs.readFileSync(filePath, 'utf-8');

    logger.info("Serving Dashboard UI");
    return {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html
    };
  } catch (err) {
    logger.error("DASHBOARD ERROR: " + err.message);
    return { 
        status: 500, 
        body: `<h1>Error Loading Dashboard</h1><p>Could not find file at: <code>${err.message}</code></p><p>Current Folder: ${process.cwd()}</p>` 
    };
  }
};