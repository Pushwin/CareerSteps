require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Parse URL and get file path
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './loginpageandsighup.html';
    }

    // Get file extension
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf8');
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`, 'utf8');
            }
        } else {
            // Success - serve the file
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            });
            
            // If it's a JavaScript file, inject the API key
            if (extname === '.js' && filePath.includes('script.js')) {
                const modifiedContent = content.toString().replace(
                    'GEMINI_API_KEY_PLACEHOLDER',
                    process.env.GEMINI_API_KEY || 'your-gemini-api-key-here'
                );
                res.end(modifiedContent, 'utf8');
            } else {
                res.end(content, 'utf8');
            }
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Career Path Generator server running on http://0.0.0.0:${PORT}`);
});