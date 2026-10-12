const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    if (dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
    }
} catch (e) {}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getStatus } = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api', apiRoutes);

// Serve static frontend files from workspace root
app.use(express.static(__dirname));

// Fallback to index.html for Single Page Application routing
app.get('*', (req, res) => {
    // If request was looking for an API route that didn't match
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server with graceful shutdown and resilient port handling
function startServer(port, retries = 3) {
    const server = app.listen(port, () => {
        const isDbConnected = getStatus().connected;
        console.log(`\n======================================================`);
        console.log(`🚀 Community Skill Exchange Server is running!`);
        console.log(`📍 Web App URL:      http://localhost:${port}`);
        console.log(`📡 API Status URL:   http://localhost:${port}/api/status`);
        console.log(`💾 MongoDB Status:   ${isDbConnected ? 'Connected ✅' : 'Connecting / Local Storage Mode ⚠️'}`);
        console.log(`======================================================\n`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`[Server] Port ${port} is currently busy.`);
            if (retries > 0) {
                const nextPort = port + 1;
                console.log(`[Server] Retrying on fallback port ${nextPort}...`);
                setTimeout(() => {
                    startServer(nextPort, retries - 1);
                }, 500);
            } else {
                console.error(`[Server] All attempted ports are in use. Please terminate existing Node processes or specify a free PORT in .env.`);
                process.exit(1);
            }
        } else {
            console.error('[Server] Unexpected server error:', err);
            process.exit(1);
        }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
        server.close(() => {
            process.exit(0);
        });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

// Bootstrap MongoDB and start server locally
async function bootstrap() {
    try {
        await connectDB();
    } catch (err) {
        console.warn('[MongoDB] Init connection warning:', err.message);
    }

    if (process.env.VERCEL !== '1' && !process.env.NOW_REGION) {
        startServer(PORT);
    }
}

bootstrap();

module.exports = app;

