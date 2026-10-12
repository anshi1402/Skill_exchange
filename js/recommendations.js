/**
 * Community Skill Exchange - Smart Recommendations Engine
 * Generates rule-based recommendations for:
 * - Partner matches
 * - Complementary skills
 * - Target activities & next steps
 * - Goal templates
 */

const RecommendationsEngine = {
    // Complementary skill mappings
    SKILL_GRAPH: {
        'Python': ['FastAPI', 'Data Science', 'Machine Learning', 'Automation', 'Django'],
        'JavaScript': ['React', 'Node.js', 'TypeScript', 'Next.js', 'Web Animations'],
        'React': ['TypeScript', 'Next.js', 'Tailwind CSS', 'Redux / Zustand', 'GraphQL'],
        'UI/UX Design': ['Figma', 'Design Systems', 'Micro-interactions', 'User Research', 'Wireframing'],
        'Graphic Design': ['Photoshop', 'Typography Pairing', 'Color Theory', 'Illustrator', 'Visual Branding'],
        'Public Speaking': ['Storytelling', 'Executive Presentation', 'Vocal Modulation', 'Leadership'],
        'Video Editing': ['DaVinci Resolve', 'Color Grading', 'Sound Design', 'Motion Graphics', 'Short-form Content'],
        'Digital Marketing': ['SEO', 'Google Analytics 4', 'Conversion Optimization', 'Performance Ads'],
        'Data Science': ['Machine Learning', 'Statistical Testing', 'SQL', 'Tableau', 'Deep Learning'],
        'Figma': ['Design Tokens', 'Interactive Prototyping', 'Auto-Layout 5.0', 'Design Handoff']
    },

    /**
     * Get recommended learning partners
     */
    getPartnerRecommendations(userId, limit = 4) {
        const currentUser = Storage.getById(STORAGE_KEYS.USERS, userId);
        if (!currentUser) return [];

        const ranked = MatchingEngine.getRankedPartners(userId);
        return ranked.slice(0, limit);
    },

    /**
     * Get complementary skill recommendations
     */
    getSkillRecommendations(userId, limit = 6) {
        const skills = Storage.getUserSkills(userId);
        const existingSkillNames = new Set(skills.map(s => (s.name || '').toLowerCase().trim()));
        const recommendations = [];

        skills.forEach(skill => {
            const related = this.SKILL_GRAPH[skill.name] || [];
            related.forEach(rel => {
                if (!existingSkillNames.has(rel.toLowerCase()) && !recommendations.some(r => r.name.toLowerCase() === rel.toLowerCase())) {
                    recommendations.push({
                        name: rel,
                        category: skill.category || 'General',
                        basedOn: skill.name,
                        reason: `Because you have experience or interest in ${skill.name}, learning ${rel} unlocks powerful cross-functional capabilities.`
                    });
                }
            });
        });

        // If not enough, fill with popular skills
        if (recommendations.length < limit) {
            POPULAR_SKILLS.forEach(ps => {
                if (!existingSkillNames.has(ps.name.toLowerCase()) && !recommendations.some(r => r.name.toLowerCase() === ps.name.toLowerCase())) {
                    recommendations.push({
                        name: ps.name,
                        category: ps.category,
                        basedOn: 'Trending in Community',
                        reason: `Top trending skill in high demand across the community skill exchange network.`
                    });
                }
            });
        }

        return recommendations.slice(0, limit);
    },

    /**
     * Get recommended immediate next action items
     */
    getActivityRecommendations(userId) {
        const user = Storage.getById(STORAGE_KEYS.USERS, userId);
        const streak = AnalyticsEngine.calculateCurrentStreak(userId);
        const goals = Storage.getUserGoals(userId);
        const connections = Storage.getUserConnections(userId);
        const items = [];

        // Streak maintenance action
        items.push({
            type: 'streak',
            title: `Keep Your ${streak}-Day Streak Alive`,
            description: `Record a quick 30-minute practice or learning session today to push your streak forward.`,
            actionType: 'start_timer',
            buttonText: 'Start Learning Timer'
        });

        // Top goal milestone action
        const activeGoal = goals.find(g => g.status === 'In Progress' && g.progress < 100);
        if (activeGoal) {
            const incompleteMilestone = (activeGoal.milestones || []).find(m => !m.completed);
            const milestoneText = incompleteMilestone ? incompleteMilestone.text : 'next step';
            items.push({
                type: 'goal',
                title: `Progress Goal: ${activeGoal.title}`,
                description: `Focus on completing: "${milestoneText}" to advance to the next mastery milestone.`,
                actionType: 'view_goals',
                buttonText: 'View Goal Checklist'
            });
        }

        // Connect with top match
        const topPartners = this.getPartnerRecommendations(userId, 1);
        if (topPartners.length > 0 && topPartners[0].score >= 80) {
            const p = topPartners[0].otherUser;
            items.push({
                type: 'partner',
                title: `Exchange with ${p.name} (${topPartners[0].score}% Match)`,
                description: `${p.name} can teach you ${topPartners[0].learningOpportunities.join(', ')} while learning ${topPartners[0].teachingOpportunities.join(', ')} from you.`,
                actionType: 'connect_partner',
                targetUserId: p.id,
                buttonText: 'Exchange Skills'
            });
        }

        return items;
    },

    /**
     * Recommended goal templates
     */
    getGoalTemplates() {
        return [
            {
                title: 'Full-Stack JavaScript & API Architecture',
                skill: 'JavaScript',
                category: 'Programming',
                targetProficiency: 'Advanced',
                targetDate: '2026-12-31',
                priority: 'High',
                description: 'Build complete client-side single page applications with asynchronous state management and LocalStorage.',
                milestones: [
                    'Master ES6+ Destructuring, Spread, and Modules',
                    'Asynchronous Programming with Async/Await and Promises',
                    'Single Page Application Router & State Architecture',
                    'Deploy Interactive Web App with Local Storage'
                ]
            },
            {
                title: 'Modern UI/UX Design System in Figma',
                skill: 'UI/UX Design',
                category: 'Design',
                targetProficiency: 'Advanced',
                targetDate: '2026-11-30',
                priority: 'High',
                description: 'Design comprehensive SaaS design system with dark/light themes, typography scales, and tokenized variables.',
                milestones: [
                    'Visual Hierarchy & Accessibility Contrast Standards',
                    'Figma Auto-Layout & Component Variants',
                    'Tokenized Color & Spacing Variables',
                    'High-Fidelity Interactive Mobile & Desktop Prototypes'
                ]
            },
            {
                title: 'Confident Technical Presentation & Storytelling',
                skill: 'Public Speaking',
                category: 'Communication',
                targetProficiency: 'Intermediate',
                targetDate: '2026-12-15',
                priority: 'Medium',
                description: 'Learn executive slide structuring, vocal modulation, and deliver 3 engaging lightning talks.',
                milestones: [
                    'Master Hook and Storytelling Frameworks',
                    'Slide Design Principles & Visual Hierarchy',
                    'Vocal Modulation & Body Language Practice',
                    'Deliver Live Peer Demo Presentation'
                ]
            },
            {
                title: 'Practical Machine Learning with Scikit-Learn',
                skill: 'Machine Learning',
                category: 'Data & AI',
                targetProficiency: 'Advanced',
                targetDate: '2026-12-25',
                priority: 'High',
                description: 'Implement end-to-end data preparation, regression, classification, and model evaluation pipelines.',
                milestones: [
                    'Data Cleaning & Feature Engineering with Pandas',
                    'Supervised Regression & Classification Models',
                    'Model Cross-Validation & Metric Tuning',
                    'Deploy Predictive Workflow Script'
                ]
            }
        ];
    }
};

window.RecommendationsEngine = RecommendationsEngine;
