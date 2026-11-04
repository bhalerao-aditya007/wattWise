// Fallback entrypoint if Vercel detects Express/Node preset instead of Vite
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function handler(req, res) {
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(distIndex)) {
    res.setHeader('Content-Type', 'text/html');
    res.end(fs.readFileSync(distIndex, 'utf-8'));
  } else {
    res.statusCode = 200;
    res.end('WattWise Web build ready.');
  }
}
