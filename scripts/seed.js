const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Goal = require('../models/Goal');

const INITIAL_PEERS = [
    {
        id: 'peer_arav',
        name: 'Aravind Sharma',
        email: 'aravind.sharma@example.com',
        userType: 'Student',
        institution: 'IIT Delhi',
        location: 'New Delhi',
        bio: 'Full-stack engineer building with Python, FastAPI, and React. Looking to master UI/UX design systems in Figma.',
        avatarColor: 'indigo-purple',
        avatarInitial: 'AS',
        joinedDate: '2026-08-14',
        interests: ['Python', 'FastAPI', 'React', 'UI/UX Design', 'Figma'],
        availability: 'Available'
    },
    {
        id: 'peer_priya',
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        userType: 'Professional',
        institution: 'Fintech Solutions Ltd',
        location: 'Bengaluru',
        bio: 'Senior Product Designer with 6+ years creating design systems and accessibility workflows.',
        avatarColor: 'rose-pink',
        avatarInitial: 'PP',
        joinedDate: '2026-07-20',
        interests: ['UI/UX Design', 'Figma', 'Design Systems', 'Python'],
        availability: 'Available'
    },
    {
        id: 'peer_marcus',
        name: 'Marcus Chen',
        email: 'marcus.chen@example.com',
        userType: 'Student',
        institution: 'National University of Singapore',
        location: 'Singapore',
        bio: 'Machine Learning researcher working on LLM fine-tuning and retrieval-augmented generation.',
        avatarColor: 'amber-orange',
        avatarInitial: 'MC',
        joinedDate: '2026-09-01',
        interests: ['Machine Learning', 'Data Science', 'React'],
        availability: 'Weekends'
    }
];

const INITIAL_SKILLS = [
    { id: 'skill_seed_1', userId: 'peer_arav', type: 'teach', name: 'Python', category: 'Programming', proficiency: 'Advanced' },
    { id: 'skill_seed_2', userId: 'peer_arav', type: 'teach', name: 'React', category: 'Programming', proficiency: 'Intermediate' },
    { id: 'skill_seed_3', userId: 'peer_arav', type: 'learn', name: 'UI/UX Design', category: 'Design', proficiency: 'Beginner' },
    { id: 'skill_seed_4', userId: 'peer_priya', type: 'teach', name: 'UI/UX Design', category: 'Design', proficiency: 'Expert' },
    { id: 'skill_seed_5', userId: 'peer_priya', type: 'learn', name: 'Python', category: 'Programming', proficiency: 'Beginner' },
    { id: 'skill_seed_6', userId: 'peer_marcus', type: 'teach', name: 'Machine Learning', category: 'Data & AI', proficiency: 'Advanced' }
];

async function seed() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/community_skill_exchange';
    console.log('[Seed] Connecting to MongoDB Atlas at:', mongoUri);

    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log('[Seed] Connected successfully to:', mongoose.connection.name);

        for (const peer of INITIAL_PEERS) {
            await User.findOneAndUpdate({ id: peer.id }, peer, { upsert: true, new: true });
        }
        console.log(`[Seed] Seeded ${INITIAL_PEERS.length} community peer profiles.`);

        for (const skill of INITIAL_SKILLS) {
            await Skill.findOneAndUpdate({ id: skill.id }, skill, { upsert: true, new: true });
        }
        console.log(`[Seed] Seeded ${INITIAL_SKILLS.length} skills in database.`);

        console.log('[Seed] Database initialization complete ✅');
    } catch (err) {
        console.warn('[Seed] Notice: Could not connect to MongoDB server:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('[Seed] Disconnected.');
    }
}

seed();

