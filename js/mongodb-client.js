/**
 * Community Skill Exchange - MongoDB Client Bridge
 * Handles synchronization between browser LocalStorage and MongoDB backend.
 */

const MongoDBClient = {
    connected: false,
    checking: false,
    dbDetails: null,

    getApiUrl(path) {
        // If accessed through a different port (e.g. VS Code Live Server on 5500), proxy to 5000
        if (window.location.protocol.startsWith('http')) {
            if (window.location.port && window.location.port !== '5000' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                return `http://localhost:5000${path}`;
            }
        }
        return path;
    },

    async init() {
        await this.checkStatus();
        this.renderStatusBadge();
        
        // Auto-check periodically in background
        setInterval(async () => {
            const prev = this.connected;
            await this.checkStatus();
            if (prev !== this.connected) {
                this.renderStatusBadge();
            }
        }, 12000);

        if (this.connected) {
            console.log('[MongoDB Bridge] Backend is active. Ready to sync.');
        }
    },

    async checkStatus() {
        this.checking = true;
        try {
            const res = await fetch(this.getApiUrl('/api/status'), { method: 'GET' });
            if (res.ok) {
                const data = await res.json();
                this.connected = !!data.connected;
                this.dbDetails = data;
            } else {
                this.connected = false;
            }
        } catch (e) {
            this.connected = false;
        } finally {
            this.checking = false;
        }
        return this.connected;
    },

    renderStatusBadge() {
        // Removed from UI per user request
        const b1 = document.getElementById('mongodb-status-badge');
        if (b1) b1.remove();
        const b2 = document.getElementById('landing-mongodb-status-badge');
        if (b2) b2.remove();
        const modal = document.getElementById('mongo-sync-modal');
        if (modal) modal.remove();
    },

    async pushToMongoDB() {
        if (!this.connected) {
            await this.checkStatus();
            if (!this.connected) {
                if (typeof Utils !== 'undefined') {
                    Utils.showToast('MongoDB is not currently connected to the server', 'warning');
                }
                return false;
            }
        }

        try {
            const payload = {
                users: Storage.getCollection(STORAGE_KEYS.USERS),
                skills: Storage.getCollection(STORAGE_KEYS.SKILLS),
                goals: Storage.getCollection(STORAGE_KEYS.GOALS),
                activities: Storage.getCollection(STORAGE_KEYS.ACTIVITIES),
                connections: Storage.getCollection(STORAGE_KEYS.CONNECTIONS),
                achievements: Storage.getCollection(STORAGE_KEYS.ACHIEVEMENTS),
                notifications: Storage.getCollection(STORAGE_KEYS.NOTIFICATIONS)
            };

            const res = await fetch(this.getApiUrl('/api/sync/push'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (result.success) {
                if (typeof Utils !== 'undefined') {
                    Utils.showToast('Successfully synced data to MongoDB!', 'success');
                }
                return true;
            } else {
                throw new Error(result.message || 'Sync failed');
            }
        } catch (err) {
            console.error('[MongoDB Bridge] Push error:', err);
            if (typeof Utils !== 'undefined') {
                Utils.showToast(`Sync error: ${err.message}`, 'error');
            }
            return false;
        }
    },

    async pullFromMongoDB() {
        if (!this.connected) {
            await this.checkStatus();
            if (!this.connected) {
                if (typeof Utils !== 'undefined') {
                    Utils.showToast('MongoDB is not currently connected to the server', 'warning');
                }
                return false;
            }
        }

        try {
            const res = await fetch(this.getApiUrl('/api/sync/pull'));
            const result = await res.json();
            if (result.success && result.data) {
                const data = result.data;
                if (data.users?.length) Storage.set(STORAGE_KEYS.USERS, data.users);
                if (data.skills?.length) Storage.set(STORAGE_KEYS.SKILLS, data.skills);
                if (data.goals?.length) Storage.set(STORAGE_KEYS.GOALS, data.goals);
                if (data.activities?.length) Storage.set(STORAGE_KEYS.ACTIVITIES, data.activities);
                if (data.connections?.length) Storage.set(STORAGE_KEYS.CONNECTIONS, data.connections);
                if (data.achievements?.length) Storage.set(STORAGE_KEYS.ACHIEVEMENTS, data.achievements);
                if (data.notifications?.length) Storage.set(STORAGE_KEYS.NOTIFICATIONS, data.notifications);

                if (typeof Utils !== 'undefined') {
                    Utils.showToast('Successfully pulled latest data from MongoDB!', 'success');
                }
                // Refresh app state
                if (typeof App !== 'undefined') {
                    App.init();
                }
                return true;
            }
        } catch (err) {
            console.error('[MongoDB Bridge] Pull error:', err);
            if (typeof Utils !== 'undefined') {
                Utils.showToast(`Pull error: ${err.message}`, 'error');
            }
            return false;
        }
    },

    showSyncModal() {
        // Modal box removed from UI per user request
        const existing = document.getElementById('mongo-sync-modal');
        if (existing) existing.remove();
    }
};

window.MongoDBClient = MongoDBClient;
document.addEventListener('DOMContentLoaded', () => {
    MongoDBClient.init();
});
