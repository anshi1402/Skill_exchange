/**
 * Community Skill Exchange - Achievements Engine
 * Manages 10 predefined achievement badges, calculates exact user progress,
 * detects new unlocks, creates notifications, and triggers celebration feedback.
 */

const ACHIEVEMENTS_CATALOG = [
    {
        id: 'first_step',
        title: 'First Step',
        description: 'Complete your first learning session.',
        icon: 'footprints',
        target: 1,
        unit: 'session',
        calculateProgress(userId) {
            const activities = Storage.getUserActivities(userId);
            const count = activities.filter(a => a.type === 'Learning Session' || a.type === 'Practice Session' || a.type === 'Project Work').length;
            return { current: count, target: 1, unlocked: count >= 1 };
        }
    },
    {
        id: 'skill_builder',
        title: 'Skill Builder',
        description: 'Add at least 5 skills (teaching or learning) to your profile.',
        icon: 'layers',
        target: 5,
        unit: 'skills',
        calculateProgress(userId) {
            const skills = Storage.getUserSkills(userId);
            const count = skills.length;
            return { current: count, target: 5, unlocked: count >= 5 };
        }
    },
    {
        id: 'knowledge_sharer',
        title: 'Knowledge Sharer',
        description: 'Complete your first teaching or knowledge-sharing session.',
        icon: 'share-2',
        target: 1,
        unit: 'session',
        calculateProgress(userId) {
            const activities = Storage.getUserActivities(userId);
            const count = activities.filter(a => a.type === 'Teaching Session' || a.type === 'Knowledge Sharing').length;
            return { current: count, target: 1, unlocked: count >= 1 };
        }
    },
    {
        id: 'consistent_learner',
        title: 'Consistent Learner',
        description: 'Maintain a 7-day learning streak.',
        icon: 'flame',
        target: 7,
        unit: 'days',
        calculateProgress(userId) {
            const streak = AnalyticsEngine.calculateCurrentStreak(userId);
            return { current: streak, target: 7, unlocked: streak >= 7 };
        }
    },
    {
        id: 'dedicated_learner',
        title: 'Dedicated Learner',
        description: 'Maintain a 30-day learning streak.',
        icon: 'zap',
        target: 30,
        unit: 'days',
        calculateProgress(userId) {
            const streak = Math.max(
                AnalyticsEngine.calculateCurrentStreak(userId),
                AnalyticsEngine.calculateLongestStreak(userId)
            );
            return { current: streak, target: 30, unlocked: streak >= 30 };
        }
    },
    {
        id: 'goal_crusher',
        title: 'Goal Crusher',
        description: 'Complete your first learning goal.',
        icon: 'check-circle-2',
        target: 1,
        unit: 'goal',
        calculateProgress(userId) {
            const goals = Storage.getUserGoals(userId);
            const completedCount = goals.filter(g => g.status === 'Completed' || g.progress === 100).length;
            return { current: completedCount, target: 1, unlocked: completedCount >= 1 };
        }
    },
    {
        id: 'skill_explorer',
        title: 'Skill Explorer',
        description: 'Add and actively learn 5 different skills.',
        icon: 'compass',
        target: 5,
        unit: 'skills',
        calculateProgress(userId) {
            const skills = Storage.getUserSkills(userId).filter(s => s.type === 'learn');
            const uniqueSkills = new Set(skills.map(s => (s.name || '').toLowerCase().trim()));
            return { current: uniqueSkills.size, target: 5, unlocked: uniqueSkills.size >= 5 };
        }
    },
    {
        id: 'community_contributor',
        title: 'Community Contributor',
        description: 'Complete 10 knowledge-sharing or teaching sessions.',
        icon: 'award',
        target: 10,
        unit: 'sessions',
        calculateProgress(userId) {
            const activities = Storage.getUserActivities(userId);
            const count = activities.filter(a => a.type === 'Teaching Session' || a.type === 'Knowledge Sharing').length;
            return { current: count, target: 10, unlocked: count >= 10 };
        }
    },
    {
        id: 'rising_expert',
        title: 'Rising Expert',
        description: 'Reach Advanced or Expert proficiency in a skill you teach.',
        icon: 'trending-up',
        target: 1,
        unit: 'expert skill',
        calculateProgress(userId) {
            const skills = Storage.getUserSkills(userId).filter(s => s.type === 'teach');
            const count = skills.filter(s => {
                const prof = (s.proficiency || '').toLowerCase();
                return prof === 'advanced' || prof === 'expert';
            }).length;
            return { current: count, target: 1, unlocked: count >= 1 };
        }
    },
    {
        id: 'learning_champion',
        title: 'Learning Champion',
        description: 'Complete 10 learning goals.',
        icon: 'trophy',
        target: 10,
        unit: 'goals',
        calculateProgress(userId) {
            const goals = Storage.getUserGoals(userId);
            const completedCount = goals.filter(g => g.status === 'Completed' || g.progress === 100).length;
            return { current: completedCount, target: 10, unlocked: completedCount >= 10 };
        }
    }
];

