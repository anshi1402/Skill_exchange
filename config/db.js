const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS resolution for robust Windows SRV record lookups
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // Continue with default resolver if custom DNS is restricted
}

let isConnected = false;
let connectionError = null;

const connectDB = async () => {
    // If already connected (e.g. cached serverless container on Vercel), reuse connection
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/community_skill_exchange';

    try {
        mongoose.set('strictQuery', false);

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
        });

        isConnected = true;
        connectionError = null;
        console.log(`[MongoDB] Connected successfully to: ${mongoose.connection.name || 'community_skill_exchange'}`);
    } catch (err) {
        isConnected = false;
        connectionError = err.message;
        console.warn(`\n[MongoDB] Warning: Could not connect to MongoDB at "${mongoUri}".`);
        console.warn(`[MongoDB] Reason: ${err.message}`);
        console.warn(`[MongoDB] Tip: Make sure MongoDB is running locally, or configure MONGODB_URI in .env with your MongoDB Atlas connection string.`);
        console.warn(`[MongoDB] The server will still run and serve the app with local storage fallback.\n`);
    }

    mongoose.connection.on('connected', () => {
        isConnected = true;
        connectionError = null;
        console.log('[MongoDB] Connection state: Connected');
    });

    mongoose.connection.on('error', (err) => {
        isConnected = false;
        connectionError = err.message;
        console.error('[MongoDB] Runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
        isConnected = false;
        console.log('[MongoDB] Connection state: Disconnected');
    });
};

const getStatus = () => {
    return {
        connected: isConnected && mongoose.connection.readyState === 1,
        readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        database: mongoose.connection.name || null,
        host: mongoose.connection.host || null,
        port: mongoose.connection.port || null,
        error: connectionError,
        uriConfigured: !!process.env.MONGODB_URI
    };
};

module.exports = { connectDB, getStatus };
