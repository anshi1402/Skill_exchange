/**
 * Community Skill Exchange - Skill Matching Engine
 * Implements compatibility scoring (0-100) between learners and teachers based on:
 * - Mutual teaching and learning needs (+40 / +40)
 * - Shared interests (+10)
 * - Compatible goals (+5)
 * - Compatible proficiency (+5)
 */

const MatchingEngine = {
    /**
     * Calculates the skill exchange compatibility score between two users.
     * @param {Object} currentUser - Current logged-in user object
     * @param {Object} otherUser - Partner user object to evaluate
     * @returns {Object} Match details and score breakdown
     */
    calculateMatchScore(currentUser, otherUser) {
        if (!currentUser || !otherUser || currentUser.id === otherUser.id) {
            return {
                score: 0,
                level: 'None',
                tagline: 'Self or Invalid',
                teachingOpportunities: [],
                learningOpportunities: [],
                mutualSkills: [],
                sharedInterests: [],
                otherUser: otherUser || null
            };
        }

        const allSkills = Storage.getCollection(STORAGE_KEYS.SKILLS);
        const mySkills = allSkills.filter(s => s.userId === currentUser.id);
        const otherSkills = allSkills.filter(s => s.userId === otherUser.id);

        const myTeaching = mySkills.filter(s => s.type === 'teach');
        const myLearning = mySkills.filter(s => s.type === 'learn');

        const otherTeaching = otherSkills.filter(s => s.type === 'teach');
        const otherLearning = otherSkills.filter(s => s.type === 'learn');

        // Normalize string comparison
        const norm = str => (str || '').trim().toLowerCase();

        // 1. Current user can teach what other user wants to learn (up to 40 points)
        const teachingOpportunities = [];
        let teachScore = 0;
        myTeaching.forEach(tSkill => {
            const match = otherLearning.find(lSkill => norm(lSkill.name) === norm(tSkill.name));
            if (match) {
                teachingOpportunities.push(tSkill.name);
            }
        });
        if (teachingOpportunities.length > 0) {
            teachScore = Math.min(40, 25 + (teachingOpportunities.length - 1) * 15);
        }

        // 2. Other user can teach what current user wants to learn (up to 40 points)
        const learningOpportunities = [];
        let learnScore = 0;
        otherTeaching.forEach(tSkill => {
            const match = myLearning.find(lSkill => norm(lSkill.name) === norm(tSkill.name));
            if (match) {
                learningOpportunities.push(tSkill.name);
            }
        });
        if (learningOpportunities.length > 0) {
            learnScore = Math.min(40, 25 + (learningOpportunities.length - 1) * 15);
        }

        // Mutual skill pairs
        const mutualSkills = [];
        teachingOpportunities.forEach(t => {
            learningOpportunities.forEach(l => {
                mutualSkills.push({ teach: t, learn: l });
            });
        });

        // 3. Shared interests (up to 10 points)
        const myInterests = (currentUser.interests || []).map(norm);
        const otherInterests = (otherUser.interests || []).map(norm);
        const rawOtherInterests = otherUser.interests || [];
        
        const sharedInterests = rawOtherInterests.filter(i => myInterests.includes(norm(i)));
        let interestScore = 0;
        if (sharedInterests.length > 0) {
            interestScore = Math.min(10, sharedInterests.length * 5);
        }

        // 4. Compatible learning goals (up to 5 points)
        const allGoals = Storage.getCollection(STORAGE_KEYS.GOALS);
        const myGoals = allGoals.filter(g => g.userId === currentUser.id);
        const otherGoals = allGoals.filter(g => g.userId === otherUser.id);
        
        let goalScore = 0;
        const matchingGoals = myGoals.filter(mg => 
            otherTeaching.some(ot => norm(ot.name) === norm(mg.skill)) ||
            otherGoals.some(og => norm(og.skill) === norm(mg.skill))
        );
        if (matchingGoals.length > 0) {
            goalScore = 5;
        }

        // 5. Compatible proficiency (up to 5 points)
        // Checks if the teacher is Advanced/Expert for what learner is Beginner/Intermediate
        let proficiencyScore = 0;
        const advancedLevels = ['advanced', 'expert'];
        const hasCompatibleProficiency = otherTeaching.some(ot => 
            learningOpportunities.some(l => norm(l) === norm(ot.name)) &&
            advancedLevels.includes(norm(ot.proficiency))
        ) || myTeaching.some(mt => 
            teachingOpportunities.some(t => norm(t) === norm(mt.name)) &&
            advancedLevels.includes(norm(mt.proficiency))
        );

        if (hasCompatibleProficiency && (teachingOpportunities.length > 0 || learningOpportunities.length > 0)) {
            proficiencyScore = 5;
        }

        // Calculate total score
        let totalScore = teachScore + learnScore + interestScore + goalScore + proficiencyScore;
        totalScore = Math.min(100, Math.max(0, totalScore));

        // Assign qualitative match level and descriptive tagline
        let level = 'Potential';
        let tagline = 'Good potential for learning';

        if (totalScore >= 80) {
            level = 'Perfect';
            tagline = 'Excellent Mutual Skill Exchange';
        } else if (totalScore >= 50) {
            level = 'Strong';
            tagline = 'Strong Skill Exchange Opportunity';
        } else if (totalScore >= 20) {
            level = 'Potential';
            tagline = 'Complementary Learning Interests';
        } else {
            level = 'Low';
            tagline = 'Explore General Collaboration';
        }

        return {
            score: totalScore,
            level,
            tagline,
            breakdown: {
                teachScore,
                learnScore,
                interestScore,
                goalScore,
                proficiencyScore
            },
            teachingOpportunities: [...new Set(teachingOpportunities)],
            learningOpportunities: [...new Set(learningOpportunities)],
            mutualSkills,
            sharedInterests: [...new Set(sharedInterests)],
            otherUser
        };
    },

    /**
     * Returns all potential partners ranked by match score.
     * @param {string} currentUserId
     * @param {Object} filters
     * @returns {Array} Array of match result objects
     */
    getRankedPartners(currentUserId, filters = {}) {
        const currentUser = Storage.getById(STORAGE_KEYS.USERS, currentUserId);
        if (!currentUser) return [];

        const allUsers = Storage.getCollection(STORAGE_KEYS.USERS).filter(u => u.id !== currentUserId);
        
        let matches = allUsers.map(user => this.calculateMatchScore(currentUser, user));

        // Apply filters if provided
        if (filters.userType && filters.userType !== 'all') {
            matches = matches.filter(m => m.otherUser.userType === filters.userType);
        }

        if (filters.availability && filters.availability !== 'all') {
            matches = matches.filter(m => (m.otherUser.availability || 'Available') === filters.availability);
        }

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            matches = matches.filter(m => {
                const name = (m.otherUser.name || '').toLowerCase();
                const bio = (m.otherUser.bio || '').toLowerCase();
                const teaches = m.teachingOpportunities.join(' ').toLowerCase();
                const learns = m.learningOpportunities.join(' ').toLowerCase();
                const interests = (m.otherUser.interests || []).join(' ').toLowerCase();
                return name.includes(query) || bio.includes(query) || teaches.includes(query) || learns.includes(query) || interests.includes(query);
            });
        }

        // Sorting
        const sortBy = filters.sortBy || 'highest_match';
        if (sortBy === 'highest_match') {
            matches.sort((a, b) => b.score - a.score);
        } else if (sortBy === 'name') {
            matches.sort((a, b) => (a.otherUser.name || '').localeCompare(b.otherUser.name || ''));
        } else if (sortBy === 'recently_active') {
            matches.sort((a, b) => (b.otherUser.joinedDate || '').localeCompare(a.otherUser.joinedDate || ''));
        }

        return matches;
    }
};

window.MatchingEngine = MatchingEngine;