const AchievementsEngine = {
    /**
     * Evaluates all achievements for a given user, updates stored state, and triggers notices on new unlocks.
     * @param {string} userId
     * @param {boolean} notifyUser - Whether to show toast notifications for newly unlocked achievements
     * @returns {Array} List of achievement states with progress
     */
    evaluateAll(userId, notifyUser = false) {
        if (!userId) return [];

        const existingStored = Storage.getUserAchievements(userId);
        const results = [];
        const newUnlocks = [];

        ACHIEVEMENTS_CATALOG.forEach(badge => {
            const progress = badge.calculateProgress(userId);
            const wasUnlocked = existingStored.some(a => a.badgeId === badge.id && a.unlocked);

            const isNowUnlocked = progress.unlocked;
            const record = {
                id: `ach_${userId}_${badge.id}`,
                userId,
                badgeId: badge.id,
                title: badge.title,
                description: badge.description,
                icon: badge.icon,
                current: progress.current,
                target: badge.target,
                unit: badge.unit,
                percentage: Math.min(100, Math.round((progress.current / badge.target) * 100)),
                unlocked: isNowUnlocked,
                unlockedAt: isNowUnlocked ? (wasUnlocked ? (existingStored.find(a => a.badgeId === badge.id)?.unlockedAt || new Date().toISOString()) : new Date().toISOString()) : null
            };

            Storage.saveItem(STORAGE_KEYS.ACHIEVEMENTS, record);
            results.push(record);

            if (!wasUnlocked && isNowUnlocked) {
                newUnlocks.push(record);
            }
        });

        // Trigger notifications if new achievements were unlocked
        if (notifyUser && newUnlocks.length > 0) {
            newUnlocks.forEach(unlockedBadge => {
                // Add notification
                Storage.saveItem(STORAGE_KEYS.NOTIFICATIONS, {
                    userId,
                    type: 'achievement',
                    title: `🏆 Achievement Unlocked: ${unlockedBadge.title}!`,
                    message: unlockedBadge.description,
                    read: false,
                    actionUrl: 'achievements'
                });

                if (window.Utils && window.Utils.showToast) {
                    window.Utils.showToast(`🏆 Achievement Unlocked: ${unlockedBadge.title}!`, 'success');
                }
            });
        }

        return results;
    },

    /**
     * Returns the list of all achievement records with progress for UI rendering.
     * @param {string} userId
     * @returns {Array}
     */
    getUserAchievementsList(userId) {
        return this.evaluateAll(userId, false);
    }
};

window.ACHIEVEMENTS_CATALOG = ACHIEVEMENTS_CATALOG;
window.AchievementsEngine = AchievementsEngine;
window.checkAchievements = (userId) => AchievementsEngine.evaluateAll(userId, true);
