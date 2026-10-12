/**
 * Community Skill Exchange - Master Application Controller
 * Single Page Application (SPA) Router, UI Controllers, Chart Managers, and Event Handlers.
 */

const App = {
    currentUser: null,
    activePage: 'dashboard',
    activeCharts: {},
    timerInterval: null,
    timerSeconds: 0,
    timerRunning: false,

    // Initialize application on load
    init() {
        // 1. Check storage availability
        if (!Storage.isAvailable()) {
            alert('LocalStorage is not accessible. Please enable local storage in your browser.');
            return;
        }

        // 2. Load preferences & apply theme
        const prefs = Storage.getPreferences();
        this.applyTheme(prefs.theme || 'light');
        document.documentElement.removeAttribute('data-palette');

        // Seed community peers so Discovery & Matching have active mentors & learners
        if (typeof loadCommunityData === 'function') {
            loadCommunityData(false);
        }

        // 3. Check session authentication
        // Fresh visits and opening localhost always require signing in on the Login Page
        const sessionUserId = sessionStorage.getItem('cse_active_session');
        if (sessionUserId) {
            this.currentUser = Storage.getById(STORAGE_KEYS.USERS, sessionUserId);
        } else {
            this.currentUser = null;
        }

        // 4. Evaluate achievements if active session exists
        if (this.currentUser) {
            AchievementsEngine.evaluateAll(this.currentUser.id, false);
        }

        // 5. Setup global UI bindings
        this.bindGlobalEvents();

        // 6. Initial View routing: Always show Login/Landing view if not signed in
        if (this.currentUser) {
            this.showAppView();
            this.showPage('dashboard');
        } else {
            this.showLandingView();
        }
    },

    // Apply dark or light theme
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const toggleIcon = document.getElementById('theme-toggle-icon');
        if (toggleIcon) {
            toggleIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
            Utils.renderIcons(document.getElementById('theme-toggle-btn'));
        }
    },

    // Switch theme
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        this.applyTheme(next);
        Storage.savePreferences({ theme: next });
        Utils.showToast(`Switched to ${next} theme`, 'info', 2000);
        
        // Re-render charts for theme adaptation if on analytics/dashboard
        if (this.activePage === 'dashboard' || this.activePage === 'analytics' || this.activePage === 'progress') {
            this.renderCurrentPage();
        }
    },

    // Palette handlers maintained for compatibility
    togglePaletteMenu() {},
    applyColorPalette() {
        document.documentElement.removeAttribute('data-palette');
    },

    // Bind all persistent global listeners
    bindGlobalEvents() {
        // Navigation links
        document.querySelectorAll('[data-page-target]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-page-target');
                this.showPage(target);
                this.closeMobileSidebar();
            });
        });

        // Theme toggle button
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Global search input
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleGlobalSearch(e.target.value));
            searchInput.addEventListener('focus', (e) => this.handleGlobalSearch(e.target.value));
        }

        // Close search dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('search-dropdown');
            const searchContainer = document.querySelector('.search-box-wrapper');
            if (dropdown && searchContainer && !searchContainer.contains(e.target)) {
                dropdown.classList.remove('active');
            }

            // Close user menu dropdown
            const userMenu = document.getElementById('user-dropdown-menu');
            const userBtn = document.getElementById('user-menu-btn');
            if (userMenu && userBtn && !userBtn.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
            }

            // Close notification drawer
            const notifDrawer = document.getElementById('notifications-drawer');
            const notifBtn = document.getElementById('notifications-btn');
            if (notifDrawer && notifBtn && !notifBtn.contains(e.target) && !notifDrawer.contains(e.target)) {
                notifDrawer.classList.remove('active');
            }
        });

        // Mobile sidebar toggle
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const mobileBackdrop = document.getElementById('sidebar-backdrop');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                sidebar.classList.toggle('mobile-open');
                if (mobileBackdrop) mobileBackdrop.classList.toggle('active');
            });
        }
        if (mobileBackdrop) {
            mobileBackdrop.addEventListener('click', () => this.closeMobileSidebar());
        }

        // User dropdown trigger
        const userMenuBtn = document.getElementById('user-menu-btn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', () => {
                const menu = document.getElementById('user-dropdown-menu');
                if (menu) menu.classList.toggle('active');
            });
        }

        // Notifications trigger
        const notifBtn = document.getElementById('notifications-btn');
        if (notifBtn) {
            notifBtn.addEventListener('click', () => {
                const drawer = document.getElementById('notifications-drawer');
                if (drawer) {
                    drawer.classList.toggle('active');
                    this.renderNotificationsList();
                }
            });
        }
    },

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mobileBackdrop = document.getElementById('sidebar-backdrop');
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (mobileBackdrop) mobileBackdrop.classList.remove('active');
    },

    // Show landing page
    showLandingView() {
        document.getElementById('landing-view').style.display = 'block';
        document.getElementById('app-view').style.display = 'none';
        this.renderLandingPage();
    },

    // Show main application shell
    showAppView() {
        document.getElementById('landing-view').style.display = 'none';
        document.getElementById('app-view').style.display = 'flex';
        this.updateHeaderUI();
    },

    // Update Header indicators
    updateHeaderUI() {
        if (!this.currentUser) return;

        // User profile avatar & name
        const userNameEl = document.getElementById('header-user-name');
        const userRoleEl = document.getElementById('header-user-role');
        const userAvatarEl = document.getElementById('header-user-avatar');

        if (userNameEl) userNameEl.textContent = this.currentUser.name;
        if (userRoleEl) userRoleEl.textContent = this.currentUser.userType;
        if (userAvatarEl) userAvatarEl.innerHTML = Utils.getAvatarHTML(this.currentUser, 'sm');

        // Streak count & label
        const streak = AnalyticsEngine.calculateCurrentStreak(this.currentUser.id);
        const streakCountEl = document.getElementById('header-streak-count');
        if (streakCountEl) streakCountEl.textContent = `${streak} Days`;

        // Notification count badge
        const notifs = Storage.getUserNotifications(this.currentUser.id);
        const unreadCount = notifs.filter(n => !n.read).length;
        const notifBadge = document.getElementById('header-notif-badge');
        if (notifBadge) {
            notifBadge.textContent = unreadCount;
            notifBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }

        Utils.renderIcons(document.getElementById('top-header'));
    },

    // SPA Router - Show Target Page
    showPage(pageId) {
        if (!this.currentUser) {
            this.showLandingView();
            return;
        }

        this.activePage = pageId;

        // Destroy previous charts before page transition
        this.destroyCharts();

        // Update active sidebar nav
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-page-target') === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Set page title
        const pageTitle = pageId.charAt(0).toUpperCase() + pageId.slice(1);
        document.title = `${pageTitle} | Community Skill Exchange`;

        // Render page content
        this.renderCurrentPage();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Destroy active Chart.js instances
    destroyCharts() {
        Object.keys(this.activeCharts).forEach(key => {
            if (this.activeCharts[key]) {
                try {
                    this.activeCharts[key].destroy();
                } catch (e) {}
            }
        });
        this.activeCharts = {};
    },

    // Route & Render current active page
    renderCurrentPage() {
        const container = document.getElementById('main-content-container');
        if (!container) return;

        switch (this.activePage) {
            case 'dashboard':
                container.innerHTML = this.getDashboardHTML();
                this.initDashboardCharts();
                break;
            case 'skills':
                container.innerHTML = this.getMySkillsHTML();
                break;
            case 'discover':
                container.innerHTML = this.getDiscoverSkillsHTML();
                break;
            case 'partners':
                container.innerHTML = this.getFindPartnersHTML();
                break;
            case 'connections':
                container.innerHTML = this.getMyConnectionsHTML();
                break;
            case 'goals':
                container.innerHTML = this.getGoalsHTML();
                break;
            case 'activities':
                container.innerHTML = this.getActivitiesHTML();
                this.initActivitiesTimerUI();
                break;
            case 'progress':
                container.innerHTML = this.getProgressHTML();
                this.initProgressChart();
                break;
            case 'analytics':
                container.innerHTML = this.getAnalyticsHTML();
                this.initAnalyticsCharts();
                break;
            case 'recommendations':
                container.innerHTML = this.getRecommendationsHTML();
                break;
            case 'achievements':
                container.innerHTML = this.getAchievementsHTML();
                break;
            case 'history':
                container.innerHTML = this.getHistoryHTML();
                break;
            case 'community':
                container.innerHTML = this.getCommunityHTML();
                break;
            case 'profile':
                container.innerHTML = this.getMyProfileHTML();
                break;
            case 'settings':
                container.innerHTML = this.getSettingsHTML();
                break;
            default:
                container.innerHTML = this.getDashboardHTML();
                this.initDashboardCharts();
        }

        Utils.renderIcons(container);
    },

    // --------------------------------------------------------------------------
    // DASHBOARD VIEW
    // --------------------------------------------------------------------------
    getDashboardHTML() {
        const u = this.currentUser;
        const skills = Storage.getUserSkills(u.id);
        const teachingSkills = skills.filter(s => s.type === 'teach');
        const learningSkills = skills.filter(s => s.type === 'learn');
        const goals = Storage.getUserGoals(u.id);
        const streak = AnalyticsEngine.calculateCurrentStreak(u.id);
        const learningHours = AnalyticsEngine.calculateLearningHours(u.id);
        const overallProgress = AnalyticsEngine.calculateOverallProgress(u.id);
        const topPartners = RecommendationsEngine.getPartnerRecommendations(u.id, 3);
        const recentActivities = Storage.getUserActivities(u.id).slice(0, 5);

        // Circular progress SVG calculations
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (overallProgress / 100) * circumference;

        return `
            <div class="animate-fade-in">
                <!-- Welcome Banner -->
                <div class="card mb-4" style="background: var(--bg-surface); border-left: 4px solid var(--primary-500);">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h1 style="font-size: 1.65rem; margin-bottom: 0.35rem;">Good Morning, ${Utils.escapeHTML(u.name)}! 👋</h1>
                            <p class="text-secondary" style="font-size: 0.95rem;">Continue learning, share your knowledge, and grow your skills with your community partners.</p>
                        </div>
                        <div style="display: flex; gap: 0.75rem;">
                            <button class="btn btn-primary" onclick="App.openAddActivityModal()">
                                <i data-lucide="plus-circle"></i> Log Session
                            </button>
                            <button class="btn btn-secondary" onclick="App.showPage('discover')">
                                <i data-lucide="compass"></i> Explore Skills
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 5 Dynamic Statistics Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Skills Offered</span>
                            <span class="stat-value">${teachingSkills.length}</span>
                            <span class="stat-subtext"><i data-lucide="arrow-up-right"></i> Knowledge Ready</span>
                        </div>
                        <div class="stat-icon-wrapper stat-icon-emerald">
                            <i data-lucide="award"></i>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Skills Learning</span>
                            <span class="stat-value">${learningSkills.length}</span>
                            <span class="stat-subtext"><i data-lucide="book-open"></i> Active Tracks</span>
                        </div>
                        <div class="stat-icon-wrapper stat-icon-indigo">
                            <i data-lucide="graduation-cap"></i>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Learning Goals</span>
                            <span class="stat-value">${goals.length}</span>
                            <span class="stat-subtext"><i data-lucide="target"></i> ${goals.filter(g => g.status === 'Completed').length} Completed</span>
                        </div>
                        <div class="stat-icon-wrapper stat-icon-purple">
                            <i data-lucide="check-circle-2"></i>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Current Streak</span>
                            <span class="stat-value" style="color: #d97706;">${streak} Days</span>
                            <span class="stat-subtext" style="color: #d97706;"><i data-lucide="flame"></i> Active Momentum</span>
                        </div>
                        <div class="stat-icon-wrapper stat-icon-amber">
                            <i data-lucide="zap"></i>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Learning Hours</span>
                            <span class="stat-value">${learningHours} <small style="font-size: 1rem;">hrs</small></span>
                            <span class="stat-subtext"><i data-lucide="clock"></i> Logged Time</span>
                        </div>
                        <div class="stat-icon-wrapper stat-icon-rose">
                            <i data-lucide="trending-up"></i>
                        </div>
                    </div>
                </div>

                <!-- Middle Section: Overall Progress & Weekly Chart -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    <!-- Circular Progress Card -->
                    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                        <div class="card-header">
                            <div>
                                <h3 class="card-title"><i data-lucide="pie-chart" style="color: var(--primary-500);"></i> Overall Learning Progress</h3>
                                <p class="card-subtitle">Aggregated progress across all skills & active goals</p>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; justify-content: center; padding: 1.5rem 0;">
                            <div class="progress-circle-wrapper">
                                <svg class="progress-circle-svg" viewBox="0 0 140 140">
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stop-color="#6366f1" />
                                            <stop offset="100%" stop-color="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                    <circle class="progress-circle-bg" cx="70" cy="70" r="${radius}" />
                                    <circle class="progress-circle-bar" cx="70" cy="70" r="${radius}" 
                                        stroke-dasharray="${circumference}" 
                                        stroke-dashoffset="${offset}" />
                                </svg>
                                <div class="progress-circle-text">
                                    <span class="progress-circle-percent">${overallProgress}%</span>
                                    <span class="progress-circle-label">Complete</span>
                                </div>
                            </div>
                        </div>

                        <div style="background-color: var(--bg-surface-alt); padding: 0.85rem; border-radius: var(--radius-md); display: flex; justify-content: space-around; text-align: center;">
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">ACTIVE GOALS</div>
                                <div style="font-family: 'Outfit'; font-weight: 700; font-size: 1.1rem;">${goals.filter(g => g.status === 'In Progress').length}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">COMPLETED</div>
                                <div style="font-family: 'Outfit'; font-weight: 700; font-size: 1.1rem; color: var(--accent-emerald);">${goals.filter(g => g.status === 'Completed').length}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">ACTIVE STREAK</div>
                                <div style="font-family: 'Outfit'; font-weight: 700; font-size: 1.1rem; color: var(--accent-amber);">${streak}d</div>
                            </div>
                        </div>
                    </div>

                    <!-- Weekly Activity Chart Card -->
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <h3 class="card-title"><i data-lucide="bar-chart-2" style="color: var(--accent-purple);"></i> Weekly Activity</h3>
                                <p class="card-subtitle">Hours dedicated to learning & teaching this week</p>
                            </div>
                            <span class="badge badge-purple">Mon - Sun</span>
                        </div>
                        <div style="height: 230px; position: relative;">
                            <canvas id="dashboardWeeklyChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Current Learning Goals Section -->
                <div class="card mb-4">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title"><i data-lucide="target" style="color: var(--primary-500);"></i> Current Learning Goals</h3>
                            <p class="card-subtitle">Track milestones and completion targets</p>
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="App.openAddGoalModal()">
                            <i data-lucide="plus"></i> Add Goal
                        </button>
                    </div>

                    ${goals.length === 0 ? `
                        <div class="empty-state-card">
                            <div class="empty-state-icon"><i data-lucide="target"></i></div>
                            <h4 class="empty-state-title">No learning goals yet</h4>
                            <p class="empty-state-desc">Create your first learning goal and start tracking your skill milestones.</p>
                            <button class="btn btn-primary" onclick="App.openAddGoalModal()">Create Goal</button>
                        </div>
                    ` : `
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
                            ${goals.map(g => `
                                <div class="goal-card">
                                    <div class="goal-card-top">
                                        <div>
                                            <h4 class="goal-title">${Utils.escapeHTML(g.title)}</h4>
                                            <span class="badge badge-primary goal-skill-badge">${Utils.escapeHTML(g.skill)}</span>
                                        </div>
                                        <span class="badge ${g.status === 'Completed' ? 'badge-emerald' : 'badge-neutral'}">${g.status}</span>
                                    </div>

                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.35rem;">
                                            <span>Progress</span>
                                            <span>${g.progress}%</span>
                                        </div>
                                        <div class="progress-bar-container">
                                            <div class="progress-bar-fill ${g.progress === 100 ? 'success' : ''}" style="width: ${g.progress}%;"></div>
                                        </div>
                                    </div>

                                    <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; justify-content: space-between;">
                                        <span>Target: ${Utils.formatDate(g.targetDate)}</span>
                                        <span>Priority: <strong style="color: var(--text-main);">${g.priority}</strong></span>
                                    </div>

                                    <div style="margin-top: auto; padding-top: 0.5rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end; gap: 0.5rem;">
                                        <button class="btn btn-sm btn-ghost" onclick="App.showPage('goals')">View Details</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>

                <!-- Bottom Section: Recommended Partners & Recent Activities -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">
                    <!-- Recommended Partners Card -->
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <h3 class="card-title"><i data-lucide="users" style="color: var(--primary-500);"></i> Top Skill Matches</h3>
                                <p class="card-subtitle">Recommended peers based on complementary skills</p>
                            </div>
                            <button class="btn btn-sm btn-ghost" onclick="App.showPage('partners')">View All</button>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            ${topPartners.length === 0 ? `
                                <div class="empty-state-card" style="padding: 1.5rem;">
                                    <div class="empty-state-icon" style="width: 40px; height: 40px;"><i data-lucide="users"></i></div>
                                    <h4 class="empty-state-title" style="font-size: 0.95rem;">No partner matches yet</h4>
                                    <p class="empty-state-desc" style="font-size: 0.82rem;">Add teaching and learning skills to discover complementary partners.</p>
                                    <button class="btn btn-sm btn-primary" onclick="App.showPage('skills')">Add Skills</button>
                                </div>
                            ` : topPartners.map(match => `
                                <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.85rem; background-color: var(--bg-surface-alt); border-radius: var(--radius-md);">
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        ${Utils.getAvatarHTML(match.otherUser, 'md')}
                                        <div>
                                            <div style="font-weight: 700; font-size: 0.95rem;">${Utils.escapeHTML(match.otherUser.name)}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">${match.otherUser.userType} • ${Utils.escapeHTML(match.otherUser.location || '')}</div>
                                            <div style="font-size: 0.75rem; color: var(--primary-600); font-weight: 600; margin-top: 0.15rem;">
                                                Teaches: ${match.learningOpportunities.slice(0, 2).join(', ') || 'Various'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem;">
                                        <span class="match-score-pill ${match.score >= 80 ? 'high' : ''}">${match.score}% Match</span>
                                        <button class="btn btn-sm btn-primary" onclick="App.openConnectModal('${match.otherUser.id}')">Connect</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Recent Activities Feed Card -->
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <h3 class="card-title"><i data-lucide="history" style="color: var(--accent-emerald);"></i> Recent Learning Activity</h3>
                                <p class="card-subtitle">Your latest sessions and milestones</p>
                            </div>
                            <button class="btn btn-sm btn-ghost" onclick="App.showPage('history')">Full History</button>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                            ${recentActivities.length === 0 ? `
                                <p class="text-secondary" style="font-size: 0.9rem; text-align: center; padding: 1.5rem;">No activities logged yet. Start a session with the timer!</p>
                            ` : recentActivities.map(act => `
                                <div style="display: flex; align-items: flex-start; gap: 0.85rem; padding: 0.75rem; border-bottom: 1px solid var(--border-subtle);">
                                    <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--bg-surface-alt); display: flex; align-items: center; justify-content: center; color: var(--primary-500); flex-shrink: 0;">
                                        <i data-lucide="${act.type.includes('Teaching') ? 'share-2' : 'book-open'}"></i>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-main);">${Utils.escapeHTML(act.description)}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 0.75rem; margin-top: 0.2rem;">
                                            <span class="badge badge-neutral" style="padding: 0.1rem 0.4rem;">${act.skill}</span>
                                            <span>${Utils.formatDuration(act.duration)}</span>
                                            <span>${Utils.formatRelativeTime(act.date || act.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Initialize Chart.js for dashboard weekly activity
    initDashboardCharts() {
        const canvas = document.getElementById('dashboardWeeklyChart');
        if (!canvas) return;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const weeklyData = AnalyticsEngine.calculateWeeklyActivity(this.currentUser.id);

        const ctx = canvas.getContext('2d');
        this.activeCharts.dashboardWeekly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Learning Hours',
                    data: weeklyData.data,
                    backgroundColor: isDark ? 'rgba(129, 140, 248, 0.75)' : 'rgba(99, 102, 241, 0.85)',
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y} hours`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: isDark ? '#94a3b8' : '#64748b' }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: isDark ? '#1e293b' : '#f1f5f9' },
                        ticks: { color: isDark ? '#94a3b8' : '#64748b' }
                    }
                }
            }
        });
    },

    // --------------------------------------------------------------------------
    // MY SKILLS VIEW (Sections: Skills I Can Teach & Skills I Want to Learn)
    // --------------------------------------------------------------------------
    getMySkillsHTML() {
        const u = this.currentUser;
        const skills = Storage.getUserSkills(u.id);
        const teachSkills = skills.filter(s => s.type === 'teach');
        const learnSkills = skills.filter(s => s.type === 'learn');

        return `
            <div class="animate-fade-in">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1 style="font-size: 1.65rem;">My Skills Portfolio</h1>
                        <p class="text-secondary" style="font-size: 0.95rem;">Manage the skills you share with the community and the topics you want to master.</p>
                    </div>
                    <div style="display: flex; gap: 0.75rem;">
                        <button class="btn btn-success" onclick="App.openAddSkillModal('teach')">
                            <i data-lucide="plus"></i> Add Skill to Teach
                        </button>
                        <button class="btn btn-primary" onclick="App.openAddSkillModal('learn')">
                            <i data-lucide="plus"></i> Add Skill to Learn
                        </button>
                    </div>
                </div>

                <!-- Section 1: Skills I Can Teach -->
                <div class="card mb-4">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title"><i data-lucide="award" style="color: var(--accent-emerald);"></i> Skills I Can Teach (${teachSkills.length})</h3>
                            <p class="card-subtitle">Showcase your expertise to match with eager learners</p>
                        </div>
                    </div>

                    ${teachSkills.length === 0 ? `
                        <div class="empty-state-card">
                            <div class="empty-state-icon"><i data-lucide="award"></i></div>
                            <h4 class="empty-state-title">No teaching skills added</h4>
                            <p class="empty-state-desc">Share what you know! Adding your teaching skills unlocks mutual exchange matches.</p>
                            <button class="btn btn-success" onclick="App.openAddSkillModal('teach')">Add Teaching Skill</button>
                        </div>
                    ` : `
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem;">
                            ${teachSkills.map(s => `
                                <div class="card" style="border-left: 4px solid var(--accent-emerald); display: flex; flex-direction: column; justify-content: space-between;">
                                    <div>
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                                            <h4 style="font-size: 1.1rem; font-weight: 700;">${Utils.escapeHTML(s.name)}</h4>
                                            <span class="badge badge-emerald">${s.proficiency || 'Intermediate'}</span>
                                        </div>
                                        <span class="badge badge-neutral" style="margin-bottom: 0.75rem;">${s.category || 'General'}</span>
                                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                                            <strong>Experience:</strong> ${Utils.escapeHTML(s.experience || 'Experienced practitioner')}
                                        </p>
                                        ${s.description ? `<p style="font-size: 0.82rem; color: var(--text-muted);">${Utils.escapeHTML(s.description)}</p>` : ''}
                                    </div>
                                    <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
                                        <button class="btn btn-sm btn-ghost" onclick="App.openEditSkillModal('${s.id}')"><i data-lucide="edit-2"></i> Edit</button>
                                        <button class="btn btn-sm btn-ghost" style="color: var(--accent-rose);" onclick="App.deleteSkill('${s.id}')"><i data-lucide="trash-2"></i> Delete</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>

                <!-- Section 2: Skills I Want to Learn -->
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title"><i data-lucide="book-open" style="color: var(--primary-500);"></i> Skills I Want to Learn (${learnSkills.length})</h3>
                            <p class="card-subtitle">Topics and domains you are currently seeking mentorship or study partners in</p>
                        </div>
                    </div>

                    ${learnSkills.length === 0 ? `
                        <div class="empty-state-card">
                            <div class="empty-state-icon"><i data-lucide="book-open"></i></div>
                            <h4 class="empty-state-title">No learning skills added</h4>
                            <p class="empty-state-desc">Add skills you want to learn so other community members can find and teach you.</p>
                            <button class="btn btn-primary" onclick="App.openAddSkillModal('learn')">Add Learning Skill</button>
                        </div>
                    ` : `
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem;">
                            ${learnSkills.map(s => `
                                <div class="card" style="border-left: 4px solid var(--primary-500); display: flex; flex-direction: column; justify-content: space-between;">
                                    <div>
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                                            <h4 style="font-size: 1.1rem; font-weight: 700;">${Utils.escapeHTML(s.name)}</h4>
                                            <span class="badge badge-primary">Priority: ${s.priority || 'High'}</span>
                                        </div>
                                        <span class="badge badge-neutral" style="margin-bottom: 0.75rem;">${s.category || 'General'}</span>
                                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                                            <span>Current: <strong>${s.currentLevel || 'Beginner'}</strong></span> &rarr;
                                            <span>Target: <strong>${s.targetLevel || 'Advanced'}</strong></span>
                                        </div>
                                        <div>
                                            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 600; margin-bottom: 0.25rem;">
                                                <span>Mastery Progress</span>
                                                <span>${s.progress || 0}%</span>
                                            </div>
                                            <div class="progress-bar-container">
                                                <div class="progress-bar-fill" style="width: ${s.progress || 0}%;"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
                                        <button class="btn btn-sm btn-ghost" onclick="App.openEditSkillModal('${s.id}')"><i data-lucide="edit-2"></i> Edit</button>
                                        <button class="btn btn-sm btn-ghost" style="color: var(--accent-rose);" onclick="App.deleteSkill('${s.id}')"><i data-lucide="trash-2"></i> Delete</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    // --------------------------------------------------------------------------
    // DISCOVER SKILLS & PARTNERS VIEW
    // --------------------------------------------------------------------------
    getDiscoverSkillsHTML() {
        const currentUser = this.currentUser;
        const allUsers = Storage.getCollection(STORAGE_KEYS.USERS).filter(u => u.id !== currentUser.id);
        const allSkills = Storage.getCollection(STORAGE_KEYS.SKILLS);

        return `
            <div class="animate-fade-in">
                <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1 style="font-size: 1.75rem;">Discover Skills & Mentors</h1>
                        <p class="text-secondary" style="font-size: 0.95rem;">Search and connect with community peers offering and learning diverse skills.</p>
                    </div>
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); background: var(--bg-surface); padding: 0.4rem 0.85rem; border-radius: var(--radius-full); border: 1px solid var(--border-subtle);">
                        🌐 <strong>${allUsers.length}</strong> Community Peers Active
                    </div>
                </div>

                <!-- Trending Skills Quick Filter Chips -->
                <div style="margin-bottom: 1.25rem;">
                    <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 0.05em;">
                        Trending Skills in Community
                    </div>
                    <div class="discovery-chips-container" id="discover-chips-bar">
                        <button type="button" class="discovery-chip active" onclick="App.selectDiscoverChip('')">All Skills</button>
                        <button type="button" class="discovery-chip" onclick="App.selectDiscoverChip('Python')">🐍 Python</button>
                        <button type="button" class="discovery-chip" onclick="App.selectDiscoverChip('UI/UX Design')">🎨 UI/UX Design</button>
                        <button type="button" class="discovery-chip" onclick="App.selectDiscoverChip('React')">⚛️ React</button>
                        <button type="button" class="discovery-chip" onclick="App.selectDiscoverChip('Figma')">📐 Figma</button>
                        <button type="button" class="discovery-chip" onclick="App.selectDiscoverChip('Machine Learning')">🤖 Machine Learning</button>
                        <button type="button" class="discovery-chip" onclick="App.selectDiscoverChip('JavaScript')">⚡ JavaScript</button>
                        <button type="button" class="discovery-chip" onclick="App.selectDiscoverChip('Public Speaking')">🎤 Public Speaking</button>
                        <button type="button" class="discovery-chip" onclick="App.selectDiscoverChip('Node.js')">🟢 Node.js</button>
                        <button type="button" class="discovery-chip" onclick="App.selectDiscoverChip('Data Science')">📊 Data Science</button>
                        <button type="button" class="discovery-chip" onclick="App.selectDiscoverChip('Video Editing')">🎬 Video Editing</button>
                        <button type="button" class="discovery-chip" onclick="App.selectDiscoverChip('Digital Marketing')">📈 Digital Marketing</button>
                    </div>
                </div>

                <!-- Filter Controls Bar -->
                <div class="card mb-4" style="padding: 1.25rem;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; align-items: flex-end;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Search Query</label>
                            <input type="text" id="discover-search-input" class="form-input" placeholder="Search skill, peer, or topic..." oninput="App.filterDiscoverCards()">
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Category</label>
                            <select id="discover-category-filter" class="form-select" onchange="App.filterDiscoverCards()">
                                <option value="all">All Categories</option>
                                ${Object.values(SKILL_CATEGORIES).map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Proficiency</label>
                            <select id="discover-prof-filter" class="form-select" onchange="App.filterDiscoverCards()">
                                <option value="all">All Levels</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">User Type</label>
                            <select id="discover-user-type-filter" class="form-select" onchange="App.filterDiscoverCards()">
                                <option value="all">All Types</option>
                                <option value="Student">Student</option>
                                <option value="Professional">Professional</option>
                            </select>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Availability</label>
                            <select id="discover-avail-filter" class="form-select" onchange="App.filterDiscoverCards()">
                                <option value="all">All Availability</option>
                                <option value="Available">Available Now</option>
                                <option value="Busy">Busy</option>
                            </select>
                        </div>

                        <div>
                            <button class="btn btn-secondary" style="width: 100%;" onclick="App.clearDiscoverFilters()">
                                <i data-lucide="rotate-ccw"></i> Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Grid of Discovery Cards -->
                <div id="discover-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
                    ${this.renderDiscoverCardsHTML(allUsers, allSkills)}
                </div>
            </div>
        `;
    },

    selectDiscoverChip(skillName) {
        const input = document.getElementById('discover-search-input');
        if (input) {
            input.value = skillName;
        }

        document.querySelectorAll('.discovery-chip').forEach(btn => {
            if ((!skillName && btn.textContent.includes('All Skills')) || (skillName && btn.textContent.toLowerCase().includes(skillName.toLowerCase()))) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.filterDiscoverCards();
    },

    renderDiscoverCardsHTML(users, skills, filterOptions = {}) {
        const currentUser = this.currentUser;
        const norm = s => (s || '').toLowerCase().trim();
        const searchQ = norm(filterOptions.search);

        let filteredUsers = users.filter(u => {
            const userSkills = skills.filter(s => s.userId === u.id);
            const teachSkills = userSkills.filter(s => s.type === 'teach');
            const learnSkills = userSkills.filter(s => s.type === 'learn');

            if (searchQ) {
                const matchName = norm(u.name).includes(searchQ);
                const matchBio = norm(u.bio).includes(searchQ);
                const matchInst = norm(u.institution || u.location).includes(searchQ);
                const matchTeachSkill = teachSkills.some(s => norm(s.name).includes(searchQ) || norm(s.category).includes(searchQ) || norm(s.proficiency).includes(searchQ));
                const matchLearnSkill = learnSkills.some(s => norm(s.name).includes(searchQ) || norm(s.category).includes(searchQ) || norm(s.currentLevel).includes(searchQ) || norm(s.targetLevel).includes(searchQ));
                const matchInterest = (u.interests || []).some(i => norm(i).includes(searchQ));
                if (!matchName && !matchBio && !matchInst && !matchTeachSkill && !matchLearnSkill && !matchInterest) return false;
            }

            if (filterOptions.category && filterOptions.category !== 'all') {
                const matchCat = userSkills.some(s => s.category === filterOptions.category);
                if (!matchCat) return false;
            }

            if (filterOptions.proficiency && filterOptions.proficiency !== 'all') {
                const p = norm(filterOptions.proficiency);
                const matchTeachProf = teachSkills.some(s => norm(s.proficiency) === p);
                const matchLearnProf = learnSkills.some(s => norm(s.currentLevel) === p || norm(s.targetLevel) === p);
                if (!matchTeachProf && !matchLearnProf) return false;
            }

            if (filterOptions.userType && filterOptions.userType !== 'all') {
                if (u.userType !== filterOptions.userType) return false;
            }

            if (filterOptions.availability && filterOptions.availability !== 'all') {
                if ((u.availability || 'Available') !== filterOptions.availability) return false;
            }

            return true;
        });

        if (filteredUsers.length === 0) {
            return `
                <div class="empty-state-card" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon"><i data-lucide="search"></i></div>
                    <h4 class="empty-state-title">No matching profiles found</h4>
                    <p class="empty-state-desc">Try loosening your search query or reset your filters to discover active community members.</p>
                    <button class="btn btn-secondary" onclick="App.clearDiscoverFilters()">Reset All Filters</button>
                </div>
            `;
        }

        return filteredUsers.map(user => {
            const match = MatchingEngine.calculateMatchScore(currentUser, user);
            const userSkills = skills.filter(s => s.userId === user.id);
            const teach = userSkills.filter(s => s.type === 'teach');
            const learn = userSkills.filter(s => s.type === 'learn');

            const isMatch = s => searchQ && (norm(s.name).includes(searchQ) || norm(s.category).includes(searchQ) || norm(s.proficiency).includes(searchQ));

            return `
                <div class="partner-card">
                    <div class="partner-card-top">
                        <div class="partner-user-meta">
                            ${Utils.getAvatarHTML(user, 'md')}
                            <div>
                                <h4 class="partner-name">${Utils.escapeHTML(user.name)}</h4>
                                <span class="partner-role-tag">${user.userType} • ${Utils.escapeHTML(user.institution || user.location || '')}</span>
                            </div>
                        </div>
                        <span class="match-score-pill ${match.score >= 80 ? 'high' : ''}">${match.score}% Match</span>
                    </div>

                    <p style="font-size: 0.82rem; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.45;">
                        ${Utils.escapeHTML(user.bio || 'Passionate community learner.')}
                    </p>

                    <div class="partner-skills-block">
                        <div class="partner-skills-row">
                            <span class="partner-skills-label">Can Teach (${teach.length})</span>
                            <div class="skill-tag-list">
                                ${teach.map(t => `
                                    <span class="skill-tag highlight-teach ${isMatch(t) ? 'search-matched-skill' : ''}" title="${t.proficiency} level • ${t.experience || 'Mentorship available'}">
                                        ${Utils.escapeHTML(t.name)}
                                        <span class="level-pill ${t.proficiency === 'Expert' ? 'expert' : ''}">${t.proficiency || 'Adv'}</span>
                                    </span>
                                `).join('')}
                            </div>
                        </div>

                        <div class="partner-skills-row" style="margin-top: 0.35rem;">
                            <span class="partner-skills-label">Wants to Learn (${learn.length})</span>
                            <div class="skill-tag-list">
                                ${learn.map(l => `
                                    <span class="skill-tag highlight-learn ${isMatch(l) ? 'search-matched-skill' : ''}" title="Currently ${l.currentLevel || 'Beginner'} &rarr; Target: ${l.targetLevel || 'Advanced'}">
                                        ${Utils.escapeHTML(l.name)}
                                        <span class="level-pill">${l.targetLevel || 'Target'}</span>
                                        ${l.priority ? `<span class="priority-pill ${l.priority.toLowerCase()}">${l.priority}</span>` : ''}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="partner-card-footer">
                        <button class="btn btn-sm btn-secondary" onclick="App.openPublicProfileModal('${user.id}')">
                            <i data-lucide="user"></i> View Profile
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="App.openConnectModal('${user.id}')">
                            <i data-lucide="user-plus"></i> Connect
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterDiscoverCards() {
        const search = document.getElementById('discover-search-input')?.value || '';
        const category = document.getElementById('discover-category-filter')?.value || 'all';
        const proficiency = document.getElementById('discover-prof-filter')?.value || 'all';
        const userType = document.getElementById('discover-user-type-filter')?.value || 'all';
        const availability = document.getElementById('discover-avail-filter')?.value || 'all';

        const allUsers = Storage.getCollection(STORAGE_KEYS.USERS).filter(u => u.id !== this.currentUser.id);
        const allSkills = Storage.getCollection(STORAGE_KEYS.SKILLS);

        const container = document.getElementById('discover-cards-grid');
        if (container) {
            container.innerHTML = this.renderDiscoverCardsHTML(allUsers, allSkills, {
                search, category, proficiency, userType, availability
            });
            Utils.renderIcons(container);
        }
    },

    clearDiscoverFilters() {
        const s = document.getElementById('discover-search-input'); if (s) s.value = '';
        const c = document.getElementById('discover-category-filter'); if (c) c.value = 'all';
        const p = document.getElementById('discover-prof-filter'); if (p) p.value = 'all';
        const u = document.getElementById('discover-user-type-filter'); if (u) u.value = 'all';
        const a = document.getElementById('discover-avail-filter'); if (a) a.value = 'all';
        
        document.querySelectorAll('.discovery-chip').forEach(btn => {
            if (btn.textContent.includes('All Skills')) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        this.filterDiscoverCards();
    },

    // --------------------------------------------------------------------------
    // FIND PARTNERS VIEW
    // --------------------------------------------------------------------------
    getFindPartnersHTML() {
        const currentUser = this.currentUser;
        const allMatches = MatchingEngine.getRankedPartners(currentUser.id);

        const perfectMatches = allMatches.filter(m => m.score >= 80);
        const strongMatches = allMatches.filter(m => m.score >= 50 && m.score < 80);
        const potentialMatches = allMatches.filter(m => m.score < 50);

        const renderPartnerSection = (title, icon, subtitle, matches, pillClass) => `
            <div class="card mb-4">
                <div class="card-header">
                    <div>
                        <h3 class="card-title"><i data-lucide="${icon}" style="color: var(--primary-500);"></i> ${title} (${matches.length})</h3>
                        <p class="card-subtitle">${subtitle}</p>
                    </div>
                </div>

                ${matches.length === 0 ? `
                    <p class="text-secondary" style="font-size: 0.9rem; padding: 1rem 0;">No partners currently in this tier.</p>
                ` : `
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
                        ${matches.map(m => `
                            <div class="partner-card">
                                <div class="partner-card-top">
                                    <div class="partner-user-meta">
                                        ${Utils.getAvatarHTML(m.otherUser, 'md')}
                                        <div>
                                            <h4 class="partner-name">${Utils.escapeHTML(m.otherUser.name)}</h4>
                                            <span class="partner-role-tag">${m.otherUser.userType} • ${Utils.escapeHTML(m.otherUser.location || '')}</span>
                                        </div>
                                    </div>
                                    <span class="match-score-pill ${pillClass}">${m.score}% Match</span>
                                </div>

                                <div style="font-size: 0.78rem; font-weight: 600; color: var(--accent-emerald);">
                                    ✨ ${m.tagline}
                                </div>

                                <div class="partner-skills-block">
                                    <div class="partner-skills-row">
                                        <span class="partner-skills-label">You can learn from them</span>
                                        <div class="skill-tag-list">
                                            ${m.learningOpportunities.length > 0 ? m.learningOpportunities.map(s => `<span class="skill-tag highlight-teach">${Utils.escapeHTML(s)}</span>`).join('') : '<span style="font-size: 0.75rem; color: var(--text-muted);">Explore general topics</span>'}
                                        </div>
                                    </div>

                                    <div class="partner-skills-row" style="margin-top: 0.35rem;">
                                        <span class="partner-skills-label">You can teach them</span>
                                        <div class="skill-tag-list">
                                            ${m.teachingOpportunities.length > 0 ? m.teachingOpportunities.map(s => `<span class="skill-tag highlight-learn">${Utils.escapeHTML(s)}</span>`).join('') : '<span style="font-size: 0.75rem; color: var(--text-muted);">Share your experience</span>'}
                                        </div>
                                    </div>
                                </div>

                                <div class="partner-card-footer">
                                    <button class="btn btn-sm btn-secondary" onclick="App.openPublicProfileModal('${m.otherUser.id}')">
                                        <i data-lucide="user"></i> View Profile
                                    </button>
                                    <button class="btn btn-sm btn-primary" onclick="App.openConnectModal('${m.otherUser.id}')">
                                        <i data-lucide="send"></i> Exchange Skills
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;

        return `
            <div class="animate-fade-in">
                <div style="margin-bottom: 1.5rem;">
                    <h1 style="font-size: 1.65rem;">Find My Learning Partners</h1>
                    <p class="text-secondary" style="font-size: 0.95rem;">Smart algorithm matching your teaching strengths against others' learning goals.</p>
                </div>

                ${renderPartnerSection('Perfect Matches', 'sparkles', 'High mutual exchange compatibility (>=80%)', perfectMatches, 'high')}
                ${renderPartnerSection('Strong Matches', 'flame', 'Strong complementary knowledge exchange (50% - 79%)', strongMatches, '')}
                ${renderPartnerSection('Potential Matches', 'compass', 'Potential shared learning tracks & interests', potentialMatches, '')}
            </div>
        `;
    },

    // --------------------------------------------------------------------------
    // MY CONNECTIONS VIEW
    // --------------------------------------------------------------------------
    getMyConnectionsHTML() {
        const u = this.currentUser;
        const connections = Storage.getUserConnections(u.id);
        const activeConnections = connections.filter(c => c.status === 'Accepted');
        const pendingReceived = connections.filter(c => c.status === 'Pending' && c.receiverId === u.id);
        const pendingSent = connections.filter(c => c.status === 'Pending' && c.senderId === u.id);

        return `
            <div class="animate-fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1 style="font-size: 1.65rem;">My Learning Connections</h1>
                        <p class="text-secondary" style="font-size: 0.95rem;">Manage your active learning networks and peer requests.</p>
                    </div>
                    <button class="btn btn-primary" onclick="App.showPage('partners')">
                        <i data-lucide="user-plus"></i> Find New Partners
                    </button>
                </div>

                <!-- Tabs -->
                <div class="tab-nav">
                    <button class="tab-btn active" onclick="App.switchConnectionTab(event, 'tab-active')">Active (${activeConnections.length})</button>
                    <button class="tab-btn" onclick="App.switchConnectionTab(event, 'tab-received')">Requests Received (${pendingReceived.length})</button>
                    <button class="tab-btn" onclick="App.switchConnectionTab(event, 'tab-sent')">Sent Requests (${pendingSent.length})</button>
                </div>

                <!-- Active Tab -->
                <div id="tab-active" class="connection-tab-content">
                    ${activeConnections.length === 0 ? `
                        <div class="empty-state-card">
                            <div class="empty-state-icon"><i data-lucide="users"></i></div>
                            <h4 class="empty-state-title">No active connections yet</h4>
                            <p class="empty-state-desc">Find compatible learning partners and send your first connection invite.</p>
                            <button class="btn btn-primary" onclick="App.showPage('partners')">Find Partners</button>
                        </div>
                    ` : `
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
                            ${activeConnections.map(c => {
                                const otherId = c.senderId === u.id ? c.receiverId : c.senderId;
                                const otherUser = Storage.getById(STORAGE_KEYS.USERS, otherId);
                                if (!otherUser) return '';

                                return `
                                    <div class="partner-card">
                                        <div class="partner-card-top">
                                            <div class="partner-user-meta">
                                                ${Utils.getAvatarHTML(otherUser, 'md')}
                                                <div>
                                                    <h4 class="partner-name">${Utils.escapeHTML(otherUser.name)}</h4>
                                                    <span class="partner-role-tag">${otherUser.userType} • ${Utils.escapeHTML(otherUser.location || '')}</span>
                                                </div>
                                            </div>
                                            <span class="badge badge-emerald">Connected</span>
                                        </div>

                                        <p style="font-size: 0.82rem; color: var(--text-secondary);">${Utils.escapeHTML(c.message || 'Active skill exchange partnership.')}</p>

                                        <div class="partner-card-footer">
                                            <button class="btn btn-sm btn-secondary" onclick="App.openPublicProfileModal('${otherUser.id}')">View Profile</button>
                                            <button class="btn btn-sm btn-ghost" style="color: var(--accent-rose);" onclick="App.removeConnection('${c.id}')">Remove</button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>

                <!-- Received Tab -->
                <div id="tab-received" class="connection-tab-content" style="display: none;">
                    ${pendingReceived.length === 0 ? `
                        <p class="text-secondary" style="padding: 2rem; text-align: center;">No pending received connection requests.</p>
                    ` : `
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
                            ${pendingReceived.map(c => {
                                const sender = Storage.getById(STORAGE_KEYS.USERS, c.senderId);
                                if (!sender) return '';

                                return `
                                    <div class="partner-card">
                                        <div class="partner-card-top">
                                            <div class="partner-user-meta">
                                                ${Utils.getAvatarHTML(sender, 'md')}
                                                <div>
                                                    <h4 class="partner-name">${Utils.escapeHTML(sender.name)}</h4>
                                                    <span class="partner-role-tag">${sender.userType}</span>
                                                </div>
                                            </div>
                                            <span class="badge badge-amber">Pending</span>
                                        </div>

                                        <p style="font-size: 0.85rem; color: var(--text-secondary); background: var(--bg-surface-alt); padding: 0.75rem; border-radius: var(--radius-sm);">
                                            "${Utils.escapeHTML(c.message || 'Would love to exchange skills!')}"
                                        </p>

                                        <div class="partner-card-footer">
                                            <button class="btn btn-sm btn-danger" onclick="App.handleConnectionAction('${c.id}', 'reject')">Reject</button>
                                            <button class="btn btn-sm btn-success" onclick="App.handleConnectionAction('${c.id}', 'accept')">Accept Request</button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>

                <!-- Sent Tab -->
                <div id="tab-sent" class="connection-tab-content" style="display: none;">
                    ${pendingSent.length === 0 ? `
                        <p class="text-secondary" style="padding: 2rem; text-align: center;">No outgoing pending requests.</p>
                    ` : `
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
                            ${pendingSent.map(c => {
                                const receiver = Storage.getById(STORAGE_KEYS.USERS, c.receiverId);
                                if (!receiver) return '';

                                return `
                                    <div class="partner-card">
                                        <div class="partner-card-top">
                                            <div class="partner-user-meta">
                                                ${Utils.getAvatarHTML(receiver, 'md')}
                                                <div>
                                                    <h4 class="partner-name">${Utils.escapeHTML(receiver.name)}</h4>
                                                    <span class="partner-role-tag">${receiver.userType}</span>
                                                </div>
                                            </div>
                                            <span class="badge badge-neutral">Awaiting Response</span>
                                        </div>
                                        <div class="partner-card-footer">
                                            <button class="btn btn-sm btn-ghost" style="color: var(--accent-rose);" onclick="App.removeConnection('${c.id}')">Cancel Invite</button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    switchConnectionTab(e, tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.connection-tab-content').forEach(c => c.style.display = 'none');
        const target = document.getElementById(tabId);
        if (target) target.style.display = 'block';
    },

    // --------------------------------------------------------------------------
    // LEARNING GOALS & MILESTONES VIEW
    // --------------------------------------------------------------------------
    getGoalsHTML() {
        const u = this.currentUser;
        const goals = Storage.getUserGoals(u.id);

        return `
            <div class="animate-fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1 style="font-size: 1.65rem;">Learning Goals & Milestones</h1>
                        <p class="text-secondary" style="font-size: 0.95rem;">Set structured learning roadmaps, check off milestone achievements, and reach mastery.</p>
                    </div>
                    <button class="btn btn-primary" onclick="App.openAddGoalModal()">
                        <i data-lucide="plus-circle"></i> Create New Goal
                    </button>
                </div>

                ${goals.length === 0 ? `
                    <div class="empty-state-card">
                        <div class="empty-state-icon"><i data-lucide="target"></i></div>
                        <h4 class="empty-state-title">No goals created yet</h4>
                        <p class="empty-state-desc">Establish structured learning goals to track your skill milestones effectively.</p>
                        <button class="btn btn-primary" onclick="App.openAddGoalModal()">Create First Goal</button>
                    </div>
                ` : `
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.5rem;">
                        ${goals.map(g => `
                            <div class="goal-card">
                                <div class="goal-card-top">
                                    <div>
                                        <h3 class="goal-title">${Utils.escapeHTML(g.title)}</h3>
                                        <span class="badge badge-primary goal-skill-badge">${Utils.escapeHTML(g.skill)}</span>
                                    </div>
                                    <span class="badge ${g.status === 'Completed' ? 'badge-emerald' : 'badge-neutral'}">${g.status}</span>
                                </div>

                                <p style="font-size: 0.85rem; color: var(--text-secondary);">${Utils.escapeHTML(g.description || '')}</p>

                                <div>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.35rem;">
                                        <span>Completion</span>
                                        <span>${g.progress}%</span>
                                    </div>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar-fill ${g.progress === 100 ? 'success' : ''}" style="width: ${g.progress}%;"></div>
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-muted);">
                                    <span>Target: ${Utils.formatDate(g.targetDate)}</span>
                                    <span>Proficiency: <strong>${g.targetProficiency || 'Advanced'}</strong></span>
                                </div>

                                <!-- Milestones Checklist -->
                                <div>
                                    <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.4rem;">
                                        Milestones (${(g.milestones || []).filter(m => m.completed).length} / ${(g.milestones || []).length})
                                    </div>
                                    <ul class="milestones-checklist">
                                        ${(g.milestones || []).map(m => `
                                            <li class="milestone-item ${m.completed ? 'completed' : ''}" onclick="App.toggleMilestone('${g.id}', '${m.id}')">
                                                <input type="checkbox" class="milestone-checkbox" ${m.completed ? 'checked' : ''} onclick="event.stopPropagation(); App.toggleMilestone('${g.id}', '${m.id}')">
                                                <span>${Utils.escapeHTML(m.text)}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.85rem; border-top: 1px solid var(--border-subtle);">
                                    <button class="btn btn-sm btn-ghost" style="color: var(--accent-rose);" onclick="App.deleteGoal('${g.id}')">
                                        <i data-lucide="trash-2"></i> Delete
                                    </button>
                                    <div style="display: flex; gap: 0.5rem;">
                                        <button class="btn btn-sm btn-secondary" onclick="App.openEditGoalModal('${g.id}')">Edit</button>
                                        ${g.status !== 'Completed' ? `
                                            <button class="btn btn-sm btn-success" onclick="App.markGoalComplete('${g.id}')">Complete</button>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    },

    // --------------------------------------------------------------------------
    // ACTIVITIES & LIVE TIMER VIEW
    // --------------------------------------------------------------------------
    getActivitiesHTML() {
        const u = this.currentUser;
        const activities = Storage.getUserActivities(u.id);
        const userSkills = Storage.getUserSkills(u.id);

        return `
            <div class="animate-fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1 style="font-size: 1.65rem;">Learning Activities & Timer</h1>
                        <p class="text-secondary" style="font-size: 0.95rem;">Log focused study, practice, project, or knowledge-sharing sessions.</p>
                    </div>
                    <button class="btn btn-primary" onclick="App.openAddActivityModal()">
                        <i data-lucide="plus-circle"></i> Log Activity Manually
                    </button>
                </div>

                <!-- Live Stopwatch Timer Card -->
                <div class="timer-widget-card mb-4 ${this.timerRunning ? 'active-timer' : ''}">
                    <span class="timer-state-pill ${this.timerRunning ? 'running' : ''}">
                        <span class="timer-pulse-dot"></span>
                        <span id="timer-status-text">${this.timerRunning ? 'Live Focus Session Active' : 'Stopwatch Ready'}</span>
                    </span>

                    <div class="timer-clock-display" id="timer-display">${this.formatTimerTime(this.timerSeconds)}</div>

                    <div class="timer-controls-row">
                        ${!this.timerRunning && this.timerSeconds === 0 ? `
                            <button class="btn btn-lg btn-success" onclick="App.startTimer()">
                                <i data-lucide="play"></i> Start Focus Timer
                            </button>
                        ` : ''}

                        ${this.timerRunning ? `
                            <button class="btn btn-lg btn-secondary" onclick="App.pauseTimer()">
                                <i data-lucide="pause"></i> Pause
                            </button>
                            <button class="btn btn-lg btn-danger" onclick="App.stopAndSaveTimer()">
                                <i data-lucide="square"></i> Stop & Save Session
                            </button>
                        ` : ''}

                        ${!this.timerRunning && this.timerSeconds > 0 ? `
                            <button class="btn btn-lg btn-success" onclick="App.resumeTimer()">
                                <i data-lucide="play"></i> Resume
                            </button>
                            <button class="btn btn-lg btn-danger" onclick="App.stopAndSaveTimer()">
                                <i data-lucide="square"></i> Stop & Save Session
                            </button>
                            <button class="btn btn-lg btn-ghost" onclick="App.resetTimer()">Reset</button>
                        ` : ''}
                    </div>
                </div>

                <!-- Activity Log Table -->
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title"><i data-lucide="list" style="color: var(--primary-500);"></i> Logged Sessions (${activities.length})</h3>
                            <p class="card-subtitle">All recorded study & teaching history</p>
                        </div>
                    </div>

                    ${activities.length === 0 ? `
                        <p class="text-secondary" style="padding: 2rem; text-align: center;">No activities recorded yet. Start the focus timer above!</p>
                    ` : `
                        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                            ${activities.map(act => `
                                <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: var(--bg-surface-alt); border-radius: var(--radius-md); gap: 1rem; flex-wrap: wrap;">
                                    <div style="display: flex; align-items: center; gap: 0.85rem;">
                                        <div style="width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--bg-surface); display: flex; align-items: center; justify-content: center; color: var(--primary-500);">
                                            <i data-lucide="${act.type.includes('Teaching') ? 'share-2' : 'book-open'}"></i>
                                        </div>
                                        <div>
                                            <div style="font-weight: 700; font-size: 0.95rem;">${Utils.escapeHTML(act.description)}</div>
                                            <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; gap: 0.5rem; margin-top: 0.2rem; flex-wrap: wrap;">
                                                <span class="badge badge-primary">${act.type}</span>
                                                <span class="badge badge-neutral">${act.skill}</span>
                                                <span>• ${Utils.formatDuration(act.duration)}</span>
                                                <span>• ${Utils.formatDate(act.date || act.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="btn btn-sm btn-ghost" style="color: var(--accent-rose);" onclick="App.deleteActivity('${act.id}')">
                                        <i data-lucide="trash-2"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    // Timer logic
    formatTimerTime(totalSecs) {
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    startTimer() {
        this.timerRunning = true;
        this.timerInterval = setInterval(() => {
            this.timerSeconds++;
            const el = document.getElementById('timer-display');
            if (el) el.textContent = this.formatTimerTime(this.timerSeconds);
        }, 1000);
        this.renderCurrentPage();
    },

    pauseTimer() {
        this.timerRunning = false;
        clearInterval(this.timerInterval);
        this.renderCurrentPage();
    },

    resumeTimer() {
        this.startTimer();
    },

    resetTimer() {
        this.timerRunning = false;
        clearInterval(this.timerInterval);
        this.timerSeconds = 0;
        this.renderCurrentPage();
    },

    stopAndSaveTimer() {
        this.pauseTimer();
        const minutes = Math.max(1, Math.round(this.timerSeconds / 60));
        this.openAddActivityModal({ duration: minutes });
        this.timerSeconds = 0;
    },

    initActivitiesTimerUI() {
        // Render Lucide icons for timer
    },

    // --------------------------------------------------------------------------
    // PROGRESS VIEW
    // --------------------------------------------------------------------------
    getProgressHTML() {
        const u = this.currentUser;
        const skills = Storage.getUserSkills(u.id).filter(s => s.type === 'learn');
        const streak = AnalyticsEngine.calculateCurrentStreak(u.id);
        const longestStreak = AnalyticsEngine.calculateLongestStreak(u.id);
        const activeDaysWeek = AnalyticsEngine.calculateActiveDaysThisWeek(u.id);
        const activeDaysMonth = AnalyticsEngine.calculateActiveDaysThisMonth(u.id);

        return `
            <div class="animate-fade-in">
                <div style="margin-bottom: 1.5rem;">
                    <h1 style="font-size: 1.65rem;">My Progress & Consistency</h1>
                    <p class="text-secondary" style="font-size: 0.95rem;">Track skill progress, learning streaks, and long-term momentum.</p>
                </div>

                <!-- Streak Metrics Cards -->
                <div class="stats-grid mb-4">
                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Current Streak</span>
                            <span class="stat-value" style="color: #d97706;">${streak} Days</span>
                            <span class="stat-subtext" style="color: #d97706;"><i data-lucide="flame"></i> Active Today</span>
                        </div>
                        <div class="stat-icon-wrapper stat-icon-amber"><i data-lucide="flame"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Longest Streak</span>
                            <span class="stat-value">${longestStreak} Days</span>
                            <span class="stat-subtext"><i data-lucide="award"></i> Personal Best</span>
                        </div>
                        <div class="stat-icon-wrapper stat-icon-purple"><i data-lucide="trophy"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Active This Week</span>
                            <span class="stat-value">${activeDaysWeek} / 7</span>
                            <span class="stat-subtext"><i data-lucide="check"></i> Days with Sessions</span>
                        </div>
                        <div class="stat-icon-wrapper stat-icon-emerald"><i data-lucide="calendar"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Active This Month</span>
                            <span class="stat-value">${activeDaysMonth} / 30</span>
                            <span class="stat-subtext"><i data-lucide="trending-up"></i> Consistency</span>
                        </div>
                        <div class="stat-icon-wrapper stat-icon-indigo"><i data-lucide="activity"></i></div>
                    </div>
                </div>

                <!-- Skill Mastery Progress Bars -->
                <div class="card mb-4">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title"><i data-lucide="trending-up" style="color: var(--primary-500);"></i> Skill Development Progress</h3>
                            <p class="card-subtitle">Current proficiency levels across target learning skills</p>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                        ${skills.map(s => `
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                                    <div style="font-weight: 700; font-size: 0.95rem;">${Utils.escapeHTML(s.name)}</div>
                                    <div style="font-size: 0.85rem; font-weight: 700; color: var(--primary-600);">${s.progress || 20}%</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar-fill" style="width: ${s.progress || 20}%;"></div>
                                </div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 0.25rem;">
                                    <span>Target: ${s.targetLevel || 'Advanced'}</span>
                                    <span>Priority: ${s.priority || 'High'}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Monthly Learning Trend Chart -->
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title"><i data-lucide="bar-chart" style="color: var(--accent-purple);"></i> Progress Over Time</h3>
                            <p class="card-subtitle">Monthly learning & teaching hours progression</p>
                        </div>
                    </div>
                    <div style="height: 260px; position: relative;">
                        <canvas id="progressMonthlyChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    },

    initProgressChart() {
        const canvas = document.getElementById('progressMonthlyChart');
        if (!canvas) return;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const monthly = AnalyticsEngine.calculateMonthlyActivity(this.currentUser.id);

        const ctx = canvas.getContext('2d');
        this.activeCharts.progressMonthly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthly.labels,
                datasets: [
                    {
                        label: 'Learning Hours',
                        data: monthly.learning,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.35
                    },
                    {
                        label: 'Teaching Hours',
                        data: monthly.teaching,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.35
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } },
                    y: { beginAtZero: true, grid: { color: isDark ? '#1e293b' : '#f1f5f9' }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } }
                }
            }
        });
    },

    // --------------------------------------------------------------------------
    // ANALYTICS VIEW
    // --------------------------------------------------------------------------
    getAnalyticsHTML() {
        const u = this.currentUser;
        const totalHours = AnalyticsEngine.calculateLearningHours(u.id);
        const teachHours = AnalyticsEngine.calculateTeachingHours(u.id);
        const totalSessions = AnalyticsEngine.calculateTotalSessions(u.id);
        const knowledgeShares = AnalyticsEngine.calculateKnowledgeShares(u.id);
        const consistency = AnalyticsEngine.calculateConsistency(u.id);
        const insights = AnalyticsEngine.generateDynamicInsights(u.id);

        return `
            <div class="animate-fade-in">
                <div style="margin-bottom: 1.5rem;">
                    <h1 style="font-size: 1.65rem;">Learning Analytics Dashboard</h1>
                    <p class="text-secondary" style="font-size: 0.95rem;">Comprehensive visual metrics, activity breakdown, and intelligent growth insights.</p>
                </div>

                <!-- Key Metrics Cards -->
                <div class="stats-grid mb-4">
                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Total Learning</span>
                            <span class="stat-value">${totalHours} hrs</span>
                            <span class="stat-subtext"><i data-lucide="clock"></i> Focused study</span>
                        </div>
                        <div class="stat-icon-wrapper stat-icon-indigo"><i data-lucide="book-open"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Teaching Hours</span>
                            <span class="stat-value">${teachHours} hrs</span>
                            <span class="stat-subtext"><i data-lucide="share-2"></i> Knowledge shared</span>
                        </div>
                        <div class="stat-icon-wrapper stat-icon-emerald"><i data-lucide="award"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Total Sessions</span>
                            <span class="stat-value">${totalSessions}</span>
                            <span class="stat-subtext"><i data-lucide="check-circle-2"></i> Logged activities</span>
                        </div>
                        <div class="stat-icon-wrapper stat-icon-purple"><i data-lucide="activity"></i></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-label">Consistency Score</span>
                            <span class="stat-value">${consistency}%</span>
                            <span class="stat-subtext"><i data-lucide="trending-up"></i> 30-day index</span>
                        </div>
                        <div class="stat-icon-wrapper stat-icon-amber"><i data-lucide="zap"></i></div>
                    </div>
                </div>

                <!-- 2x2 Charts Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    <!-- Weekly Activity Bar -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i data-lucide="bar-chart-2"></i> Weekly Activity</h3>
                        </div>
                        <div style="height: 220px;"><canvas id="analyticsWeeklyChart"></canvas></div>
                    </div>

                    <!-- Monthly Learning Trend -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i data-lucide="trending-up"></i> Monthly Learning Hours</h3>
                        </div>
                        <div style="height: 220px;"><canvas id="analyticsMonthlyChart"></canvas></div>
                    </div>

                    <!-- Activity Distribution Doughnut -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i data-lucide="pie-chart"></i> Activity Distribution</h3>
                        </div>
                        <div style="height: 220px;"><canvas id="analyticsDistChart"></canvas></div>
                    </div>

                    <!-- Skill Growth Line -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i data-lucide="layers"></i> Skill Growth Comparison</h3>
                        </div>
                        <div style="height: 220px;"><canvas id="analyticsSkillChart"></canvas></div>
                    </div>
                </div>

                <!-- Dynamic Rule-Based AI Insights Section -->
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title"><i data-lucide="sparkles" style="color: var(--primary-500);"></i> Intelligent Learning Insights</h3>
                            <p class="card-subtitle">Automated recommendations computed from your recent activity records</p>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                        ${insights.map(item => `
                            <div style="padding: 1.15rem; border-radius: var(--radius-md); background: var(--bg-surface-alt); border-left: 4px solid var(--primary-500); display: flex; flex-direction: column; gap: 0.4rem;">
                                <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">${item.title}</div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${item.message}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    initAnalyticsCharts() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const gridColor = isDark ? '#1e293b' : '#f1f5f9';

        // 1. Weekly Bar
        const c1 = document.getElementById('analyticsWeeklyChart');
        if (c1) {
            const weekly = AnalyticsEngine.calculateWeeklyActivity(this.currentUser.id);
            this.activeCharts.analyticsWeekly = new Chart(c1.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: weekly.labels.map(d => d.substring(0, 3)),
                    datasets: [{
                        label: 'Hours',
                        data: weekly.data,
                        backgroundColor: '#6366f1',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: textColor } },
                        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }
                    }
                }
            });
        }

        // 2. Monthly Line
        const c2 = document.getElementById('analyticsMonthlyChart');
        if (c2) {
            const monthly = AnalyticsEngine.calculateMonthlyActivity(this.currentUser.id);
            this.activeCharts.analyticsMonthly = new Chart(c2.getContext('2d'), {
                type: 'line',
                data: {
                    labels: monthly.labels,
                    datasets: [{
                        label: 'Learning Hours',
                        data: monthly.learning,
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: textColor } },
                        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }
                    }
                }
            });
        }

        // 3. Activity Distribution Doughnut
        const c3 = document.getElementById('analyticsDistChart');
        if (c3) {
            const dist = AnalyticsEngine.calculateActivityDistribution(this.currentUser.id);
            this.activeCharts.analyticsDist = new Chart(c3.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: dist.labels,
                    datasets: [{
                        data: dist.data,
                        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, color: textColor } }
                    }
                }
            });
        }

        // 4. Skill Growth
        const c4 = document.getElementById('analyticsSkillChart');
        if (c4) {
            const growth = AnalyticsEngine.calculateSkillGrowth(this.currentUser.id);
            this.activeCharts.analyticsSkill = new Chart(c4.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: growth.labels,
                    datasets: [{
                        label: 'Progress %',
                        data: growth.data,
                        backgroundColor: '#10b981',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: textColor } },
                        y: { beginAtZero: true, max: 100, grid: { color: gridColor }, ticks: { color: textColor } }
                    }
                }
            });
        }
    },

    // --------------------------------------------------------------------------
    // RECOMMENDATIONS VIEW
    // --------------------------------------------------------------------------
    getRecommendationsHTML() {
        const u = this.currentUser;
        const partners = RecommendationsEngine.getPartnerRecommendations(u.id, 3);
        const skills = RecommendationsEngine.getSkillRecommendations(u.id, 6);
        const actions = RecommendationsEngine.getActivityRecommendations(u.id);
        const goalTemplates = RecommendationsEngine.getGoalTemplates();

        return `
            <div class="animate-fade-in">
                <div style="margin-bottom: 1.5rem;">
                    <h1 style="font-size: 1.65rem;">Smart Recommendations</h1>
                    <p class="text-secondary" style="font-size: 0.95rem;">Personalized suggestions tailored to your learning goals, skill complementarities, and activity rhythm.</p>
                </div>

                <!-- Next Actionable Steps -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h3 class="card-title"><i data-lucide="zap" style="color: var(--accent-amber);"></i> Recommended Next Steps</h3>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
                        ${actions.map(a => `
                            <div style="padding: 1.25rem; border-radius: var(--radius-md); background: var(--bg-surface-alt); display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;">
                                <div>
                                    <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.35rem;">${a.title}</div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${a.description}</div>
                                </div>
                                <button class="btn btn-sm btn-primary" onclick="App.handleRecommendationAction('${a.actionType}', '${a.targetUserId || ''}')">
                                    ${a.buttonText}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Recommended Complementary Skills -->
                <div class="card mb-4">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title"><i data-lucide="compass" style="color: var(--primary-500);"></i> Skills You May Want to Learn</h3>
                            <p class="card-subtitle">Complementary capabilities that pair naturally with your current skills</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem;">
                        ${skills.map(s => `
                            <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                                <div>
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
                                        <h4 style="font-size: 1.1rem; font-weight: 700;">${Utils.escapeHTML(s.name)}</h4>
                                        <span class="badge badge-primary">${s.category}</span>
                                    </div>
                                    <div style="font-size: 0.75rem; font-weight: 600; color: var(--accent-emerald); margin-bottom: 0.5rem;">
                                        Based on: ${s.basedOn}
                                    </div>
                                    <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4;">${s.reason}</p>
                                </div>
                                <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
                                    <button class="btn btn-sm btn-secondary" style="width: 100%;" onclick="App.openAddSkillModal('learn', '${s.name}', '${s.category}')">
                                        <i data-lucide="plus"></i> Add to My Learning
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Goal Templates -->
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title"><i data-lucide="target" style="color: var(--accent-purple);"></i> Starter Goal Roadmaps</h3>
                            <p class="card-subtitle">Curated goal frameworks with ready-made milestone checklists</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
                        ${goalTemplates.map((gt, idx) => `
                            <div class="goal-card">
                                <div>
                                    <h4 class="goal-title">${Utils.escapeHTML(gt.title)}</h4>
                                    <span class="badge badge-primary" style="margin: 0.35rem 0 0.65rem;">${gt.skill}</span>
                                    <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${gt.description}</p>
                                    <div style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.35rem;">Includes ${gt.milestones.length} structured milestones</div>
                                </div>
                                <button class="btn btn-sm btn-primary" style="margin-top: auto;" onclick="App.adoptGoalTemplate(${idx})">
                                    <i data-lucide="check-circle-2"></i> Adopt Roadmap
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    handleRecommendationAction(actionType, targetUserId) {
        if (actionType === 'start_timer') {
            this.showPage('activities');
        } else if (actionType === 'view_goals') {
            this.showPage('goals');
        } else if (actionType === 'connect_partner' && targetUserId) {
            this.openConnectModal(targetUserId);
        }
    },

    adoptGoalTemplate(templateIndex) {
        const templates = RecommendationsEngine.getGoalTemplates();
        const t = templates[templateIndex];
        if (!t) return;

        this.openAddGoalModal(t);
    },

    // --------------------------------------------------------------------------
    // ACHIEVEMENTS VIEW
    // --------------------------------------------------------------------------
    getAchievementsHTML() {
        const u = this.currentUser;
        const list = AchievementsEngine.getUserAchievementsList(u.id);
        const unlockedCount = list.filter(a => a.unlocked).length;

        return `
            <div class="animate-fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1 style="font-size: 1.65rem;">Badges & Achievements</h1>
                        <p class="text-secondary" style="font-size: 0.95rem;">Unlock milestones by maintaining streaks, completing goals, and sharing knowledge.</p>
                    </div>
                    <span class="badge badge-amber" style="font-size: 0.95rem; padding: 0.5rem 1rem;">
                        🏆 ${unlockedCount} / ${list.length} Unlocked
                    </span>
                </div>

                <div class="achievements-grid">
                    ${list.map(ach => `
                        <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
                            <div class="achievement-top">
                                <div class="achievement-badge-icon">
                                    <i data-lucide="${ach.icon}"></i>
                                </div>
                                <div>
                                    <h4 class="achievement-title">${Utils.escapeHTML(ach.title)}</h4>
                                    <span class="badge ${ach.unlocked ? 'badge-emerald' : 'badge-neutral'}" style="margin-top: 0.2rem;">
                                        ${ach.unlocked ? 'UNLOCKED ✓' : 'LOCKED 🔒'}
                                    </span>
                                </div>
                            </div>

                            <p class="achievement-desc">${Utils.escapeHTML(ach.description)}</p>

                            <div style="margin-top: auto;">
                                <div class="achievement-progress-text">
                                    <span>Progress</span>
                                    <span>${ach.current} / ${ach.target} ${ach.unit}</span>
                                </div>
                                <div class="progress-bar-container" style="margin-top: 0.35rem;">
                                    <div class="progress-bar-fill ${ach.unlocked ? 'success' : ''}" style="width: ${ach.percentage}%;"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // --------------------------------------------------------------------------
    // HISTORY VIEW
    // --------------------------------------------------------------------------
    getHistoryHTML() {
        const u = this.currentUser;
        const activities = Storage.getUserActivities(u.id);

        return `
            <div class="animate-fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1 style="font-size: 1.65rem;">Learning History & Audit Log</h1>
                        <p class="text-secondary" style="font-size: 0.95rem;">Full chronological ledger of your educational sessions and exchanges.</p>
                    </div>
                    <button class="btn btn-secondary" onclick="App.exportActivitiesCSV()">
                        <i data-lucide="download"></i> Export History (CSV)
                    </button>
                </div>

                <div class="card">
                    ${activities.length === 0 ? `
                        <p class="text-secondary" style="padding: 2.5rem; text-align: center;">No activity records available.</p>
                    ` : `
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; text-align: left;">
                                <thead>
                                    <tr style="border-bottom: 2px solid var(--border-subtle); color: var(--text-muted);">
                                        <th style="padding: 0.75rem;">Date</th>
                                        <th style="padding: 0.75rem;">Type</th>
                                        <th style="padding: 0.75rem;">Skill</th>
                                        <th style="padding: 0.75rem;">Duration</th>
                                        <th style="padding: 0.75rem;">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${activities.map(a => `
                                        <tr style="border-bottom: 1px solid var(--border-subtle);">
                                            <td style="padding: 0.85rem 0.75rem; white-space: nowrap;">${Utils.formatDate(a.date || a.createdAt)}</td>
                                            <td style="padding: 0.85rem 0.75rem;"><span class="badge badge-primary">${a.type}</span></td>
                                            <td style="padding: 0.85rem 0.75rem; font-weight: 600;">${Utils.escapeHTML(a.skill)}</td>
                                            <td style="padding: 0.85rem 0.75rem;">${Utils.formatDuration(a.duration)}</td>
                                            <td style="padding: 0.85rem 0.75rem; color: var(--text-secondary);">${Utils.escapeHTML(a.description || a.notes || '')}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    exportActivitiesCSV() {
        const activities = Storage.getUserActivities(this.currentUser.id);
        const csv = Storage.exportToCSV('activities', activities);
        Utils.downloadFile(csv, `cse_activities_${this.currentUser.name.replace(/\s+/g, '_').toLowerCase()}.csv`, 'text/csv');
        Utils.showToast('Activities history exported to CSV', 'success');
    },

    // --------------------------------------------------------------------------
    // COMMUNITY VIEW
    // --------------------------------------------------------------------------
    getCommunityHTML() {
        const users = Storage.getCollection(STORAGE_KEYS.USERS);
        const allActivities = Storage.getCollection(STORAGE_KEYS.ACTIVITIES);

        return `
            <div class="animate-fade-in">
                <div style="margin-bottom: 1.5rem;">
                    <h1 style="font-size: 1.65rem;">Community Hub</h1>
                    <p class="text-secondary" style="font-size: 0.95rem;">Discover what fellow learners and teachers are accomplishing across the network.</p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
                    <!-- Active Learners Leaderboard -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i data-lucide="trophy" style="color: var(--accent-amber);"></i> Top Active Learners</h3>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${users.slice(0, 5).map((u, i) => `
                                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.75rem; background: var(--bg-surface-alt); border-radius: var(--radius-sm); cursor: pointer;" onclick="App.openPublicProfileModal('${u.id}')">
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        <span style="font-family: 'Outfit'; font-weight: 800; color: var(--primary-500); width: 16px;">#${i + 1}</span>
                                        ${Utils.getAvatarHTML(u, 'sm')}
                                        <div>
                                            <div style="font-weight: 700; font-size: 0.9rem;">${Utils.escapeHTML(u.name)}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">${u.userType}</div>
                                        </div>
                                    </div>
                                    <span class="badge badge-emerald">${u.stats?.sharesCompleted || 10} shares</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Trending Skills -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i data-lucide="trending-up" style="color: var(--primary-500);"></i> Trending Skills</h3>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${POPULAR_SKILLS.slice(0, 14).map(ps => `
                                <span class="badge badge-primary" style="padding: 0.45rem 0.85rem; font-size: 0.85rem; cursor: pointer;" onclick="App.showPage('discover')">
                                    ${ps.name}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --------------------------------------------------------------------------
    // MY PROFILE VIEW
    // --------------------------------------------------------------------------
    getMyProfileHTML() {
        const u = this.currentUser;
        const skills = Storage.getUserSkills(u.id);
        const goals = Storage.getUserGoals(u.id);
        const activities = Storage.getUserActivities(u.id);
        const totalHours = AnalyticsEngine.calculateLearningHours(u.id);
        const streak = AnalyticsEngine.calculateCurrentStreak(u.id);
        const achievements = Storage.getUserAchievements(u.id).filter(a => a.unlocked);

        return `
            <div class="animate-fade-in">
                <div style="margin-bottom: 1.5rem;">
                    <h1 style="font-size: 1.65rem;">My Profile</h1>
                    <p class="text-secondary" style="font-size: 0.95rem;">Manage your public presentation, bio, and educational profile.</p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
                    <!-- Profile Card -->
                    <div class="card">
                        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle);">
                            ${Utils.getAvatarHTML(u, 'xl')}
                            <div>
                                <h2 style="font-size: 1.4rem;">${Utils.escapeHTML(u.name)}</h2>
                                <p class="text-secondary" style="font-size: 0.9rem;">${Utils.escapeHTML(u.email || '')}</p>
                                <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 0.5rem;">
                                    <span class="badge badge-primary">${u.userType}</span>
                                    <span class="badge badge-emerald">${u.availability || 'Available'}</span>
                                </div>
                            </div>
                        </div>

                        <div style="padding-top: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.88rem;">
                            <div><strong>Institution / Organization:</strong> <span class="text-secondary">${Utils.escapeHTML(u.institution || 'N/A')}</span></div>
                            <div><strong>Location:</strong> <span class="text-secondary">${Utils.escapeHTML(u.location || 'N/A')}</span></div>
                            <div><strong>Bio:</strong> <p class="text-secondary" style="margin-top: 0.25rem;">${Utils.escapeHTML(u.bio || '')}</p></div>
                            <div>
                                <strong>Interests:</strong>
                                <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.35rem;">
                                    ${(u.interests || []).map(i => `<span class="badge badge-neutral">${Utils.escapeHTML(i)}</span>`).join('')}
                                </div>
                            </div>
                        </div>

                        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                            <button class="btn btn-primary" style="width: 100%;" onclick="App.openEditProfileModal()">
                                <i data-lucide="edit"></i> Edit Profile
                            </button>
                        </div>
                    </div>

                    <!-- Statistics Summary -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i data-lucide="award"></i> Profile Achievements & Stats</h3>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                            <div style="background: var(--bg-surface-alt); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
                                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">SKILLS OFFERED</div>
                                <div style="font-family: 'Outfit'; font-size: 1.5rem; font-weight: 800;">${skills.filter(s => s.type === 'teach').length}</div>
                            </div>
                            <div style="background: var(--bg-surface-alt); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
                                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">SKILLS LEARNING</div>
                                <div style="font-family: 'Outfit'; font-size: 1.5rem; font-weight: 800;">${skills.filter(s => s.type === 'learn').length}</div>
                            </div>
                            <div style="background: var(--bg-surface-alt); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
                                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">LEARNING HOURS</div>
                                <div style="font-family: 'Outfit'; font-size: 1.5rem; font-weight: 800;">${totalHours}</div>
                            </div>
                            <div style="background: var(--bg-surface-alt); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
                                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">STREAK</div>
                                <div style="font-family: 'Outfit'; font-size: 1.5rem; font-weight: 800; color: #d97706;">${streak}d</div>
                            </div>
                        </div>

                        <div>
                            <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.65rem;">Unlocked Badges (${achievements.length})</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                ${achievements.map(a => `
                                    <span class="badge badge-amber" style="padding: 0.4rem 0.75rem;">
                                        🏆 ${Utils.escapeHTML(a.title)}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --------------------------------------------------------------------------
    // SETTINGS VIEW
    // --------------------------------------------------------------------------
    getSettingsHTML() {
        const prefs = Storage.getPreferences();
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

        return `
            <div class="animate-fade-in">
                <div style="margin-bottom: 1.5rem;">
                    <h1 style="font-size: 1.65rem;">System Settings & Data Management</h1>
                    <p class="text-secondary" style="font-size: 0.95rem;">Configure application themes, notification preferences, backup and reset.</p>
                </div>

                <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 800px;">
                    <!-- Appearance Settings -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i data-lucide="moon"></i> Appearance & Theme</h3>
                        </div>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.75rem 1.25rem; border: 1px solid var(--border-medium); border-radius: var(--radius-md); ${currentTheme === 'light' ? 'background: var(--primary-100); border-color: var(--primary-500);' : ''}">
                                <input type="radio" name="theme-radio" value="light" ${currentTheme === 'light' ? 'checked' : ''} onchange="App.applyTheme('light'); Storage.savePreferences({theme: 'light'});">
                                <span>☀️ Light Mode</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.75rem 1.25rem; border: 1px solid var(--border-medium); border-radius: var(--radius-md); ${currentTheme === 'dark' ? 'background: var(--primary-100); border-color: var(--primary-500);' : ''}">
                                <input type="radio" name="theme-radio" value="dark" ${currentTheme === 'dark' ? 'checked' : ''} onchange="App.applyTheme('dark'); Storage.savePreferences({theme: 'dark'});">
                                <span>🌙 Dark Mode</span>
                            </label>
                        </div>
                    </div>

                    <!-- Notification Preferences -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i data-lucide="bell"></i> Notification Preferences</h3>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                                <input type="checkbox" id="pref-conn" ${prefs.notifications?.connections ? 'checked' : ''} onchange="App.saveNotificationPrefs()">
                                <span>Connection requests & messages</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                                <input type="checkbox" id="pref-goals" ${prefs.notifications?.goals ? 'checked' : ''} onchange="App.saveNotificationPrefs()">
                                <span>Goal milestone reminders</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                                <input type="checkbox" id="pref-ach" ${prefs.notifications?.achievements ? 'checked' : ''} onchange="App.saveNotificationPrefs()">
                                <span>Achievement & streak notifications</span>
                            </label>
                        </div>
                    </div>

                    <!-- Data Backup & Reset -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i data-lucide="database"></i> Data Backup, Export & Reset</h3>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                                <button class="btn btn-secondary" onclick="App.exportFullJSON()">
                                    <i data-lucide="download"></i> Export JSON Backup
                                </button>
                                <button class="btn btn-secondary" onclick="App.triggerImportJSON()">
                                    <i data-lucide="upload"></i> Import JSON Backup
                                </button>
                                <input type="file" id="import-json-file" accept=".json" style="display: none;" onchange="App.handleFileImport(event)">
                            </div>

                            <div style="padding-top: 1.25rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                                <div>
                                    <h4 style="font-size: 1rem; color: var(--accent-rose);">Danger Zone</h4>
                                    <p class="text-secondary" style="font-size: 0.82rem;">Erase all stored user profiles, skills, activities, and goals.</p>
                                </div>
                                <button class="btn btn-danger" onclick="App.confirmClearData()">
                                    <i data-lucide="trash-2"></i> Clear All Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    saveNotificationPrefs() {
        const connections = document.getElementById('pref-conn')?.checked || false;
        const goals = document.getElementById('pref-goals')?.checked || false;
        const achievements = document.getElementById('pref-ach')?.checked || false;

        Storage.savePreferences({
            notifications: { connections, goals, achievements }
        });
        Utils.showToast('Notification settings saved', 'success', 2000);
    },

    exportFullJSON() {
        const dataStr = Storage.exportFullData();
        Utils.downloadFile(dataStr, `cse_full_backup_${Date.now()}.json`, 'application/json');
        Utils.showToast('Full application backup downloaded', 'success');
    },

    triggerImportJSON() {
        document.getElementById('import-json-file')?.click();
    },

    handleFileImport(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            Utils.confirm({
                title: 'Import Application Data?',
                message: 'Importing will merge or replace the current state with the uploaded backup file. Continue?',
                confirmText: 'Import Data',
                confirmButtonClass: 'btn-primary',
                onConfirm: () => {
                    const res = Storage.importData(content);
                    if (res.success) {
                        this.currentUser = Storage.getCurrentUser();
                        this.updateHeaderUI();
                        this.showPage('dashboard');
                        Utils.showToast('Data imported successfully!', 'success');
                    } else {
                        Utils.showToast(`Import failed: ${res.error}`, 'error');
                    }
                }
            });
        };
        reader.readAsText(file);
    },

    confirmClearData() {
        Utils.confirm({
            title: 'Clear All Application Data?',
            message: 'Are you sure you want to permanently erase all LocalStorage data? The application will reset to clean state.',
            confirmText: 'Yes, Clear Everything',
            confirmButtonClass: 'btn-danger',
            onConfirm: () => {
                Storage.clearAllData();
                this.currentUser = null;
                Utils.showToast('All data cleared successfully.', 'info');
                this.showLandingView();
            }
        });
    },

    // --------------------------------------------------------------------------
    // GLOBAL SEARCH HANDLER
    // --------------------------------------------------------------------------
    handleGlobalSearch(query) {
        const dropdown = document.getElementById('search-dropdown');
        if (!dropdown) return;

        if (!query || query.trim().length < 2) {
            dropdown.classList.remove('active');
            dropdown.innerHTML = '';
            return;
        }

        const q = query.trim().toLowerCase();
        const users = Storage.getCollection(STORAGE_KEYS.USERS);
        const skills = Storage.getCollection(STORAGE_KEYS.SKILLS);
        const goals = Storage.getCollection(STORAGE_KEYS.GOALS);

        const matchedSkills = [...new Set(skills.filter(s => s.name.toLowerCase().includes(q)).map(s => s.name))].slice(0, 4);
        const matchedUsers = users.filter(u => u.name.toLowerCase().includes(q) || (u.bio && u.bio.toLowerCase().includes(q))).slice(0, 4);
        const matchedGoals = goals.filter(g => g.title.toLowerCase().includes(q) || g.skill.toLowerCase().includes(q)).slice(0, 4);

        if (matchedSkills.length === 0 && matchedUsers.length === 0 && matchedGoals.length === 0) {
            dropdown.innerHTML = `<div style="padding: 1rem; text-align: center; font-size: 0.85rem; color: var(--text-muted);">No results found for "${Utils.escapeHTML(query)}"</div>`;
            dropdown.classList.add('active');
            return;
        }

        let html = '';

        if (matchedSkills.length > 0) {
            html += `
                <div class="search-category-group">
                    <div class="search-category-title">Skills</div>
                    ${matchedSkills.map(s => `
                        <div class="search-result-item" onclick="App.selectSearchResult('skill', '${s}')">
                            <i data-lucide="book-open" style="width: 16px; color: var(--primary-500);"></i>
                            <div class="search-result-text">${Utils.escapeHTML(s)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (matchedUsers.length > 0) {
            html += `
                <div class="search-category-group">
                    <div class="search-category-title">People</div>
                    ${matchedUsers.map(u => `
                        <div class="search-result-item" onclick="App.selectSearchResult('user', '${u.id}')">
                            ${Utils.getAvatarHTML(u, 'sm')}
                            <div>
                                <div class="search-result-text">${Utils.escapeHTML(u.name)}</div>
                                <div class="search-result-subtext">${u.userType}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (matchedGoals.length > 0) {
            html += `
                <div class="search-category-group">
                    <div class="search-category-title">Goals</div>
                    ${matchedGoals.map(g => `
                        <div class="search-result-item" onclick="App.selectSearchResult('goal', '${g.id}')">
                            <i data-lucide="target" style="width: 16px; color: var(--accent-purple);"></i>
                            <div class="search-result-text">${Utils.escapeHTML(g.title)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        dropdown.innerHTML = html;
        dropdown.classList.add('active');
        Utils.renderIcons(dropdown);
    },

    selectSearchResult(type, id) {
        document.getElementById('search-dropdown')?.classList.remove('active');
        const input = document.getElementById('global-search-input');
        if (input) input.value = '';

        if (type === 'skill') {
            this.showPage('discover');
            const searchBox = document.getElementById('discover-search-input');
            if (searchBox) {
                searchBox.value = id;
                this.filterDiscoverCards();
            }
        } else if (type === 'user') {
            this.openPublicProfileModal(id);
        } else if (type === 'goal') {
            this.showPage('goals');
        }
    },

    // --------------------------------------------------------------------------
    // NOTIFICATIONS SYSTEM
    // --------------------------------------------------------------------------
    renderNotificationsList() {
        const drawer = document.getElementById('notifications-drawer');
        if (!drawer) return;

        const notifs = Storage.getUserNotifications(this.currentUser.id);

        drawer.innerHTML = `
            <div style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                <h4 style="font-size: 1rem; font-weight: 700;">Notifications (${notifs.length})</h4>
                <button class="btn btn-sm btn-ghost" onclick="App.markAllNotificationsRead()">Mark all read</button>
            </div>
            <div style="max-height: 360px; overflow-y: auto; padding: 0.5rem;">
                ${notifs.length === 0 ? `
                    <p class="text-secondary" style="padding: 1.5rem; text-align: center; font-size: 0.85rem;">No new notifications</p>
                ` : notifs.map(n => `
                    <div style="padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 0.25rem; background: ${n.read ? 'transparent' : 'var(--bg-surface-alt)'}; cursor: pointer;" onclick="App.handleNotificationClick('${n.id}', '${n.actionUrl || ''}')">
                        <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-main);">${Utils.escapeHTML(n.title)}</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem;">${Utils.escapeHTML(n.message)}</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.35rem;">${Utils.formatRelativeTime(n.createdAt)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    markAllNotificationsRead() {
        const notifs = Storage.getCollection(STORAGE_KEYS.NOTIFICATIONS);
        notifs.forEach(n => {
            if (n.userId === this.currentUser.id) n.read = true;
        });
        Storage.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
        this.updateHeaderUI();
        this.renderNotificationsList();
    },

    handleNotificationClick(notifId, actionUrl) {
        const notif = Storage.getById(STORAGE_KEYS.NOTIFICATIONS, notifId);
        if (notif) {
            notif.read = true;
            Storage.saveItem(STORAGE_KEYS.NOTIFICATIONS, notif);
        }
        document.getElementById('notifications-drawer')?.classList.remove('active');
        this.updateHeaderUI();
        if (actionUrl) this.showPage(actionUrl);
    },

    // --------------------------------------------------------------------------
    // MODALS: ADD / EDIT SKILL
    // --------------------------------------------------------------------------
    openAddSkillModal(type = 'teach', prefillName = '', prefillCat = '') {
        const modalId = 'add-skill-modal';
        let modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.remove();

        modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal-backdrop active';
        modalEl.innerHTML = `
            <div class="modal-card animate-scale-up">
                <div class="modal-header">
                    <h3 class="modal-title">${type === 'teach' ? 'Add Skill I Can Teach' : 'Add Skill I Want to Learn'}</h3>
                    <button class="modal-close-btn" onclick="Utils.closeModal('${modalId}')"><i data-lucide="x"></i></button>
                </div>
                <form id="add-skill-form" onsubmit="App.saveSkillForm(event, '${type}')">
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Skill Name <span class="required">*</span></label>
                            <input type="text" name="name" class="form-input" placeholder="e.g. Python, UI/UX, Public Speaking" value="${Utils.escapeHTML(prefillName)}" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select name="category" class="form-select">
                                ${Object.values(SKILL_CATEGORIES).map(c => `
                                    <option value="${c}" ${c === prefillCat ? 'selected' : ''}>${c}</option>
                                `).join('')}
                            </select>
                        </div>

                        ${type === 'teach' ? `
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Your Proficiency Level <span class="required">*</span></label>
                                    <select name="proficiency" class="form-select">
                                        <option value="Beginner">Beginner (Foundational)</option>
                                        <option value="Intermediate" selected>Intermediate (Competent)</option>
                                        <option value="Advanced">Advanced (High Proficiency)</option>
                                        <option value="Expert">Expert (Mastery / Mentor)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Mentorship Priority <span class="required">*</span></label>
                                    <select name="priority" class="form-select">
                                        <option value="High" selected>High Priority (Actively Mentoring)</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="Low">Low Priority (Occasional)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Experience Summary</label>
                                <input type="text" name="experience" class="form-input" placeholder="e.g. 2+ years building React web apps">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Description / What You Can Teach</label>
                                <textarea name="description" class="form-textarea" placeholder="Key topics, concepts, or tools you can explain..."></textarea>
                            </div>
                        ` : `
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Current / Known Level <span class="required">*</span></label>
                                    <select name="currentLevel" class="form-select">
                                        <option value="Beginner" selected>Beginner (Little to no experience)</option>
                                        <option value="Intermediate">Intermediate (Know fundamentals)</option>
                                        <option value="Advanced">Advanced (Practical experience)</option>
                                        <option value="Expert">Expert (Seeking edge cases)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Target Level <span class="required">*</span></label>
                                    <select name="targetLevel" class="form-select">
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced" selected>Advanced (Proficient)</option>
                                        <option value="Expert">Expert (Complete Mastery)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Learning Priority <span class="required">*</span></label>
                                <select name="priority" class="form-select">
                                    <option value="High" selected>High Priority (Main Active Focus)</option>
                                    <option value="Medium">Medium Priority (Secondary)</option>
                                    <option value="Low">Low Priority (Casual / Long-term)</option>
                                </select>
                            </div>
                        `}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('${modalId}')">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Skill</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modalEl);
        Utils.renderIcons(modalEl);
    },

    saveSkillForm(e, type) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name')?.trim();
        if (!name) {
            Utils.showToast('Please enter a skill name', 'error');
            return;
        }

        const skillRecord = {
            id: Storage.generateId('cse_skills'),
            userId: this.currentUser.id,
            type,
            name,
            category: formData.get('category') || 'Programming',
            createdAt: new Date().toISOString()
        };

        if (type === 'teach') {
            skillRecord.proficiency = formData.get('proficiency') || 'Intermediate';
            skillRecord.priority = formData.get('priority') || 'High';
            skillRecord.experience = formData.get('experience') || '';
            skillRecord.description = formData.get('description') || '';
        } else {
            skillRecord.currentLevel = formData.get('currentLevel') || 'Beginner';
            skillRecord.targetLevel = formData.get('targetLevel') || 'Advanced';
            skillRecord.priority = formData.get('priority') || 'High';
            skillRecord.progress = 0;
        }

        Storage.saveItem(STORAGE_KEYS.SKILLS, skillRecord);
        Utils.closeModal('add-skill-modal');
        AchievementsEngine.evaluateAll(this.currentUser.id, true);
        Utils.showToast(`Skill "${name}" added successfully!`, 'success');
        this.renderCurrentPage();
    },

    openEditSkillModal(skillId) {
        const skill = Storage.getById(STORAGE_KEYS.SKILLS, skillId);
        if (!skill) return;

        const modalId = 'edit-skill-modal';
        let modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.remove();

        modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal-backdrop active';
        modalEl.innerHTML = `
            <div class="modal-card animate-scale-up">
                <div class="modal-header">
                    <h3 class="modal-title">Edit Skill: ${Utils.escapeHTML(skill.name)}</h3>
                    <button class="modal-close-btn" onclick="Utils.closeModal('${modalId}')"><i data-lucide="x"></i></button>
                </div>
                <form id="edit-skill-form" onsubmit="App.saveEditSkillForm(event, '${skill.id}')">
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Skill Name</label>
                            <input type="text" name="name" class="form-input" value="${Utils.escapeHTML(skill.name)}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select name="category" class="form-select">
                                ${Object.values(SKILL_CATEGORIES).map(c => `<option value="${c}" ${c === skill.category ? 'selected' : ''}>${c}</option>`).join('')}
                            </select>
                        </div>
                        ${skill.type === 'teach' ? `
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Your Proficiency Level</label>
                                    <select name="proficiency" class="form-select">
                                        <option value="Beginner" ${skill.proficiency === 'Beginner' ? 'selected' : ''}>Beginner</option>
                                        <option value="Intermediate" ${skill.proficiency === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                                        <option value="Advanced" ${skill.proficiency === 'Advanced' ? 'selected' : ''}>Advanced</option>
                                        <option value="Expert" ${skill.proficiency === 'Expert' ? 'selected' : ''}>Expert</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Mentorship Priority</label>
                                    <select name="priority" class="form-select">
                                        <option value="High" ${skill.priority === 'High' ? 'selected' : ''}>High Priority</option>
                                        <option value="Medium" ${skill.priority === 'Medium' || !skill.priority ? 'selected' : ''}>Medium Priority</option>
                                        <option value="Low" ${skill.priority === 'Low' ? 'selected' : ''}>Low Priority</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Experience Summary</label>
                                <input type="text" name="experience" class="form-input" value="${Utils.escapeHTML(skill.experience || '')}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Description / Mentorship Notes</label>
                                <textarea name="description" class="form-textarea">${Utils.escapeHTML(skill.description || '')}</textarea>
                            </div>
                        ` : `
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Current / Known Level</label>
                                    <select name="currentLevel" class="form-select">
                                        <option value="Beginner" ${skill.currentLevel === 'Beginner' ? 'selected' : ''}>Beginner</option>
                                        <option value="Intermediate" ${skill.currentLevel === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                                        <option value="Advanced" ${skill.currentLevel === 'Advanced' ? 'selected' : ''}>Advanced</option>
                                        <option value="Expert" ${skill.currentLevel === 'Expert' ? 'selected' : ''}>Expert</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Target Level</label>
                                    <select name="targetLevel" class="form-select">
                                        <option value="Beginner" ${skill.targetLevel === 'Beginner' ? 'selected' : ''}>Beginner</option>
                                        <option value="Intermediate" ${skill.targetLevel === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                                        <option value="Advanced" ${skill.targetLevel === 'Advanced' || !skill.targetLevel ? 'selected' : ''}>Advanced</option>
                                        <option value="Expert" ${skill.targetLevel === 'Expert' ? 'selected' : ''}>Expert</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Learning Priority</label>
                                <select name="priority" class="form-select">
                                    <option value="High" ${skill.priority === 'High' ? 'selected' : ''}>High Priority</option>
                                    <option value="Medium" ${skill.priority === 'Medium' ? 'selected' : ''}>Medium Priority</option>
                                    <option value="Low" ${skill.priority === 'Low' ? 'selected' : ''}>Low Priority</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Progress Percentage (0 - 100%)</label>
                                <input type="number" name="progress" min="0" max="100" class="form-input" value="${skill.progress || 0}">
                            </div>
                        `}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('${modalId}')">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Skill</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modalEl);
        Utils.renderIcons(modalEl);
    },

    saveEditSkillForm(e, skillId) {
        e.preventDefault();
        const skill = Storage.getById(STORAGE_KEYS.SKILLS, skillId);
        if (!skill) return;

        const formData = new FormData(e.target);
        skill.name = formData.get('name');
        skill.category = formData.get('category');
        if (skill.type === 'teach') {
            skill.proficiency = formData.get('proficiency');
            skill.priority = formData.get('priority') || 'High';
            skill.experience = formData.get('experience');
            skill.description = formData.get('description');
        } else {
            skill.currentLevel = formData.get('currentLevel') || 'Beginner';
            skill.targetLevel = formData.get('targetLevel') || 'Advanced';
            skill.priority = formData.get('priority') || 'High';
            skill.progress = Number(formData.get('progress')) || 0;
        }

        Storage.saveItem(STORAGE_KEYS.SKILLS, skill);
        Utils.closeModal('edit-skill-modal');
        Utils.showToast('Skill updated successfully!', 'success');
        this.renderCurrentPage();
    },

    deleteSkill(skillId) {
        Utils.confirm({
            title: 'Delete Skill?',
            message: 'Are you sure you want to remove this skill from your portfolio?',
            onConfirm: () => {
                Storage.deleteItem(STORAGE_KEYS.SKILLS, skillId);
                Utils.showToast('Skill deleted', 'info');
                this.renderCurrentPage();
            }
        });
    },

    // --------------------------------------------------------------------------
    // MODALS: ADD / EDIT GOALS & MILESTONES
    // --------------------------------------------------------------------------
    openAddGoalModal(prefill = null) {
        const modalId = 'add-goal-modal';
        let modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.remove();

        const titleVal = prefill?.title || '';
        const skillVal = prefill?.skill || '';
        const descVal = prefill?.description || '';
        const priorityVal = prefill?.priority || 'High';
        const profVal = prefill?.targetProficiency || 'Advanced';
        const dateVal = prefill?.targetDate || '2026-11-30';
        const milesVal = (prefill?.milestones || []).join('\n') || '';

        modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal-backdrop active';
        modalEl.innerHTML = `
            <div class="modal-card animate-scale-up">
                <div class="modal-header">
                    <h3 class="modal-title">${prefill ? 'Customize Roadmap & Goal' : 'Create Learning Goal'}</h3>
                    <button class="modal-close-btn" onclick="Utils.closeModal('${modalId}')"><i data-lucide="x"></i></button>
                </div>
                <form onsubmit="App.saveGoalForm(event)">
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Goal Title <span class="required">*</span></label>
                            <input type="text" name="title" class="form-input" placeholder="e.g. Master React Hooks & API State" value="${Utils.escapeHTML(titleVal)}" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Target Skill <span class="required">*</span></label>
                                <input type="text" name="skill" class="form-input" placeholder="e.g. React" value="${Utils.escapeHTML(skillVal)}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Target Completion Date</label>
                                <input type="date" name="targetDate" class="form-input" value="${dateVal}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Learning Priority <span class="required">*</span></label>
                                <select name="priority" class="form-select">
                                    <option value="High" ${priorityVal === 'High' ? 'selected' : ''}>High Priority (Primary Track)</option>
                                    <option value="Medium" ${priorityVal === 'Medium' ? 'selected' : ''}>Medium Priority</option>
                                    <option value="Low" ${priorityVal === 'Low' ? 'selected' : ''}>Low Priority</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Target Proficiency <span class="required">*</span></label>
                                <select name="targetProficiency" class="form-select">
                                    <option value="Beginner" ${profVal === 'Beginner' ? 'selected' : ''}>Beginner (Foundation)</option>
                                    <option value="Intermediate" ${profVal === 'Intermediate' ? 'selected' : ''}>Intermediate (Working Competency)</option>
                                    <option value="Advanced" ${profVal === 'Advanced' ? 'selected' : ''}>Advanced (Production Proficient)</option>
                                    <option value="Expert" ${profVal === 'Expert' ? 'selected' : ''}>Expert (Complete Mastery)</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description & Success Metric</label>
                            <textarea name="description" class="form-textarea" placeholder="Describe the goal outcome and practical deliverables...">${Utils.escapeHTML(descVal)}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Actionable Milestones (one checklist item per line)</label>
                            <textarea name="milestones" class="form-textarea" placeholder="Understand Fundamentals & Setup\nBuild Interactive Project\nReview with Community Mentor">${Utils.escapeHTML(milesVal)}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('${modalId}')">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Goal</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modalEl);
        Utils.renderIcons(modalEl);
    },

    openEditGoalModal(goalId) {
        const goal = Storage.getById(STORAGE_KEYS.GOALS, goalId);
        if (!goal) return;

        const modalId = 'edit-goal-modal';
        let modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.remove();

        modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal-backdrop active';
        modalEl.innerHTML = `
            <div class="modal-card animate-scale-up">
                <div class="modal-header">
                    <h3 class="modal-title">Edit Learning Goal: ${Utils.escapeHTML(goal.title)}</h3>
                    <button class="modal-close-btn" onclick="Utils.closeModal('${modalId}')"><i data-lucide="x"></i></button>
                </div>
                <form onsubmit="App.saveEditGoalForm(event, '${goal.id}')">
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Goal Title <span class="required">*</span></label>
                            <input type="text" name="title" class="form-input" value="${Utils.escapeHTML(goal.title)}" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Target Skill</label>
                                <input type="text" name="skill" class="form-input" value="${Utils.escapeHTML(goal.skill)}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Target Date</label>
                                <input type="date" name="targetDate" class="form-input" value="${goal.targetDate || '2026-12-31'}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Priority</label>
                                <select name="priority" class="form-select">
                                    <option value="High" ${goal.priority === 'High' ? 'selected' : ''}>High Priority</option>
                                    <option value="Medium" ${goal.priority === 'Medium' ? 'selected' : ''}>Medium Priority</option>
                                    <option value="Low" ${goal.priority === 'Low' ? 'selected' : ''}>Low Priority</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Target Proficiency</label>
                                <select name="targetProficiency" class="form-select">
                                    <option value="Beginner" ${goal.targetProficiency === 'Beginner' ? 'selected' : ''}>Beginner</option>
                                    <option value="Intermediate" ${goal.targetProficiency === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                                    <option value="Advanced" ${goal.targetProficiency === 'Advanced' || !goal.targetProficiency ? 'selected' : ''}>Advanced</option>
                                    <option value="Expert" ${goal.targetProficiency === 'Expert' ? 'selected' : ''}>Expert</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea name="description" class="form-textarea">${Utils.escapeHTML(goal.description || '')}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Milestones (one per line)</label>
                            <textarea name="milestones" class="form-textarea">${(goal.milestones || []).map(m => m.text).join('\n')}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('${modalId}')">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Goal</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modalEl);
        Utils.renderIcons(modalEl);
    },

    saveEditGoalForm(e, goalId) {
        e.preventDefault();
        const goal = Storage.getById(STORAGE_KEYS.GOALS, goalId);
        if (!goal) return;

        const fd = new FormData(e.target);
        goal.title = fd.get('title')?.trim() || goal.title;
        goal.skill = fd.get('skill')?.trim() || goal.skill;
        goal.targetDate = fd.get('targetDate') || goal.targetDate;
        goal.priority = fd.get('priority') || 'High';
        goal.targetProficiency = fd.get('targetProficiency') || 'Advanced';
        goal.description = fd.get('description') || '';

        const existingMap = {};
        (goal.milestones || []).forEach(m => { existingMap[m.text] = m.completed; });

        const lines = (fd.get('milestones') || '').split('\n').map(s => s.trim()).filter(Boolean);
        goal.milestones = lines.map((text, i) => ({
            id: `m_${Date.now()}_${i}`,
            text,
            completed: existingMap[text] || false
        }));

        const total = goal.milestones.length;
        const comp = goal.milestones.filter(m => m.completed).length;
        goal.progress = total > 0 ? Math.round((comp / total) * 100) : 0;
        if (goal.progress === 100) goal.status = 'Completed';
        else goal.status = 'In Progress';

        Storage.saveItem(STORAGE_KEYS.GOALS, goal);
        Utils.closeModal('edit-goal-modal');
        Utils.showToast('Goal updated successfully!', 'success');
        this.renderCurrentPage();
    },

    saveGoalForm(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const title = fd.get('title')?.trim();
        const skill = fd.get('skill')?.trim();
        if (!title || !skill) return;

        const rawMilestones = (fd.get('milestones') || '').split('\n').map(s => s.trim()).filter(Boolean);
        const milestones = rawMilestones.map((m, i) => ({
            id: `m_${Date.now()}_${i}`,
            text: m,
            completed: false
        }));

        const goal = {
            id: Storage.generateId('cse_learning_goals'),
            userId: this.currentUser.id,
            title,
            skill,
            targetDate: fd.get('targetDate') || '2026-12-31',
            startDate: new Date().toISOString().split('T')[0],
            priority: fd.get('priority') || 'High',
            targetProficiency: fd.get('targetProficiency') || 'Advanced',
            description: fd.get('description') || '',
            progress: 0,
            status: 'In Progress',
            milestones
        };

        Storage.saveItem(STORAGE_KEYS.GOALS, goal);
        Utils.closeModal('add-goal-modal');
        AchievementsEngine.evaluateAll(this.currentUser.id, true);
        Utils.showToast(`Learning goal "${title}" created!`, 'success');
        this.renderCurrentPage();
    },

    toggleMilestone(goalId, milestoneId) {
        const goal = Storage.getById(STORAGE_KEYS.GOALS, goalId);
        if (!goal) return;

        const ms = (goal.milestones || []).find(m => m.id === milestoneId);
        if (ms) {
            ms.completed = !ms.completed;

            // Recalculate goal progress %
            const total = goal.milestones.length;
            const completed = goal.milestones.filter(m => m.completed).length;
            goal.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            if (goal.progress === 100) {
                goal.status = 'Completed';
                Utils.celebrate();
                Utils.showToast(`🎉 Goal "${goal.title}" fully achieved!`, 'success');
            } else {
                goal.status = 'In Progress';
            }

            Storage.saveItem(STORAGE_KEYS.GOALS, goal);
            AchievementsEngine.evaluateAll(this.currentUser.id, true);
            this.renderCurrentPage();
        }
    },

    markGoalComplete(goalId) {
        const goal = Storage.getById(STORAGE_KEYS.GOALS, goalId);
        if (!goal) return;

        goal.progress = 100;
        goal.status = 'Completed';
        (goal.milestones || []).forEach(m => m.completed = true);

        Storage.saveItem(STORAGE_KEYS.GOALS, goal);
        Utils.celebrate();
        AchievementsEngine.evaluateAll(this.currentUser.id, true);
        Utils.showToast(`🏆 Goal "${goal.title}" marked as Complete!`, 'success');
        this.renderCurrentPage();
    },

    deleteGoal(goalId) {
        Utils.confirm({
            title: 'Delete Learning Goal?',
            message: 'Are you sure you want to delete this goal and its milestones?',
            onConfirm: () => {
                Storage.deleteItem(STORAGE_KEYS.GOALS, goalId);
                Utils.showToast('Goal deleted', 'info');
                this.renderCurrentPage();
            }
        });
    },

    // --------------------------------------------------------------------------
    // MODALS: ADD ACTIVITY
    // --------------------------------------------------------------------------
    openAddActivityModal(prefills = {}) {
        const modalId = 'add-act-modal';
        let modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.remove();

        const skills = Storage.getUserSkills(this.currentUser.id);

        modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal-backdrop active';
        modalEl.innerHTML = `
            <div class="modal-card animate-scale-up">
                <div class="modal-header">
                    <h3 class="modal-title">Record Learning / Teaching Session</h3>
                    <button class="modal-close-btn" onclick="Utils.closeModal('${modalId}')"><i data-lucide="x"></i></button>
                </div>
                <form onsubmit="App.saveActivityForm(event)">
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Activity Type</label>
                            <select name="type" class="form-select">
                                <option value="Learning Session" selected>Learning Session</option>
                                <option value="Teaching Session">Teaching Session</option>
                                <option value="Practice Session">Practice Session</option>
                                <option value="Knowledge Sharing">Knowledge Sharing</option>
                                <option value="Project Work">Project Work</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Skill</label>
                                <input type="text" name="skill" class="form-input" placeholder="e.g. Python, UI/UX" value="${skills[0]?.name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Duration (Minutes)</label>
                                <input type="number" name="duration" class="form-input" min="5" max="600" value="${prefills.duration || 60}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Session Description</label>
                            <input type="text" name="description" class="form-input" placeholder="e.g. Worked through async await and error handling" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Session Notes</label>
                            <textarea name="notes" class="form-textarea" placeholder="Key takeaways or discussion points..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('${modalId}')">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Session</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modalEl);
        Utils.renderIcons(modalEl);
    },

    saveActivityForm(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const skill = fd.get('skill')?.trim();
        const description = fd.get('description')?.trim();
        const duration = Number(fd.get('duration')) || 60;
        if (!skill || !description) return;

        const record = {
            id: Storage.generateId('cse_learning_activities'),
            userId: this.currentUser.id,
            type: fd.get('type') || 'Learning Session',
            skill,
            duration,
            description,
            notes: fd.get('notes') || '',
            date: new Date().toISOString()
        };

        Storage.saveItem(STORAGE_KEYS.ACTIVITIES, record);
        Utils.closeModal('add-act-modal');
        AchievementsEngine.evaluateAll(this.currentUser.id, true);
        this.updateHeaderUI();
        Utils.showToast(`Logged ${duration} min session for ${skill}!`, 'success');
        this.renderCurrentPage();
    },

    deleteActivity(activityId) {
        Utils.confirm({
            title: 'Delete Activity Record?',
            message: 'Are you sure you want to remove this logged activity?',
            onConfirm: () => {
                Storage.deleteItem(STORAGE_KEYS.ACTIVITIES, activityId);
                AchievementsEngine.evaluateAll(this.currentUser.id, false);
                this.updateHeaderUI();
                Utils.showToast('Activity record deleted', 'info');
                this.renderCurrentPage();
            }
        });
    },

    // --------------------------------------------------------------------------
    // MODALS: CONNECT & PUBLIC PROFILE
    // --------------------------------------------------------------------------
    openConnectModal(targetUserId) {
        const targetUser = Storage.getById(STORAGE_KEYS.USERS, targetUserId);
        if (!targetUser) return;

        const match = MatchingEngine.calculateMatchScore(this.currentUser, targetUser);
        const modalId = 'connect-modal';
        let modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.remove();

        modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal-backdrop active';
        modalEl.innerHTML = `
            <div class="modal-card animate-scale-up">
                <div class="modal-header">
                    <h3 class="modal-title">Connect with ${Utils.escapeHTML(targetUser.name)}</h3>
                    <button class="modal-close-btn" onclick="Utils.closeModal('${modalId}')"><i data-lucide="x"></i></button>
                </div>
                <form onsubmit="App.sendConnectionRequest(event, '${targetUser.id}')">
                    <div class="modal-body">
                        <div style="display: flex; align-items: center; gap: 1rem; padding: 0.85rem; background: var(--bg-surface-alt); border-radius: var(--radius-md); margin-bottom: 1rem;">
                            ${Utils.getAvatarHTML(targetUser, 'md')}
                            <div>
                                <div style="font-weight: 700;">${Utils.escapeHTML(targetUser.name)}</div>
                                <div style="font-size: 0.78rem; color: var(--text-muted);">${targetUser.userType} • ${match.score}% Compatibility</div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Skill Exchange Invitation Message</label>
                            <textarea name="message" class="form-textarea" placeholder="Hi ${Utils.escapeHTML(targetUser.name)}, I'd love to exchange skills! I can teach you ${match.teachingOpportunities.join(', ') || 'my skills'} in exchange for ${match.learningOpportunities.join(', ') || 'your mentorship'}.">Hi ${Utils.escapeHTML(targetUser.name)}, I would love to connect for a mutual skill exchange!</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('${modalId}')">Cancel</button>
                        <button type="submit" class="btn btn-primary"><i data-lucide="send"></i> Send Invitation</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modalEl);
        Utils.renderIcons(modalEl);
    },

    sendConnectionRequest(e, targetUserId) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const message = fd.get('message') || '';

        const record = {
            id: Storage.generateId('cse_connections'),
            senderId: this.currentUser.id,
            receiverId: targetUserId,
            status: 'Pending',
            message,
            createdAt: new Date().toISOString()
        };

        Storage.saveItem(STORAGE_KEYS.CONNECTIONS, record);

        // Add notification for receiver (in local simulated universe)
        Storage.saveItem(STORAGE_KEYS.NOTIFICATIONS, {
            userId: targetUserId,
            type: 'connection',
            title: 'New Connection Request',
            message: `${this.currentUser.name} sent you a skill exchange connection invitation.`,
            read: false,
            actionUrl: 'connections'
        });

        Utils.closeModal('connect-modal');
        Utils.showToast('Connection invitation sent successfully!', 'success');
    },

    handleConnectionAction(connectionId, action) {
        const conn = Storage.getById(STORAGE_KEYS.CONNECTIONS, connectionId);
        if (!conn) return;

        if (action === 'accept') {
            conn.status = 'Accepted';
            conn.updatedAt = new Date().toISOString();
            Storage.saveItem(STORAGE_KEYS.CONNECTIONS, conn);
            Utils.showToast('Connection accepted!', 'success');
        } else if (action === 'reject') {
            conn.status = 'Rejected';
            Storage.saveItem(STORAGE_KEYS.CONNECTIONS, conn);
            Utils.showToast('Connection rejected', 'info');
        }
        this.renderCurrentPage();
    },

    removeConnection(connectionId) {
        Utils.confirm({
            title: 'Remove Connection?',
            message: 'Are you sure you want to remove this connection?',
            onConfirm: () => {
                Storage.deleteItem(STORAGE_KEYS.CONNECTIONS, connectionId);
                Utils.showToast('Connection removed', 'info');
                this.renderCurrentPage();
            }
        });
    },

    openPublicProfileModal(userId) {
        const user = Storage.getById(STORAGE_KEYS.USERS, userId);
        if (!user) return;

        const skills = Storage.getCollection(STORAGE_KEYS.SKILLS).filter(s => s.userId === user.id);
        const teach = skills.filter(s => s.type === 'teach');
        const learn = skills.filter(s => s.type === 'learn');
        const match = MatchingEngine.calculateMatchScore(this.currentUser, user);

        const modalId = 'public-profile-modal';
        let modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.remove();

        modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal-backdrop active';
        modalEl.innerHTML = `
            <div class="modal-card modal-card-lg animate-scale-up">
                <div class="modal-header">
                    <h3 class="modal-title">Learner Profile</h3>
                    <button class="modal-close-btn" onclick="Utils.closeModal('${modalId}')"><i data-lucide="x"></i></button>
                </div>
                <div class="modal-body">
                    <div style="display: flex; align-items: center; gap: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap;">
                        ${Utils.getAvatarHTML(user, 'lg')}
                        <div style="flex: 1;">
                            <h3 style="font-size: 1.35rem; font-weight: 700;">${Utils.escapeHTML(user.name)}</h3>
                            <div style="font-size: 0.85rem; color: var(--text-muted);">${user.userType} • ${Utils.escapeHTML(user.institution || user.location || '')}</div>
                            <div style="margin-top: 0.35rem;">
                                <span class="match-score-pill ${match.score >= 80 ? 'high' : ''}">${match.score}% Exchange Match</span>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="Utils.closeModal('${modalId}'); App.openConnectModal('${user.id}')">
                            <i data-lucide="user-plus"></i> Connect
                        </button>
                    </div>

                    <div style="padding: 1rem 0;">
                        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.35rem;">About</h4>
                        <p style="font-size: 0.88rem; color: var(--text-secondary);">${Utils.escapeHTML(user.bio || 'Passionate community learner.')}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 0.5rem;">
                        <div style="background: var(--bg-surface-alt); padding: 1rem; border-radius: var(--radius-md);">
                            <div style="font-weight: 700; font-size: 0.9rem; color: var(--accent-emerald); margin-bottom: 0.5rem;">Skills They Teach</div>
                            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                                ${teach.map(t => `<div style="font-size: 0.82rem;">• <strong>${Utils.escapeHTML(t.name)}</strong> (${t.proficiency || 'Intermediate'})</div>`).join('')}
                            </div>
                        </div>

                        <div style="background: var(--bg-surface-alt); padding: 1rem; border-radius: var(--radius-md);">
                            <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary-500); margin-bottom: 0.5rem;">Skills They Learn</div>
                            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                                ${learn.map(l => `<div style="font-size: 0.82rem;">• <strong>${Utils.escapeHTML(l.name)}</strong> (Target: ${l.targetLevel || 'Adv'})</div>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalEl);
        Utils.renderIcons(modalEl);
    },

    openEditProfileModal() {
        const u = this.currentUser;
        const modalId = 'edit-profile-modal';
        let modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.remove();

        modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal-backdrop active';
        modalEl.innerHTML = `
            <div class="modal-card animate-scale-up">
                <div class="modal-header">
                    <h3 class="modal-title">Edit My Profile</h3>
                    <button class="modal-close-btn" onclick="Utils.closeModal('${modalId}')"><i data-lucide="x"></i></button>
                </div>
                <form onsubmit="App.saveProfileForm(event)">
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input type="text" name="name" class="form-input" value="${Utils.escapeHTML(u.name)}" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">User Type</label>
                                <select name="userType" class="form-select">
                                    <option value="Student" ${u.userType === 'Student' ? 'selected' : ''}>Student</option>
                                    <option value="Professional" ${u.userType === 'Professional' ? 'selected' : ''}>Professional</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Availability</label>
                                <select name="availability" class="form-select">
                                    <option value="Available" ${u.availability === 'Available' ? 'selected' : ''}>Available</option>
                                    <option value="Busy" ${u.availability === 'Busy' ? 'selected' : ''}>Busy</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Institution / Organization</label>
                            <input type="text" name="institution" class="form-input" value="${Utils.escapeHTML(u.institution || '')}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Location</label>
                            <input type="text" name="location" class="form-input" value="${Utils.escapeHTML(u.location || '')}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Bio</label>
                            <textarea name="bio" class="form-textarea">${Utils.escapeHTML(u.bio || '')}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Interests (comma-separated)</label>
                            <input type="text" name="interests" class="form-input" value="${Utils.escapeHTML((u.interests || []).join(', '))}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="Utils.closeModal('${modalId}')">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Profile</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modalEl);
        Utils.renderIcons(modalEl);
    },

    saveProfileForm(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        this.currentUser.name = fd.get('name');
        this.currentUser.userType = fd.get('userType');
        this.currentUser.availability = fd.get('availability');
        this.currentUser.institution = fd.get('institution');
        this.currentUser.location = fd.get('location');
        this.currentUser.bio = fd.get('bio');
        this.currentUser.interests = (fd.get('interests') || '').split(',').map(s => s.trim()).filter(Boolean);

        Storage.saveItem(STORAGE_KEYS.USERS, this.currentUser);
        Utils.closeModal('edit-profile-modal');
        this.updateHeaderUI();
        Utils.showToast('Profile updated successfully!', 'success');
        this.renderCurrentPage();
    },

    // --------------------------------------------------------------------------
    // LANDING PAGE CONTROLLER
    // --------------------------------------------------------------------------
    renderLandingPage() {
        const landing = document.getElementById('landing-view');
        if (!landing) return;

        // Ensure community users and their past data are in storage
        if (typeof loadCommunityData === 'function') {
            loadCommunityData(false);
        }

        const users = Storage.getCollection(STORAGE_KEYS.USERS);

        landing.innerHTML = `
            <div style="min-height: 100vh; display: flex; flex-direction: column;">
                <!-- Navbar -->
                <nav style="display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2.5rem; background: var(--header-bg); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border-subtle); position: sticky; top: 0; z-index: 50;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="brand-icon"><i data-lucide="shuffle"></i></div>
                        <div>
                            <div class="brand-title">Community Skill Exchange</div>
                            <div class="brand-subtitle">Learn • Share • Connect • Grow</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem;" id="landing-nav-actions">
                        <button class="btn btn-outline" onclick="App.switchAuthTab('signup')">
                            <i data-lucide="user-plus"></i> Sign Up
                        </button>
                        <button class="btn btn-primary" onclick="App.switchAuthTab('signin')">
                            <i data-lucide="log-in"></i> Sign In
                        </button>
                    </div>
                </nav>

                <!-- Clean, Standard Website Authentication Screen -->
                <section style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 3rem 1.5rem; background: var(--bg-surface-alt);">
                    <div class="card" id="auth-card-wrapper" style="width: 100%; max-width: 440px; padding: 2.25rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-lg); border-radius: var(--radius-lg);">
                        
                        <!-- Auth Mode Tabs (Sign In / Sign Up) -->
                        <div style="display: flex; border-bottom: 2px solid var(--border-subtle); margin-bottom: 1.75rem;">
                            <button type="button" id="tab-btn-signin" class="auth-tab-btn active" style="flex: 1; padding: 0.75rem; font-weight: 700; font-size: 1rem; border: none; background: none; cursor: pointer; color: var(--primary-600); border-bottom: 2px solid var(--primary-600); margin-bottom: -2px;" onclick="App.switchAuthTab('signin')">
                                Sign In
                            </button>
                            <button type="button" id="tab-btn-signup" class="auth-tab-btn" style="flex: 1; padding: 0.75rem; font-weight: 700; font-size: 1rem; border: none; background: none; cursor: pointer; color: var(--text-muted); border-bottom: 2px solid transparent; margin-bottom: -2px;" onclick="App.switchAuthTab('signup')">
                                Sign Up
                            </button>
                        </div>

                        <!-- 1. SIGN IN FORM -->
                        <div id="auth-signin-container">
                            <div style="text-align: center; margin-bottom: 1.5rem;">
                                <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.35rem;">Welcome Back</h2>
                                <p class="text-secondary" style="font-size: 0.88rem;">Enter your email to sign in to your account</p>
                            </div>

                            <form id="form-signin" onsubmit="App.handleStandardSignIn(event)">
                                <div class="form-group mb-3">
                                    <label class="form-label">Email Address <span class="required">*</span></label>
                                    <div style="position: relative;">
                                        <i data-lucide="mail" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); width: 16px; color: var(--text-muted);"></i>
                                        <input type="email" id="signin-email" class="form-input" style="padding-left: 2.5rem;" placeholder="name@example.com" required>
                                    </div>
                                </div>

                                <div class="form-group mb-3">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                                        <label class="form-label" style="margin-bottom: 0;">Password <span class="required">*</span></label>
                                        <a href="javascript:void(0)" style="font-size: 0.8rem; color: var(--primary-600); text-decoration: none;" onclick="Utils.showToast('Demo mode: enter any password to continue.', 'info')">Forgot password?</a>
                                    </div>
                                    <div style="position: relative;">
                                        <i data-lucide="lock" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); width: 16px; color: var(--text-muted);"></i>
                                        <input type="password" id="signin-password" class="form-input" style="padding-left: 2.5rem;" placeholder="••••••••" required>
                                    </div>
                                </div>

                                <div class="form-group mb-4" style="display: flex; align-items: center; gap: 0.5rem;">
                                    <input type="checkbox" id="signin-remember" style="accent-color: var(--primary-600); cursor: pointer;" checked>
                                    <label for="signin-remember" style="font-size: 0.85rem; color: var(--text-secondary); cursor: pointer; margin-bottom: 0;">Remember me</label>
                                </div>

                                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 0.75rem; font-size: 0.95rem; font-weight: 700;">
                                    <i data-lucide="log-in"></i> Sign In
                                </button>
                            </form>

                            <div style="text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: var(--text-secondary);">
                                Don't have an account? 
                                <a href="javascript:void(0)" style="color: var(--primary-600); font-weight: 700; text-decoration: none; margin-left: 0.25rem;" onclick="App.switchAuthTab('signup')">Sign up</a>
                            </div>

                            <div style="margin-top: 1.5rem; padding: 0.75rem; background: var(--bg-surface-alt); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.78rem; color: var(--text-muted); text-align: center;">
                                💡 Registered demo: <code style="color: var(--primary-600);">aravind.sharma@example.com</code> (any password)
                            </div>
                        </div>

                        <!-- 2. SIGN UP FORM -->
                        <div id="auth-signup-container" style="display: none;">
                            <div style="text-align: center; margin-bottom: 1.5rem;">
                                <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.35rem;">Create an Account</h2>
                                <p class="text-secondary" style="font-size: 0.88rem;">Join the peer-to-peer skill exchange community</p>
                            </div>

                            <form id="form-signup" onsubmit="App.handleStandardSignUp(event)">
                                <div class="form-group mb-3">
                                    <label class="form-label">Full Name <span class="required">*</span></label>
                                    <div style="position: relative;">
                                        <i data-lucide="user" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); width: 16px; color: var(--text-muted);"></i>
                                        <input type="text" id="signup-name" class="form-input" style="padding-left: 2.5rem;" placeholder="e.g. Alex Johnson" required>
                                    </div>
                                </div>

                                <div class="form-group mb-3">
                                    <label class="form-label">Email Address <span class="required">*</span></label>
                                    <div style="position: relative;">
                                        <i data-lucide="mail" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); width: 16px; color: var(--text-muted);"></i>
                                        <input type="email" id="signup-email" class="form-input" style="padding-left: 2.5rem;" placeholder="you@example.com" required>
                                    </div>
                                </div>

                                <div class="form-group mb-3">
                                    <label class="form-label">Password <span class="required">*</span></label>
                                    <div style="position: relative;">
                                        <i data-lucide="lock" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); width: 16px; color: var(--text-muted);"></i>
                                        <input type="password" id="signup-password" class="form-input" style="padding-left: 2.5rem;" placeholder="Create a strong password" required>
                                    </div>
                                </div>

                                <div class="form-row mb-3" style="display: flex; gap: 0.75rem;">
                                    <div class="form-group" style="flex: 1;">
                                        <label class="form-label">Role</label>
                                        <select id="signup-role" class="form-select">
                                            <option value="Student">Student</option>
                                            <option value="Professional">Professional</option>
                                        </select>
                                    </div>
                                    <div class="form-group" style="flex: 1;">
                                        <label class="form-label">Institution</label>
                                        <input type="text" id="signup-inst" class="form-input" placeholder="e.g. University / Company">
                                    </div>
                                </div>

                                <div class="form-group mb-3">
                                    <label class="form-label">Skill You Can Teach</label>
                                    <input type="text" id="signup-teach" class="form-input" placeholder="e.g. Python, UI/UX Design, Public Speaking">
                                </div>

                                <div class="form-group mb-4">
                                    <label class="form-label">Skill You Want to Learn</label>
                                    <input type="text" id="signup-learn" class="form-input" placeholder="e.g. Machine Learning, React, Figma">
                                </div>

                                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 0.75rem; font-size: 0.95rem; font-weight: 700;">
                                    <i data-lucide="user-plus"></i> Create Account
                                </button>
                            </form>

                            <div style="text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: var(--text-secondary);">
                                Already have an account? 
                                <a href="javascript:void(0)" style="color: var(--primary-600); font-weight: 700; text-decoration: none; margin-left: 0.25rem;" onclick="App.switchAuthTab('signin')">Sign In</a>
                            </div>
                        </div>

                    </div>
                </section>

                <!-- How It Works Section -->
                <section style="padding: 4rem 2rem; background: var(--bg-surface-alt); border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);">
                    <div style="max-width: 1100px; margin: 0 auto;">
                        <div style="text-align: center; margin-bottom: 3rem;">
                            <h2 style="font-size: 2.2rem; margin-bottom: 0.5rem;">How It Works</h2>
                            <p class="text-secondary">Five simple steps to level up your expertise through mutual skill exchange.</p>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            <div class="card" style="text-align: center;">
                                <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(99, 102, 241, 0.15); color: var(--primary-500); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                                    <i data-lucide="user-plus"></i>
                                </div>
                                <h4 style="font-size: 1.1rem; margin-bottom: 0.35rem;">1. Create Profile</h4>
                                <p style="font-size: 0.85rem; color: var(--text-secondary);">Tell the community who you are.</p>
                            </div>

                            <div class="card" style="text-align: center;">
                                <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                                    <i data-lucide="award"></i>
                                </div>
                                <h4 style="font-size: 1.1rem; margin-bottom: 0.35rem;">2. Add Skills</h4>
                                <p style="font-size: 0.85rem; color: var(--text-secondary);">Show what you can teach and want to learn.</p>
                            </div>

                            <div class="card" style="text-align: center;">
                                <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                                    <i data-lucide="compass"></i>
                                </div>
                                <h4 style="font-size: 1.1rem; margin-bottom: 0.35rem;">3. Discover People</h4>
                                <p style="font-size: 0.85rem; color: var(--text-secondary);">Find peers with complementary skills.</p>
                            </div>

                            <div class="card" style="text-align: center;">
                                <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(139, 92, 246, 0.15); color: var(--accent-purple); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                                    <i data-lucide="shuffle"></i>
                                </div>
                                <h4 style="font-size: 1.1rem; margin-bottom: 0.35rem;">4. Exchange Skills</h4>
                                <p style="font-size: 0.85rem; color: var(--text-secondary);">Learn while sharing your own expertise.</p>
                            </div>

                            <div class="card" style="text-align: center;">
                                <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(244, 63, 94, 0.15); color: var(--accent-rose); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                                    <i data-lucide="trending-up"></i>
                                </div>
                                <h4 style="font-size: 1.1rem; margin-bottom: 0.35rem;">5. Track Growth</h4>
                                <p style="font-size: 0.85rem; color: var(--text-secondary);">Monitor goals, streaks, and achievements.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Popular Skills Section -->
                <section style="padding: 4rem 2rem; max-width: 1000px; margin: 0 auto; text-align: center;">
                    <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Popular Skills in the Network</h2>
                    <p class="text-secondary" style="margin-bottom: 2rem;">Explore in-demand topics shared across our learning community</p>
                    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem;">
                        ${POPULAR_SKILLS.map(ps => `
                            <div class="card" style="padding: 0.65rem 1.25rem; font-weight: 600; font-size: 0.95rem; border-radius: var(--radius-full);">
                                ${ps.name}
                            </div>
                        `).join('')}
                    </div>
                </section>

                <!-- Footer -->
                <footer style="margin-top: auto; padding: 2rem; text-align: center; border-top: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.85rem;">
                    Community Skill Exchange &copy; 2026. Built with Vanilla HTML5, CSS3, ES6+ JavaScript & LocalStorage.
                </footer>
            </div>
        `;

        Utils.renderIcons(landing);
    },

    switchAuthTab(tab = 'signin') {
        const signinContainer = document.getElementById('auth-signin-container');
        const signupContainer = document.getElementById('auth-signup-container');
        const tabSignin = document.getElementById('tab-btn-signin');
        const tabSignup = document.getElementById('tab-btn-signup');

        if (!signinContainer || !signupContainer) return;

        if (tab === 'signin') {
            signinContainer.style.display = 'block';
            signupContainer.style.display = 'none';
            if (tabSignin) {
                tabSignin.classList.add('active');
                tabSignin.style.color = 'var(--primary-600)';
                tabSignin.style.borderBottom = '2px solid var(--primary-600)';
            }
            if (tabSignup) {
                tabSignup.classList.remove('active');
                tabSignup.style.color = 'var(--text-muted)';
                tabSignup.style.borderBottom = '2px solid transparent';
            }
            const emailEl = document.getElementById('signin-email');
            if (emailEl) setTimeout(() => emailEl.focus(), 50);
        } else {
            signinContainer.style.display = 'none';
            signupContainer.style.display = 'block';
            if (tabSignup) {
                tabSignup.classList.add('active');
                tabSignup.style.color = 'var(--primary-600)';
                tabSignup.style.borderBottom = '2px solid var(--primary-600)';
            }
            if (tabSignin) {
                tabSignin.classList.remove('active');
                tabSignin.style.color = 'var(--text-muted)';
                tabSignin.style.borderBottom = '2px solid transparent';
            }
            const nameEl = document.getElementById('signup-name');
            if (nameEl) setTimeout(() => nameEl.focus(), 50);
        }

        const authCard = document.getElementById('auth-card-wrapper');
        if (authCard && window.scrollY > 200) {
            authCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    handleStandardSignIn(e) {
        if (e && e.preventDefault) e.preventDefault();
        const emailInput = document.getElementById('signin-email');
        const passwordInput = document.getElementById('signin-password');
        if (!emailInput) return;

        const email = (emailInput.value || '').trim().toLowerCase();
        const password = passwordInput ? passwordInput.value : '';

        if (!email) {
            Utils.showToast('Please enter your email address to sign in.', 'warning', 3000);
            emailInput.focus();
            return;
        }

        const users = Storage.getCollection(STORAGE_KEYS.USERS);
        let matched = users.find(u => (u.email || '').toLowerCase() === email);

        // Also allow sign in by full name
        if (!matched) {
            matched = users.find(u => (u.name || '').toLowerCase() === email);
        }

        if (matched) {
            this.loginAsUser(matched.id);
        } else {
            Utils.showToast(`No account found for "${email}". If you don't have an account, click "Sign Up" above.`, 'warning', 4500);
        }
    },

    handleStandardSignUp(e) {
        if (e && e.preventDefault) e.preventDefault();

        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const roleInput = document.getElementById('signup-role');
        const instInput = document.getElementById('signup-inst');
        const teachInput = document.getElementById('signup-teach');
        const learnInput = document.getElementById('signup-learn');

        const name = (nameInput?.value || '').trim();
        const email = (emailInput?.value || '').trim().toLowerCase();
        const password = passwordInput?.value || '';
        const role = roleInput?.value || 'Student';
        const institution = (instInput?.value || '').trim();
        const teachSkill = (teachInput?.value || '').trim();
        const learnSkill = (learnInput?.value || '').trim();

        if (!name || !email) {
            Utils.showToast('Please provide your name and email address.', 'warning', 3000);
            if (!name && nameInput) nameInput.focus();
            else if (emailInput) emailInput.focus();
            return;
        }

        const users = Storage.getCollection(STORAGE_KEYS.USERS);
        const existing = users.find(u => (u.email || '').toLowerCase() === email);
        if (existing) {
            Utils.showToast('An account with this email already exists. Switching to Sign In...', 'info', 3500);
            this.switchAuthTab('signin');
            const signinEmail = document.getElementById('signin-email');
            if (signinEmail) signinEmail.value = email;
            return;
        }

        const userId = 'user_' + Date.now();
        const initials = name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'U';

        const newUser = {
            id: userId,
            name: name,
            email: email,
            password: password,
            userType: role,
            institution: institution,
            location: institution || 'India',
            bio: `Community member enthusiastic about learning and sharing skills.`,
            avatarColor: 'emerald',
            avatarInitial: initials,
            joinedDate: new Date().toISOString().split('T')[0],
            interests: [teachSkill, learnSkill].filter(Boolean),
            availability: 'Available',
            rating: 5.0,
            reviewsCount: 0,
            hoursTaught: 0,
            hoursLearned: 0,
            streakDays: 1,
            badges: ['New Member']
        };

        Storage.saveItem(STORAGE_KEYS.USERS, newUser);

        if (teachSkill) {
            Storage.saveItem(STORAGE_KEYS.SKILLS, {
                id: 'skill_' + Date.now() + '_1',
                userId: userId,
                name: teachSkill,
                category: 'General',
                type: 'teach',
                level: 'Intermediate',
                description: `Mentoring and teaching in ${teachSkill}.`,
                sessionsCompleted: 0,
                rating: 5.0,
                endorsements: 0
            });
        }

        if (learnSkill) {
            Storage.saveItem(STORAGE_KEYS.SKILLS, {
                id: 'skill_' + Date.now() + '_2',
                userId: userId,
                name: learnSkill,
                category: 'General',
                type: 'learn',
                level: 'Beginner',
                description: `Goal to learn and develop proficiency in ${learnSkill}.`,
                sessionsCompleted: 0,
                rating: 0,
                endorsements: 0
            });
        }

        if (typeof MongoDBClient !== 'undefined' && MongoDBClient.connected) {
            MongoDBClient.pushToMongoDB().catch(() => {});
        }

        this.loginAsUser(userId);
        Utils.showToast(`Welcome to Community Skill Exchange, ${name}! Your account has been created.`, 'success', 4000);
    },

    handleLoadDemo() {
        Utils.showToast('You can register a new profile or sign in with an existing account.', 'info');
        this.switchAuthTab('signup');
    },

    // --------------------------------------------------------------------------
    // ONBOARDING WIZARD
    // --------------------------------------------------------------------------
    openOnboardingModal() {
        const modalId = 'onboarding-modal';
        let modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.remove();

        modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal-backdrop active';
        modalEl.innerHTML = `
            <div class="modal-card modal-card-lg animate-scale-up" style="max-width: 680px;">
                <div class="modal-header">
                    <h3 class="modal-title" id="onboarding-step-title">Welcome to Community Skill Exchange</h3>
                    <button class="modal-close-btn" onclick="Utils.closeModal('${modalId}')"><i data-lucide="x"></i></button>
                </div>
                <div class="modal-body" id="onboarding-step-body" style="max-height: 70vh; overflow-y: auto;">
                    <div class="onboarding-step" data-step="1">
                        <div style="margin-bottom: 1.25rem;">
                            <h4 style="font-size: 1.2rem; margin-bottom: 0.25rem;">Create your learning profile</h4>
                            <p class="text-secondary" style="font-size: 0.88rem;">Start fresh by setting up your details, initial skills, and learning goals.</p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Your Name <span class="required">*</span></label>
                            <input type="text" id="ob-name" class="form-input" placeholder="e.g. Alex Johnson" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" id="ob-email" class="form-input" placeholder="you@example.com">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Role</label>
                                <select id="ob-role" class="form-select">
                                    <option value="Student">Student</option>
                                    <option value="Professional">Professional</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Institution / Organization</label>
                            <input type="text" id="ob-inst" class="form-input" placeholder="e.g. University / Tech Company">
                        </div>

                        <!-- Teaching Skill Section with Selectable Level & Priority -->
                        <div style="border-top: 1px solid var(--border-subtle); padding-top: 1rem; margin-top: 1.25rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                                <i data-lucide="award" style="color: var(--accent-emerald); width: 18px; height: 18px;"></i>
                                <h5 style="font-size: 1rem; font-weight: 700; margin: 0; color: var(--text-primary);">Skill You Can Teach (Optional)</h5>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Teaching Skill Name</label>
                                <input type="text" id="ob-teach" class="form-input" placeholder="e.g. Python, Graphic Design, Web Development">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Your Proficiency Level</label>
                                    <select id="ob-teach-prof" class="form-select">
                                        <option value="Beginner">Beginner (Foundational)</option>
                                        <option value="Intermediate" selected>Intermediate (Competent)</option>
                                        <option value="Advanced">Advanced (High Proficiency)</option>
                                        <option value="Expert">Expert (Complete Mastery / Mentor)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Mentoring Priority</label>
                                    <select id="ob-teach-priority" class="form-select">
                                        <option value="High" selected>High Priority (Active)</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="Low">Low Priority (Occasional)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Learning Skill Section with Selectable Current Level, Target Level, & Priority -->
                        <div style="border-top: 1px solid var(--border-subtle); padding-top: 1rem; margin-top: 1.25rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                                <i data-lucide="target" style="color: var(--primary-500); width: 18px; height: 18px;"></i>
                                <h5 style="font-size: 1rem; font-weight: 700; margin: 0; color: var(--text-primary);">Skill You Want to Learn (Optional)</h5>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Target Skill Name</label>
                                <input type="text" id="ob-learn" class="form-input" placeholder="e.g. React, UI/UX Design, Cloud Architecture">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Your Known / Current Level</label>
                                    <select id="ob-learn-level" class="form-select">
                                        <option value="Beginner" selected>Beginner (Little to no experience)</option>
                                        <option value="Intermediate">Intermediate (Know fundamentals)</option>
                                        <option value="Advanced">Advanced (Practical experience)</option>
                                        <option value="Expert">Expert (Seeking edge cases)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Target Goal Level</label>
                                    <select id="ob-learn-target" class="form-select">
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced" selected>Advanced (Proficient)</option>
                                        <option value="Expert">Expert (Complete Mastery)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Learning Priority</label>
                                <select id="ob-learn-priority" class="form-select">
                                    <option value="High" selected>High Priority (Primary Focus)</option>
                                    <option value="Medium">Medium Priority (Secondary Track)</option>
                                    <option value="Low">Low Priority (Casual / Long-term)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="justify-content: space-between;">
                    <button type="button" class="btn btn-ghost" onclick="Utils.closeModal('${modalId}')">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="App.submitOnboarding()">Complete & Enter Dashboard</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalEl);
        Utils.renderIcons(modalEl);
    },

    submitOnboarding() {
        const name = document.getElementById('ob-name')?.value?.trim();
        if (!name) {
            Utils.showToast('Please enter your name', 'error');
            return;
        }

        const email = document.getElementById('ob-email')?.value?.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
        const userType = document.getElementById('ob-role')?.value || 'Student';
        const institution = document.getElementById('ob-inst')?.value?.trim() || '';

        const newUser = {
            id: `user_${Date.now()}`,
            name,
            email,
            userType,
            institution,
            bio: 'Excited to exchange knowledge and master new skills.',
            location: 'Online Community',
            avatarColor: 'from-emerald-500',
            avatarInitial: Utils.getInitials(name),
            joinedDate: new Date().toISOString().split('T')[0],
            interests: [],
            availability: 'Available',
            stats: {
                sharesCompleted: 0,
                sessionsCompleted: 0
            }
        };

        Storage.saveItem(STORAGE_KEYS.USERS, newUser);
        Storage.setCurrentUserId(newUser.id);
        sessionStorage.setItem('cse_active_session', newUser.id);
        this.currentUser = newUser;

        // Add user-entered teaching skill with selected proficiency & priority
        const teachSkill = document.getElementById('ob-teach')?.value?.trim();
        const teachProf = document.getElementById('ob-teach-prof')?.value || 'Intermediate';
        const teachPriority = document.getElementById('ob-teach-priority')?.value || 'High';

        // Add user-entered learning skill with selected current level, target level & priority
        const learnSkill = document.getElementById('ob-learn')?.value?.trim();
        const learnLevel = document.getElementById('ob-learn-level')?.value || 'Beginner';
        const learnTarget = document.getElementById('ob-learn-target')?.value || 'Advanced';
        const learnPriority = document.getElementById('ob-learn-priority')?.value || 'High';

        if (teachSkill) {
            Storage.saveItem(STORAGE_KEYS.SKILLS, {
                id: Storage.generateId('cse_skills'),
                userId: newUser.id,
                type: 'teach',
                name: teachSkill,
                category: 'General',
                proficiency: teachProf,
                priority: teachPriority,
                experience: 'Personal knowledge',
                createdAt: new Date().toISOString()
            });
        }

        if (learnSkill) {
            Storage.saveItem(STORAGE_KEYS.SKILLS, {
                id: Storage.generateId('cse_skills'),
                userId: newUser.id,
                type: 'learn',
                name: learnSkill,
                category: 'General',
                currentLevel: learnLevel,
                targetLevel: learnTarget,
                priority: learnPriority,
                progress: 0,
                createdAt: new Date().toISOString()
            });
        }

        Utils.closeModal('onboarding-modal');
        Storage.set('cse_logged_out', false);
        AchievementsEngine.evaluateAll(newUser.id, false);
        this.showAppView();
        this.showPage('dashboard');
        Utils.showToast(`Welcome, ${name}! Your profile is ready.`, 'success');
    },

    // --------------------------------------------------------------------------
    // AUTHENTICATION & SESSION MANAGEMENT
    // --------------------------------------------------------------------------
    openLoginModal(prefillEmail = '') {
        this.showLandingView();
        this.switchAuthTab('signin');
        if (prefillEmail) {
            const emailInput = document.getElementById('signin-email');
            if (emailInput) emailInput.value = prefillEmail;
        }
    },

    loginAsUser(userId) {
        const user = Storage.getById(STORAGE_KEYS.USERS, userId);
        if (!user) {
            Utils.showToast('Profile not found.', 'danger');
            return;
        }

        sessionStorage.setItem('cse_active_session', user.id);
        Storage.setCurrentUserId(user.id);
        Storage.set('cse_logged_out', false);
        this.currentUser = user;

        Utils.closeModal('member-login-modal');

        // Close user dropdown menu
        const userMenu = document.getElementById('user-dropdown-menu');
        if (userMenu) userMenu.classList.remove('active');

        // Evaluate achievements & refresh view
        AchievementsEngine.evaluateAll(user.id, false);

        // Show app shell and load dashboard
        this.showAppView();
        this.showPage('dashboard');

        const pastSessions = Storage.getUserActivities(user.id).length;
        const pastGoals = Storage.getUserGoals(user.id).length;
        Utils.showToast(`Welcome back, ${user.name}! Logged in with ${pastSessions} past sessions & ${pastGoals} goals loaded.`, 'success', 3500);
    },

    logout() {
        sessionStorage.removeItem('cse_active_session');
        Storage.setCurrentUserId(null);
        Storage.set('cse_logged_out', true);
        this.currentUser = null;

        // Close user menu
        const userMenu = document.getElementById('user-dropdown-menu');
        if (userMenu) userMenu.classList.remove('active');

        // Reset page title
        document.title = 'Community Skill Exchange | Learn • Share • Connect • Grow';

        // Switch to landing view and activate Sign In tab
        this.showLandingView();
        this.switchAuthTab('signin');

        Utils.showToast('You have been signed out successfully.', 'info', 2500);
    }
};

window.App = App;

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
