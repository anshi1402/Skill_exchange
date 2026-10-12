# Community Skill Exchange (CSE)
> **Learn. Share. Connect. Grow.**

A complete, modern, fully client-side web application and peer-to-peer learning network built entirely using **Vanilla HTML5, CSS3, ES6+ JavaScript, and LocalStorage**.

---

## 🌟 Key Highlights & Features

1. **Pure Vanilla Tech Stack (No Node/React/Backend required)**
   - **Frontend**: Vanilla HTML5 + CSS3 + ES6+ JavaScript
   - **Data Layer**: Centralized Browser `LocalStorage` management with reactive state updates
   - **Visualizations**: [Chart.js](https://www.chartjs.org/) via CDN
   - **Icons**: [Lucide Icons](https://lucide.dev/) via CDN
   - **Typography**: Google Fonts (*Outfit* & *Inter*)

2. **Smart Skill Matching Algorithm (`calculateMatchScore`)**
   - Calculates a **0–100% compatibility score** between learners and mentors:
     - **+40 points**: Current user can teach skills the partner wants to learn
     - **+40 points**: Partner can teach skills the current user wants to learn
     - **+10 points**: Shared learning & technical interests
     - **+5 points**: Compatible active learning goals
     - **+5 points**: Compatible proficiency levels (Advanced mentor paired with Beginner learner)
   - Automatically segments partners into **Perfect Matches (≥80%)**, **Strong Matches (50–79%)**, and **Potential Matches (<50%)**.

3. **Interactive Stopwatch & Activity Logger**
   - Built-in live stopwatch timer (Start, Pause, Resume, Stop & Save).
   - Records session types: *Learning Session*, *Teaching Session*, *Practice Session*, *Knowledge Sharing*, and *Project Work*.

4. **Dynamic Learning Streaks & Analytics**
   - **True Daily Streak Engine**: Computes consecutive active learning days based on activity timestamps.
   - **5 Interactive Chart.js Visualizations**: Weekly activity breakdown, monthly learning hours trajectory, activity type distribution doughnut, and skill growth comparison.
   - **Intelligent Rule-Based AI Insights**: Dynamically generates tailored feedback on streak momentum, goal milestones, and knowledge sharing ratios.

5. **Goal Management & Milestone Checklists**
   - Create and edit structured roadmaps with customizable milestone checklists.
   - Checking off milestones dynamically updates overall progress percentage and triggers celebratory confetti upon completion.

6. **10 Automated Achievement Badges**
   - *First Step*, *Skill Builder*, *Knowledge Sharer*, *Consistent Learner (7d)*, *Dedicated Learner (30d)*, *Goal Crusher*, *Skill Explorer*, *Community Contributor*, *Rising Expert*, and *Learning Champion*.

7. **Full Data Portability & Backup**
   - **JSON Backup**: Full one-click export and import with schema validation.
   - **CSV Export**: Export skills, activities, and audit history to CSV format for spreadsheets.
   - **One-Click Demo Mode**: Preloaded with 12+ realistic students and industry professionals with complementary skill pairs.

8. **Design & UX Excellence**
   - Seamless **Light Mode** & **Dark Mode** support with CSS custom property variables.
   - Fully responsive layout for Desktop, Laptop, Tablet, and Mobile devices with slide-out navigation.
   - Glassmorphic top navigation bar, live global search with instant categorized suggestions, toast notification system, and confirmation dialogs.

---

## 🚀 How to Run Locally

### Option 1: Open Directly in Browser
Simply double-click `index.html` in your file explorer to open it in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Run with Python HTTP Server
```bash
python -m http.server 3000
```
Then visit `http://localhost:3000` in your web browser.

---

## 📁 Project Structure

```text
c:\Users\anshi\OneDrive\Desktop\Internship\
│
├── index.html                  # Master Single Page Application shell
├── README.md                   # Project documentation & viva guide
├── project_details.md          # Specification document
│
├── css/
│   ├── style.css               # Design tokens, themes, typography & layout grid
│   ├── components.css          # Cards, buttons, timer widget, modals, toasts & badges
│   └── responsive.css          # Mobile & tablet breakpoints & drawer navigation
│
└── js/
    ├── storage.js              # Centralized LocalStorage CRUD & data export/import
    ├── data.js                 # Seed catalog with 12+ demo users & activities
    ├── utils.js                # Toasts, modals, formatters, avatars & animations
    ├── matching.js             # 0-100% skill matching compatibility engine
    ├── analytics.js            # Streaks, hours, chart data & dynamic AI insights
    ├── achievements.js         # 10 badge definitions & automated progress triggers
    ├── recommendations.js      # Complementary skill graph & smart recommendations
    └── app.js                  # Master SPA router & view controllers
```

---

## 💾 LocalStorage Data Schema

All persistent keys are namespaced with `cse_`:
- `cse_users`: Registered user profiles
- `cse_current_user`: Active logged-in user ID
- `cse_skills`: Teaching and learning skill records
- `cse_learning_goals`: Goals with embedded milestone checklists
- `cse_learning_activities`: Logged study & teaching sessions
- `cse_connections`: Peer connection requests and statuses
- `cse_achievements`: Unlocked badge states and progress records
- `cse_notifications`: In-app notification notifications ledger
- `cse_preferences`: Theme (light/dark) and alert settings
