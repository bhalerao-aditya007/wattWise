// Universal entrypoint for Vercel / Node deployments
const path = require('path');
const fs = require('fs');

let app;
try {
  app = require('./server/src/app');
} catch (e) {
  app = (req, res) => {
    const distPath = path.join(__dirname, 'dist', 'index.html');
    const webDistPath = path.join(__dirname, 'web', 'dist', 'index.html');
    if (fs.existsSync(distPath)) {
      res.setHeader('Content-Type', 'text/html');
      return res.end(fs.readFileSync(distPath, 'utf-8'));
    }
    if (fs.existsSync(webDistPath)) {
      res.setHeader('Content-Type', 'text/html');
      return res.end(fs.readFileSync(webDistPath, 'utf-8'));
    }
    res.statusCode = 200;
    res.end('WattWise backend & frontend initialized.');
  };
}

module.exports = app;
