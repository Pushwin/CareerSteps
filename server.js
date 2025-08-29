require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

// Route mappings for clean URLs
const routeMap = {
    '/': '/loginpageandsighup.html',
    '/careerchoose': '/careerchoose.html',
    '/steps': '/steps.html',
    '/resources': '/resources.html'
};

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    
    // Parse URL and get file path
    let filePath = '.' + req.url;
    
    // Handle route mapping
    if (routeMap[req.url]) {
        filePath = '.' + routeMap[req.url];
    }
    
    // Default to login page for root
    if (filePath === './' || filePath === '.') {
        filePath = './loginpageandsighup.html';
    }
    
    // Security: prevent directory traversal
    if (filePath.includes('..')) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 - Forbidden</h1>', 'utf8');
        return;
    }

    // Get file extension
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    console.log(`Serving file: ${filePath}`);

    // Check if file exists first
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
            <h1>404 - File Not Found</h1>
            <p>The requested file ${req.url} was not found on this server.</p>
            <a href="/">Go to Home</a>
        `, 'utf8');
        return;
    }

    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(`
                <h1>500 - Server Error</h1>
                <p>Error: ${err.code}</p>
                <a href="/">Go to Home</a>
            `, 'utf8');
        } else {
            // Success - serve the file
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
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

// Error handling for server
server.on('error', (err) => {
    console.error('Server error:', err);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Career Path Generator server running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Gemini API Key configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
});