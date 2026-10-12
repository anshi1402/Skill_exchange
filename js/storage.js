/**
 * Community Skill Exchange - LocalStorage Management Layer
 * Handles persistent storage, CRUD operations, data export/import, and demo reset.
 */

const STORAGE_KEYS = {
    USERS: 'cse_users',
    CURRENT_USER_ID: 'cse_current_user',
    PROFILES: 'cse_profiles',
    SKILLS: 'cse_skills',
    GOALS: 'cse_learning_goals',
    MILESTONES: 'cse_milestones',
    ACTIVITIES: 'cse_learning_activities',
    CONNECTIONS: 'cse_connections',
    ACHIEVEMENTS: 'cse_achievements',
    NOTIFICATIONS: 'cse_notifications',
    PREFERENCES: 'cse_preferences',
    SETTINGS: 'cse_settings'
};

const Storage = {
    // Check if LocalStorage is available
    isAvailable() {
        try {
            const testKey = '__cse_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.error('LocalStorage is not available:', e);
            return false;
        }
    },

    // Raw get
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`Error reading ${key} from LocalStorage:`, e);
            return defaultValue;
        }
    },

    // Raw set
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Error saving ${key} to LocalStorage:`, e);
            return false;
        }
    },

    // Remove key
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`Error removing ${key} from LocalStorage:`, e);
            return false;
        }
    },

    // Get all records in a collection
    getCollection(key) {
        return this.get(key, []);
    },

    // Get item by ID in a collection
    getById(key, id) {
        const collection = this.getCollection(key);
        return collection.find(item => item.id === id) || null;
    },

    // Save or update an item in a collection
    saveItem(key, item) {
        const collection = this.getCollection(key);
        const index = collection.findIndex(existing => existing.id === item.id);
        
        if (index >= 0) {
            collection[index] = { ...collection[index], ...item, updatedAt: new Date().toISOString() };
        } else {
            if (!item.id) {
                item.id = this.generateId(key);
            }
            if (!item.createdAt) {
                item.createdAt = new Date().toISOString();
            }
            collection.push(item);
        }

        this.set(key, collection);
        return item;
    },

    // Delete an item by ID from a collection
    deleteItem(key, id) {
        let collection = this.getCollection(key);
        const initialLength = collection.length;
        collection = collection.filter(item => item.id !== id);
        this.set(key, collection);
        return collection.length < initialLength;
    },

    // Helper ID generator
    generateId(prefix = 'item') {
        const cleanPrefix = prefix.replace('cse_', '').replace(/s$/, '');
        return `${cleanPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    },

    // Current User Helpers
    getCurrentUserId() {
        return this.get(STORAGE_KEYS.CURRENT_USER_ID, null);
    },

    setCurrentUserId(userId) {
        return this.set(STORAGE_KEYS.CURRENT_USER_ID, userId);
    },

    getCurrentUser() {
        const userId = this.getCurrentUserId();
        if (!userId) return null;
        return this.getById(STORAGE_KEYS.USERS, userId);
    },

    // Get all data associated with current user
    getUserSkills(userId) {
        const allSkills = this.getCollection(STORAGE_KEYS.SKILLS);
        return allSkills.filter(s => s.userId === userId);
    },

    getUserGoals(userId) {
        const allGoals = this.getCollection(STORAGE_KEYS.GOALS);
        return allGoals.filter(g => g.userId === userId);
    },

    getUserActivities(userId) {
        const allActivities = this.getCollection(STORAGE_KEYS.ACTIVITIES);
        return allActivities.filter(a => a.userId === userId)
            .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    },

    getUserConnections(userId) {
        const allConnections = this.getCollection(STORAGE_KEYS.CONNECTIONS);
        return allConnections.filter(c => c.senderId === userId || c.receiverId === userId);
    },

    getUserNotifications(userId) {
        const allNotifications = this.getCollection(STORAGE_KEYS.NOTIFICATIONS);
        return allNotifications.filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getUserAchievements(userId) {
        const allAchievements = this.getCollection(STORAGE_KEYS.ACHIEVEMENTS);
        return allAchievements.filter(a => a.userId === userId);
    },

    getPreferences() {
        return this.get(STORAGE_KEYS.PREFERENCES, {
            theme: 'light',
            notifications: {
                connections: true,
                goals: true,
                achievements: true,
                recommendations: true
            }
        });
    },

    savePreferences(prefs) {
        const current = this.getPreferences();
        const updated = { ...current, ...prefs };
        this.set(STORAGE_KEYS.PREFERENCES, updated);
        return updated;
    },

    // Export entire application state
    exportFullData() {
        const data = {};
        Object.values(STORAGE_KEYS).forEach(key => {
            data[key] = this.get(key, null);
        });
        data.exportTimestamp = new Date().toISOString();
        data.version = '1.0.0';
        return JSON.stringify(data, null, 2);
    },

    // Export specific user data as JSON
    exportUserData(userId) {
        const user = this.getById(STORAGE_KEYS.USERS, userId);
        if (!user) return null;

        const data = {
            user,
            skills: this.getUserSkills(userId),
            goals: this.getUserGoals(userId),
            activities: this.getUserActivities(userId),
            connections: this.getUserConnections(userId),
            achievements: this.getUserAchievements(userId),
            notifications: this.getUserNotifications(userId),
            preferences: this.getPreferences(),
            exportTimestamp: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },

    // Export collection as CSV
    exportToCSV(collectionName, items) {
        if (!items || items.length === 0) return '';
        
        // Extract headers from first item keys
        const headers = Object.keys(items[0]).filter(k => typeof items[0][k] !== 'object');
        const csvRows = [];
        csvRows.push(headers.join(','));

        for (const item of items) {
            const values = headers.map(header => {
                let val = item[header] ?? '';
                if (typeof val === 'string') {
                    val = `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    },

    // Import and validate JSON
    importData(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Invalid JSON format.');
            }

            // Check if full backup or user export
            if (parsed[STORAGE_KEYS.USERS]) {
                // Full backup
                Object.values(STORAGE_KEYS).forEach(key => {
                    if (parsed[key] !== undefined) {
                        this.set(key, parsed[key]);
                    }
                });
                return { success: true, type: 'full' };
            } else if (parsed.user && parsed.user.id) {
                // User export format
                this.saveItem(STORAGE_KEYS.USERS, parsed.user);
                this.setCurrentUserId(parsed.user.id);
                
                if (Array.isArray(parsed.skills)) {
                    parsed.skills.forEach(s => this.saveItem(STORAGE_KEYS.SKILLS, s));
                }
                if (Array.isArray(parsed.goals)) {
                    parsed.goals.forEach(g => this.saveItem(STORAGE_KEYS.GOALS, g));
                }
                if (Array.isArray(parsed.activities)) {
                    parsed.activities.forEach(a => this.saveItem(STORAGE_KEYS.ACTIVITIES, a));
                }
                if (Array.isArray(parsed.connections)) {
                    parsed.connections.forEach(c => this.saveItem(STORAGE_KEYS.CONNECTIONS, c));
                }
                if (Array.isArray(parsed.achievements)) {
                    parsed.achievements.forEach(ach => this.saveItem(STORAGE_KEYS.ACHIEVEMENTS, ach));
                }
                if (Array.isArray(parsed.notifications)) {
                    parsed.notifications.forEach(n => this.saveItem(STORAGE_KEYS.NOTIFICATIONS, n));
                }
                if (parsed.preferences) {
                    this.savePreferences(parsed.preferences);
                }
                return { success: true, type: 'user' };
            } else {
                throw new Error('Unrecognized CSE backup structure.');
            }
        } catch (e) {
            console.error('Import failed:', e);
            return { success: false, error: e.message };
        }
    },

    // Clear all CSE data
    clearAllData() {
        Object.values(STORAGE_KEYS).forEach(key => {
            this.remove(key);
        });
    }
};

window.STORAGE_KEYS = STORAGE_KEYS;
window.Storage = Storage;
