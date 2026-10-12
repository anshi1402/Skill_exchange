const express = require('express');
const router = express.Router();
const { connectDB, getStatus } = require('../config/db');

const User = require('../models/User');
const Skill = require('../models/Skill');
const Goal = require('../models/Goal');
const Activity = require('../models/Activity');
const Connection = require('../models/Connection');
const Achievement = require('../models/Achievement');
const Notification = require('../models/Notification');

// Middleware to check if MongoDB is connected
const checkDBConnection = async (req, res, next) => {
    let status = getStatus();
    if (!status.connected) {
        try {
            await connectDB();
            status = getStatus();
        } catch (e) {}
    }
    if (!status.connected) {
        return res.status(503).json({
            success: false,
            message: 'MongoDB is currently not connected. Please check your database connection or use local mode.',
            status
        });
    }
    next();
};

// --------------------------------------------------------------------------
// 1. Health & Status
// --------------------------------------------------------------------------
router.get('/status', async (req, res) => {
    let status = getStatus();
    if (!status.connected) {
        try {
            await connectDB();
            status = getStatus();
        } catch (e) {}
    }
    res.json({
        success: true,
        ...status
    });
});

// --------------------------------------------------------------------------
// 2. Users CRUD
// --------------------------------------------------------------------------
router.get('/users', checkDBConnection, async (req, res) => {
    try {
        const users = await User.find().lean();
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/users/:id', checkDBConnection, async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id }).lean();
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/users', checkDBConnection, async (req, res) => {
    try {
        const userData = req.body;
        if (!userData.id) {
            userData.id = `user_${Date.now()}`;
        }
        const user = await User.findOneAndUpdate(
            { id: userData.id },
            { $set: userData },
            { new: true, upsert: true }
        );
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.put('/users/:id', checkDBConnection, async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.delete('/users/:id', checkDBConnection, async (req, res) => {
    try {
        await User.deleteOne({ id: req.params.id });
        // Also cleanup associated records
        await Skill.deleteMany({ userId: req.params.id });
        await Goal.deleteMany({ userId: req.params.id });
        await Activity.deleteMany({ userId: req.params.id });
        res.json({ success: true, message: 'User and associated data removed' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --------------------------------------------------------------------------
// 3. Skills CRUD
// --------------------------------------------------------------------------
router.get('/skills', checkDBConnection, async (req, res) => {
    try {
        const filter = {};
        if (req.query.userId) filter.userId = req.query.userId;
        if (req.query.type) filter.type = req.query.type;
        const skills = await Skill.find(filter).lean();
        res.json({ success: true, count: skills.length, data: skills });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/skills', checkDBConnection, async (req, res) => {
    try {
        const skillData = req.body;
        if (!skillData.id) {
            skillData.id = `skill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        }
        const skill = await Skill.findOneAndUpdate(
            { id: skillData.id },
            { $set: skillData },
            { new: true, upsert: true }
        );
        res.status(201).json({ success: true, data: skill });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.delete('/skills/:id', checkDBConnection, async (req, res) => {
    try {
        await Skill.deleteOne({ id: req.params.id });
        res.json({ success: true, message: 'Skill removed' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --------------------------------------------------------------------------
// 4. Goals CRUD
// --------------------------------------------------------------------------
router.get('/goals', checkDBConnection, async (req, res) => {
    try {
        const filter = {};
        if (req.query.userId) filter.userId = req.query.userId;
        const goals = await Goal.find(filter).lean();
        res.json({ success: true, count: goals.length, data: goals });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/goals', checkDBConnection, async (req, res) => {
    try {
        const goalData = req.body;
        if (!goalData.id) {
            goalData.id = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        }
        const goal = await Goal.findOneAndUpdate(
            { id: goalData.id },
            { $set: goalData },
            { new: true, upsert: true }
        );
        res.status(201).json({ success: true, data: goal });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

router.delete('/goals/:id', checkDBConnection, async (req, res) => {
    try {
        await Goal.deleteOne({ id: req.params.id });
        res.json({ success: true, message: 'Goal removed' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --------------------------------------------------------------------------
// 5. Activities CRUD
// --------------------------------------------------------------------------
router.get('/activities', checkDBConnection, async (req, res) => {
    try {
        const filter = {};
        if (req.query.userId) filter.userId = req.query.userId;
        const activities = await Activity.find(filter).sort({ createdAt: -1 }).lean();
        res.json({ success: true, count: activities.length, data: activities });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/activities', checkDBConnection, async (req, res) => {
    try {
        const actData = req.body;
        if (!actData.id) {
            actData.id = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        }
        const activity = await Activity.findOneAndUpdate(
            { id: actData.id },
            { $set: actData },
            { new: true, upsert: true }
        );
        res.status(201).json({ success: true, data: activity });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// --------------------------------------------------------------------------
// 6. Bulk Sync (Frontend LocalStorage <-> MongoDB)
// --------------------------------------------------------------------------
router.post('/sync/push', checkDBConnection, async (req, res) => {
    try {
        const { users, skills, goals, activities, connections, achievements, notifications } = req.body;
        const results = {};

        if (Array.isArray(users) && users.length > 0) {
            for (const u of users) {
                if (u && u.id) await User.findOneAndUpdate({ id: u.id }, { $set: u }, { upsert: true });
            }
            results.users = users.length;
        }

        if (Array.isArray(skills) && skills.length > 0) {
            for (const s of skills) {
                if (s && s.id) await Skill.findOneAndUpdate({ id: s.id }, { $set: s }, { upsert: true });
            }
            results.skills = skills.length;
        }

        if (Array.isArray(goals) && goals.length > 0) {
            for (const g of goals) {
                if (g && g.id) await Goal.findOneAndUpdate({ id: g.id }, { $set: g }, { upsert: true });
            }
            results.goals = goals.length;
        }

        if (Array.isArray(activities) && activities.length > 0) {
            for (const a of activities) {
                if (a && a.id) await Activity.findOneAndUpdate({ id: a.id }, { $set: a }, { upsert: true });
            }
            results.activities = activities.length;
        }

        if (Array.isArray(connections) && connections.length > 0) {
            for (const c of connections) {
                if (c && c.id) await Connection.findOneAndUpdate({ id: c.id }, { $set: c }, { upsert: true });
            }
            results.connections = connections.length;
        }

        if (Array.isArray(achievements) && achievements.length > 0) {
            for (const ach of achievements) {
                if (ach && ach.id) await Achievement.findOneAndUpdate({ id: ach.id }, { $set: ach }, { upsert: true });
            }
            results.achievements = achievements.length;
        }

        if (Array.isArray(notifications) && notifications.length > 0) {
            for (const n of notifications) {
                if (n && n.id) await Notification.findOneAndUpdate({ id: n.id }, { $set: n }, { upsert: true });
            }
            results.notifications = notifications.length;
        }

        res.json({ success: true, message: 'Sync to MongoDB completed successfully', synced: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/sync/pull', checkDBConnection, async (req, res) => {
    try {
        const [users, skills, goals, activities, connections, achievements, notifications] = await Promise.all([
            User.find().lean(),
            Skill.find().lean(),
            Goal.find().lean(),
            Activity.find().lean(),
            Connection.find().lean(),
            Achievement.find().lean(),
            Notification.find().lean()
        ]);

        res.json({
            success: true,
            data: {
                users,
                skills,
                goals,
                activities,
                connections,
                achievements,
                notifications
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
