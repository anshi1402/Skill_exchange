/**
 * Community Skill Exchange - Skills Catalog & Community Peer Network
 * Taxonomy, categories, popular skills, and rich community peers.
 */

const SKILL_CATEGORIES = {
    PROGRAMMING: 'Programming',
    DESIGN: 'Design',
    COMMUNICATION: 'Communication',
    MEDIA: 'Media',
    CONTENT: 'Content',
    MARKETING: 'Marketing',
    DATA_AI: 'Data & AI'
};

const POPULAR_SKILLS = [
    { name: 'Python', category: SKILL_CATEGORIES.PROGRAMMING, icon: 'code-2' },
    { name: 'JavaScript', category: SKILL_CATEGORIES.PROGRAMMING, icon: 'file-code' },
    { name: 'React', category: SKILL_CATEGORIES.PROGRAMMING, icon: 'atom' },
    { name: 'Node.js', category: SKILL_CATEGORIES.PROGRAMMING, icon: 'server' },
    { name: 'Java', category: SKILL_CATEGORIES.PROGRAMMING, icon: 'coffee' },
    { name: 'C++', category: SKILL_CATEGORIES.PROGRAMMING, icon: 'cpu' },
    { name: 'UI/UX Design', category: SKILL_CATEGORIES.DESIGN, icon: 'layout' },
    { name: 'Graphic Design', category: SKILL_CATEGORIES.DESIGN, icon: 'palette' },
    { name: 'Figma', category: SKILL_CATEGORIES.DESIGN, icon: 'figma' },
    { name: 'Photoshop', category: SKILL_CATEGORIES.DESIGN, icon: 'image' },
    { name: 'Public Speaking', category: SKILL_CATEGORIES.COMMUNICATION, icon: 'mic' },
    { name: 'Communication', category: SKILL_CATEGORIES.COMMUNICATION, icon: 'message-square' },
    { name: 'Leadership', category: SKILL_CATEGORIES.COMMUNICATION, icon: 'users' },
    { name: 'Presentation', category: SKILL_CATEGORIES.COMMUNICATION, icon: 'presentation' },
    { name: 'Photography', category: SKILL_CATEGORIES.MEDIA, icon: 'camera' },
    { name: 'Video Editing', category: SKILL_CATEGORIES.MEDIA, icon: 'video' },
    { name: 'Animation', category: SKILL_CATEGORIES.MEDIA, icon: 'film' },
    { name: 'Content Writing', category: SKILL_CATEGORIES.CONTENT, icon: 'pen-tool' },
    { name: 'Blogging', category: SKILL_CATEGORIES.CONTENT, icon: 'book-open' },
    { name: 'Copywriting', category: SKILL_CATEGORIES.CONTENT, icon: 'feather' },
    { name: 'Digital Marketing', category: SKILL_CATEGORIES.MARKETING, icon: 'trending-up' },
    { name: 'SEO', category: SKILL_CATEGORIES.MARKETING, icon: 'search' },
    { name: 'Social Media Marketing', category: SKILL_CATEGORIES.MARKETING, icon: 'share-2' },
    { name: 'Data Science', category: SKILL_CATEGORIES.DATA_AI, icon: 'database' },
    { name: 'Machine Learning', category: SKILL_CATEGORIES.DATA_AI, icon: 'brain' },
    { name: 'Artificial Intelligence', category: SKILL_CATEGORIES.DATA_AI, icon: 'sparkles' },
    { name: 'Data Analytics', category: SKILL_CATEGORIES.DATA_AI, icon: 'bar-chart-2' }
];

// Rich, diverse community peers for active Discovery & Matchmaking
const DEMO_USERS = [
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
        availability: 'Available',
        stats: { sharesCompleted: 14, sessionsCompleted: 22 }
    },
    {
        id: 'peer_priya',
        name: 'Priya Patel',
        email: 'priya.design@example.com',
        userType: 'Professional',
        institution: 'NID Ahmedabad',
        location: 'Bengaluru',
        bio: 'Senior Product Designer crafting design systems, typography scales, and micro-interactions. Excited to learn React and modern JavaScript.',
        avatarColor: 'rose-amber',
        avatarInitial: 'PP',
        joinedDate: '2026-07-20',
        interests: ['UI/UX Design', 'Figma', 'Design Systems', 'React', 'Prototyping'],
        availability: 'Available',
        stats: { sharesCompleted: 28, sessionsCompleted: 35 }
    },
    {
        id: 'peer_rohan',
        name: 'Rohan Mehta',
        email: 'rohan.mehta@example.com',
        userType: 'Student',
        institution: 'BITS Pilani',
        location: 'Hyderabad',
        bio: 'Data science & machine learning practitioner working with PyTorch and pandas. Seeking mentorship in confident public speaking and presentation.',
        avatarColor: 'cyan-blue',
        avatarInitial: 'RM',
        joinedDate: '2026-08-01',
        interests: ['Machine Learning', 'Python', 'Data Science', 'Public Speaking'],
        availability: 'Available',
        stats: { sharesCompleted: 11, sessionsCompleted: 19 }
    },
    {
        id: 'peer_sneha',
        name: 'Sneha Kulkarni',
        email: 'sneha.dev@example.com',
        userType: 'Professional',
        institution: 'Pune Tech Hub',
        location: 'Pune',
        bio: 'Frontend architect specializing in high-performance web applications, ES6+ architecture, and CSS animations. Learning AI & Data Science.',
        avatarColor: 'purple-pink',
        avatarInitial: 'SK',
        joinedDate: '2026-06-15',
        interests: ['JavaScript', 'React', 'CSS & Animation', 'Data Science'],
        availability: 'Available',
        stats: { sharesCompleted: 34, sessionsCompleted: 40 }
    },
    {
        id: 'peer_dev',
        name: 'Devansh Verma',
        email: 'devansh.cloud@example.com',
        userType: 'Professional',
        institution: 'Cloud Innovations',
        location: 'Gurugram',
        bio: 'Backend & DevOps engineer focused on Node.js, distributed microservices, and Docker. Looking to explore UI/UX fundamentals.',
        avatarColor: 'emerald-teal',
        avatarInitial: 'DV',
        joinedDate: '2026-08-10',
        interests: ['Node.js', 'Java', 'Docker', 'Cloud', 'UI/UX Design'],
        availability: 'Available',
        stats: { sharesCompleted: 18, sessionsCompleted: 26 }
    },
    {
        id: 'peer_ananya',
        name: 'Ananya Sen',
        email: 'ananya.content@example.com',
        userType: 'Professional',
        institution: 'Mumbai Creative Co',
        location: 'Mumbai',
        bio: 'Content strategist and copywriter helping brands scale organically. Learning Python to build automated data and scraping scripts.',
        avatarColor: 'amber-orange',
        avatarInitial: 'AS',
        joinedDate: '2026-07-28',
        interests: ['Content Writing', 'Digital Marketing', 'SEO', 'Python'],
        availability: 'Available',
        stats: { sharesCompleted: 22, sessionsCompleted: 31 }
    },
    {
        id: 'peer_karan',
        name: 'Karan Johar',
        email: 'karan.media@example.com',
        userType: 'Student',
        institution: 'FTII Pune',
        location: 'Pune',
        bio: 'Visual storyteller and video editor creating cinematic documentaries. Excited to learn social media growth and digital marketing.',
        avatarColor: 'rose-red',
        avatarInitial: 'KJ',
        joinedDate: '2026-08-05',
        interests: ['Video Editing', 'Photography', 'Animation', 'Digital Marketing'],
        availability: 'Available',
        stats: { sharesCompleted: 15, sessionsCompleted: 18 }
    },
    {
        id: 'peer_meera',
        name: 'Dr. Meera Nair',
        email: 'meera.ai@example.com',
        userType: 'Professional',
        institution: 'AI Research Lab',
        location: 'Chennai',
        bio: 'AI researcher and conference speaker. Love demystifying neural networks and coaching peers in technical presentation and public speaking.',
        avatarColor: 'indigo-cyan',
        avatarInitial: 'MN',
        joinedDate: '2026-06-01',
        interests: ['Artificial Intelligence', 'Public Speaking', 'Presentation', 'React'],
        availability: 'Available',
        stats: { sharesCompleted: 45, sessionsCompleted: 52 }
    },
    {
        id: 'peer_vikram',
        name: 'Vikram Joshi',
        email: 'vikram.security@example.com',
        userType: 'Student',
        institution: 'Delhi Technological University',
        location: 'Delhi',
        bio: 'Security researcher and systems programmer proficient in Java and C++. Passionate about applying AI and machine learning to threat detection.',
        avatarColor: 'blue-indigo',
        avatarInitial: 'VJ',
        joinedDate: '2026-08-18',
        interests: ['Java', 'C++', 'Security', 'Machine Learning'],
        availability: 'Available',
        stats: { sharesCompleted: 9, sessionsCompleted: 14 }
    },
    {
        id: 'peer_tanya',
        name: 'Tanya Kapoor',
        email: 'tanya.brand@example.com',
        userType: 'Professional',
        institution: 'Studio Eleven',
        location: 'Jaipur',
        bio: 'Brand identity designer and visual artist with deep mastery of typography, color harmony, and Figma component architecture.',
        avatarColor: 'fuchsia-pink',
        avatarInitial: 'TK',
        joinedDate: '2026-07-12',
        interests: ['Figma', 'Graphic Design', 'UI/UX Design', 'JavaScript'],
        availability: 'Available',
        stats: { sharesCompleted: 26, sessionsCompleted: 33 }
    },
    {
        id: 'peer_rahul',
        name: 'Rahul Das',
        email: 'rahul.dev@example.com',
        userType: 'Student',
        institution: 'Jadavpur University',
        location: 'Kolkata',
        bio: 'Frontend enthusiast building reactive user experiences. Eager to partner with backend developers to level up on Node.js and API architecture.',
        avatarColor: 'teal-cyan',
        avatarInitial: 'RD',
        joinedDate: '2026-08-22',
        interests: ['React', 'JavaScript', 'Node.js', 'Cloud'],
        availability: 'Available',
        stats: { sharesCompleted: 12, sessionsCompleted: 16 }
    },
    {
        id: 'peer_ishita',
        name: 'Ishita Roy',
        email: 'ishita.coach@example.com',
        userType: 'Professional',
        institution: 'Leadership Catalyst',
        location: 'Mumbai',
        bio: 'Executive coach and communication mentor. I guide engineers and creators to speak with authority, build charisma, and lead teams.',
        avatarColor: 'violet-purple',
        avatarInitial: 'IR',
        joinedDate: '2026-06-25',
        interests: ['Public Speaking', 'Communication', 'Leadership', 'Digital Marketing'],
        availability: 'Available',
        stats: { sharesCompleted: 38, sessionsCompleted: 44 }
    }
];

const DEMO_SKILLS = [
    // Aravind Sharma (peer_arav)
    { id: 'sk_arav_1', userId: 'peer_arav', type: 'teach', name: 'Python', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Expert', priority: 'High', experience: '4 years backend development & scripting' },
    { id: 'sk_arav_2', userId: 'peer_arav', type: 'teach', name: 'React', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Advanced', priority: 'Medium', experience: 'Built 6 production web applications' },
    { id: 'sk_arav_3', userId: 'peer_arav', type: 'teach', name: 'Node.js', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Intermediate', priority: 'Medium', experience: 'REST APIs with Express' },
    { id: 'sk_arav_4', userId: 'peer_arav', type: 'learn', name: 'UI/UX Design', category: SKILL_CATEGORIES.DESIGN, currentLevel: 'Beginner', targetLevel: 'Advanced', priority: 'High', progress: 25 },
    { id: 'sk_arav_5', userId: 'peer_arav', type: 'learn', name: 'Figma', category: SKILL_CATEGORIES.DESIGN, currentLevel: 'Beginner', targetLevel: 'Intermediate', priority: 'High', progress: 20 },

    // Priya Patel (peer_priya)
    { id: 'sk_priya_1', userId: 'peer_priya', type: 'teach', name: 'UI/UX Design', category: SKILL_CATEGORIES.DESIGN, proficiency: 'Expert', priority: 'High', experience: '5+ years lead product designer' },
    { id: 'sk_priya_2', userId: 'peer_priya', type: 'teach', name: 'Figma', category: SKILL_CATEGORIES.DESIGN, proficiency: 'Expert', priority: 'High', experience: 'Mastery in Auto-layout & token systems' },
    { id: 'sk_priya_3', userId: 'peer_priya', type: 'teach', name: 'Graphic Design', category: SKILL_CATEGORIES.DESIGN, proficiency: 'Advanced', priority: 'Medium', experience: 'Brand identity & visual layouts' },
    { id: 'sk_priya_4', userId: 'peer_priya', type: 'learn', name: 'React', category: SKILL_CATEGORIES.PROGRAMMING, currentLevel: 'Beginner', targetLevel: 'Advanced', priority: 'High', progress: 35 },
    { id: 'sk_priya_5', userId: 'peer_priya', type: 'learn', name: 'JavaScript', category: SKILL_CATEGORIES.PROGRAMMING, currentLevel: 'Intermediate', targetLevel: 'Advanced', priority: 'Medium', progress: 45 },

    // Rohan Mehta (peer_rohan)
    { id: 'sk_rohan_1', userId: 'peer_rohan', type: 'teach', name: 'Machine Learning', category: SKILL_CATEGORIES.DATA_AI, proficiency: 'Advanced', priority: 'High', experience: 'PyTorch, classification & NLP pipelines' },
    { id: 'sk_rohan_2', userId: 'peer_rohan', type: 'teach', name: 'Python', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Expert', priority: 'High', experience: 'Algorithmic problem solving & data pipelines' },
    { id: 'sk_rohan_3', userId: 'peer_rohan', type: 'teach', name: 'Data Analytics', category: SKILL_CATEGORIES.DATA_AI, proficiency: 'Advanced', priority: 'Medium', experience: 'Pandas, NumPy, and Tableau dashboards' },
    { id: 'sk_rohan_4', userId: 'peer_rohan', type: 'learn', name: 'Public Speaking', category: SKILL_CATEGORIES.COMMUNICATION, currentLevel: 'Beginner', targetLevel: 'Advanced', priority: 'High', progress: 15 },
    { id: 'sk_rohan_5', userId: 'peer_rohan', type: 'learn', name: 'Presentation', category: SKILL_CATEGORIES.COMMUNICATION, currentLevel: 'Intermediate', targetLevel: 'Advanced', priority: 'Medium', progress: 40 },

    // Sneha Kulkarni (peer_sneha)
    { id: 'sk_sneha_1', userId: 'peer_sneha', type: 'teach', name: 'JavaScript', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Expert', priority: 'High', experience: 'Deep ESNext, Event loop & performance' },
    { id: 'sk_sneha_2', userId: 'peer_sneha', type: 'teach', name: 'React', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Expert', priority: 'High', experience: 'State architectures, Custom hooks & SPA' },
    { id: 'sk_sneha_3', userId: 'peer_sneha', type: 'teach', name: 'CSS & Animation', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Expert', priority: 'Medium', experience: 'Modern CSS Grid, Flexbox, Keyframes' },
    { id: 'sk_sneha_4', userId: 'peer_sneha', type: 'learn', name: 'Artificial Intelligence', category: SKILL_CATEGORIES.DATA_AI, currentLevel: 'Beginner', targetLevel: 'Advanced', priority: 'High', progress: 30 },
    { id: 'sk_sneha_5', userId: 'peer_sneha', type: 'learn', name: 'Data Science', category: SKILL_CATEGORIES.DATA_AI, currentLevel: 'Beginner', targetLevel: 'Intermediate', priority: 'Medium', progress: 20 },

    // Devansh Verma (peer_dev)
    { id: 'sk_dev_1', userId: 'peer_dev', type: 'teach', name: 'Node.js', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Expert', priority: 'High', experience: 'Microservices & async architecture' },
    { id: 'sk_dev_2', userId: 'peer_dev', type: 'teach', name: 'Java', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Advanced', priority: 'Medium', experience: 'Enterprise Spring Boot & multithreading' },
    { id: 'sk_dev_3', userId: 'peer_dev', type: 'teach', name: 'Docker & Cloud', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Advanced', priority: 'High', experience: 'Containerization & deployment pipelines' },
    { id: 'sk_dev_4', userId: 'peer_dev', type: 'learn', name: 'UI/UX Design', category: SKILL_CATEGORIES.DESIGN, currentLevel: 'Beginner', targetLevel: 'Intermediate', priority: 'High', progress: 20 },
    { id: 'sk_dev_5', userId: 'peer_dev', type: 'learn', name: 'Photography', category: SKILL_CATEGORIES.MEDIA, currentLevel: 'Beginner', targetLevel: 'Intermediate', priority: 'Low', progress: 10 },

    // Ananya Sen (peer_ananya)
    { id: 'sk_ananya_1', userId: 'peer_ananya', type: 'teach', name: 'Content Writing', category: SKILL_CATEGORIES.CONTENT, proficiency: 'Expert', priority: 'High', experience: 'Long-form narrative & technical copywriting' },
    { id: 'sk_ananya_2', userId: 'peer_ananya', type: 'teach', name: 'Digital Marketing', category: SKILL_CATEGORIES.MARKETING, proficiency: 'Advanced', priority: 'High', experience: 'Growth campaigns & brand positioning' },
    { id: 'sk_ananya_3', userId: 'peer_ananya', type: 'teach', name: 'SEO', category: SKILL_CATEGORIES.MARKETING, proficiency: 'Advanced', priority: 'Medium', experience: 'Keyword research & technical on-page SEO' },
    { id: 'sk_ananya_4', userId: 'peer_ananya', type: 'learn', name: 'Python', category: SKILL_CATEGORIES.PROGRAMMING, currentLevel: 'Beginner', targetLevel: 'Intermediate', priority: 'High', progress: 30 },
    { id: 'sk_ananya_5', userId: 'peer_ananya', type: 'learn', name: 'Data Analytics', category: SKILL_CATEGORIES.DATA_AI, currentLevel: 'Beginner', targetLevel: 'Advanced', priority: 'High', progress: 15 },

    // Karan Johar (peer_karan)
    { id: 'sk_karan_1', userId: 'peer_karan', type: 'teach', name: 'Video Editing', category: SKILL_CATEGORIES.MEDIA, proficiency: 'Expert', priority: 'High', experience: 'Premiere Pro, DaVinci color grading' },
    { id: 'sk_karan_2', userId: 'peer_karan', type: 'teach', name: 'Photography', category: SKILL_CATEGORIES.MEDIA, proficiency: 'Advanced', priority: 'Medium', experience: 'Manual camera controls & composition' },
    { id: 'sk_karan_3', userId: 'peer_karan', type: 'teach', name: 'Animation', category: SKILL_CATEGORIES.MEDIA, proficiency: 'Intermediate', priority: 'Medium', experience: 'After Effects motion typography' },
    { id: 'sk_karan_4', userId: 'peer_karan', type: 'learn', name: 'Social Media Marketing', category: SKILL_CATEGORIES.MARKETING, currentLevel: 'Beginner', targetLevel: 'Advanced', priority: 'High', progress: 25 },
    { id: 'sk_karan_5', userId: 'peer_karan', type: 'learn', name: 'Copywriting', category: SKILL_CATEGORIES.CONTENT, currentLevel: 'Beginner', targetLevel: 'Intermediate', priority: 'Medium', progress: 35 },

    // Dr. Meera Nair (peer_meera)
    { id: 'sk_meera_1', userId: 'peer_meera', type: 'teach', name: 'Artificial Intelligence', category: SKILL_CATEGORIES.DATA_AI, proficiency: 'Expert', priority: 'High', experience: 'PhD in AI, transformer architectures' },
    { id: 'sk_meera_2', userId: 'peer_meera', type: 'teach', name: 'Public Speaking', category: SKILL_CATEGORIES.COMMUNICATION, proficiency: 'Expert', priority: 'High', experience: 'International keynote speaker' },
    { id: 'sk_meera_3', userId: 'peer_meera', type: 'teach', name: 'Presentation', category: SKILL_CATEGORIES.COMMUNICATION, proficiency: 'Expert', priority: 'Medium', experience: 'Slide structure & scientific communication' },
    { id: 'sk_meera_4', userId: 'peer_meera', type: 'learn', name: 'React', category: SKILL_CATEGORIES.PROGRAMMING, currentLevel: 'Beginner', targetLevel: 'Intermediate', priority: 'High', progress: 40 },
    { id: 'sk_meera_5', userId: 'peer_meera', type: 'learn', name: 'UI/UX Design', category: SKILL_CATEGORIES.DESIGN, currentLevel: 'Beginner', targetLevel: 'Advanced', priority: 'Medium', progress: 20 },

    // Vikram Joshi (peer_vikram)
    { id: 'sk_vikram_1', userId: 'peer_vikram', type: 'teach', name: 'Java', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Expert', priority: 'High', experience: 'Enterprise JVM & memory profiling' },
    { id: 'sk_vikram_2', userId: 'peer_vikram', type: 'teach', name: 'C++', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Advanced', priority: 'Medium', experience: 'Low-level systems & memory management' },
    { id: 'sk_vikram_3', userId: 'peer_vikram', type: 'teach', name: 'Python', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Advanced', priority: 'Medium', experience: 'Security tooling & socket scripting' },
    { id: 'sk_vikram_4', userId: 'peer_vikram', type: 'learn', name: 'Machine Learning', category: SKILL_CATEGORIES.DATA_AI, currentLevel: 'Beginner', targetLevel: 'Advanced', priority: 'High', progress: 20 },
    { id: 'sk_vikram_5', userId: 'peer_vikram', type: 'learn', name: 'Public Speaking', category: SKILL_CATEGORIES.COMMUNICATION, currentLevel: 'Beginner', targetLevel: 'Intermediate', priority: 'Low', progress: 10 },

    // Tanya Kapoor (peer_tanya)
    { id: 'sk_tanya_1', userId: 'peer_tanya', type: 'teach', name: 'Figma', category: SKILL_CATEGORIES.DESIGN, proficiency: 'Expert', priority: 'High', experience: 'Component libraries & multi-brand systems' },
    { id: 'sk_tanya_2', userId: 'peer_tanya', type: 'teach', name: 'Graphic Design', category: SKILL_CATEGORIES.DESIGN, proficiency: 'Expert', priority: 'High', experience: 'Brand identity & vector illustration' },
    { id: 'sk_tanya_3', userId: 'peer_tanya', type: 'teach', name: 'Photoshop', category: SKILL_CATEGORIES.DESIGN, proficiency: 'Advanced', priority: 'Medium', experience: 'Image compositing & retouching' },
    { id: 'sk_tanya_4', userId: 'peer_tanya', type: 'learn', name: 'JavaScript', category: SKILL_CATEGORIES.PROGRAMMING, currentLevel: 'Beginner', targetLevel: 'Intermediate', priority: 'High', progress: 30 },
    { id: 'sk_tanya_5', userId: 'peer_tanya', type: 'learn', name: 'React', category: SKILL_CATEGORIES.PROGRAMMING, currentLevel: 'Beginner', targetLevel: 'Advanced', priority: 'High', progress: 15 },

    // Rahul Das (peer_rahul)
    { id: 'sk_rahul_1', userId: 'peer_rahul', type: 'teach', name: 'React', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Advanced', priority: 'High', experience: 'Modern SPA development & context API' },
    { id: 'sk_rahul_2', userId: 'peer_rahul', type: 'teach', name: 'JavaScript', category: SKILL_CATEGORIES.PROGRAMMING, proficiency: 'Advanced', priority: 'High', experience: 'Functional programming & DOM manipulation' },
    { id: 'sk_rahul_3', userId: 'peer_rahul', type: 'teach', name: 'UI/UX Design', category: SKILL_CATEGORIES.DESIGN, proficiency: 'Intermediate', priority: 'Medium', experience: 'Wireframing & user flow design' },
    { id: 'sk_rahul_4', userId: 'peer_rahul', type: 'learn', name: 'Node.js', category: SKILL_CATEGORIES.PROGRAMMING, currentLevel: 'Beginner', targetLevel: 'Advanced', priority: 'High', progress: 25 },
    { id: 'sk_rahul_5', userId: 'peer_rahul', type: 'learn', name: 'Python', category: SKILL_CATEGORIES.PROGRAMMING, currentLevel: 'Beginner', targetLevel: 'Intermediate', priority: 'Medium', progress: 30 },

    // Ishita Roy (peer_ishita)
    { id: 'sk_ishita_1', userId: 'peer_ishita', type: 'teach', name: 'Public Speaking', category: SKILL_CATEGORIES.COMMUNICATION, proficiency: 'Expert', priority: 'High', experience: 'Trained 200+ professionals in executive presence' },
    { id: 'sk_ishita_2', userId: 'peer_ishita', type: 'teach', name: 'Communication', category: SKILL_CATEGORIES.COMMUNICATION, proficiency: 'Expert', priority: 'High', experience: 'Active listening, negotiation & pitch delivery' },
    { id: 'sk_ishita_3', userId: 'peer_ishita', type: 'teach', name: 'Leadership', category: SKILL_CATEGORIES.COMMUNICATION, proficiency: 'Advanced', priority: 'Medium', experience: 'Team management & feedback frameworks' },
    { id: 'sk_ishita_4', userId: 'peer_ishita', type: 'learn', name: 'Digital Marketing', category: SKILL_CATEGORIES.MARKETING, currentLevel: 'Beginner', targetLevel: 'Advanced', priority: 'High', progress: 35 },
    { id: 'sk_ishita_5', userId: 'peer_ishita', type: 'learn', name: 'Data Analytics', category: SKILL_CATEGORIES.DATA_AI, currentLevel: 'Beginner', targetLevel: 'Intermediate', priority: 'Medium', progress: 20 }
];

// --------------------------------------------------------------------------
// Rich Past Activities & Exchange History for Registered Members
// --------------------------------------------------------------------------
const DEMO_ACTIVITIES = [
    // Aravind Sharma (peer_arav) - Past Sessions & Exchanges
    {
        id: 'act_arav_1',
        userId: 'peer_arav',
        partnerId: 'peer_priya',
        type: 'Teaching Session',
        skill: 'Python',
        duration: 90,
        description: 'FastAPI Asynchronous Architecture & Pydantic V2 Models',
        notes: 'Coached Priya on async database sessions, dependency injection, and request validation.',
        date: '2026-10-11T14:30:00.000Z',
        createdAt: '2026-10-11T14:30:00.000Z'
    },
    {
        id: 'act_arav_2',
        userId: 'peer_arav',
        partnerId: 'peer_priya',
        type: 'Learning Session',
        skill: 'Figma',
        duration: 75,
        description: 'Auto-layout Components, Design Tokens, & Color Scales',
        notes: 'Priya demonstrated token architecture and nested auto-layout frames for responsive UI.',
        date: '2026-10-09T16:00:00.000Z',
        createdAt: '2026-10-09T16:00:00.000Z'
    },
    {
        id: 'act_arav_3',
        userId: 'peer_arav',
        partnerId: 'peer_rohan',
        type: 'Teaching Session',
        skill: 'React',
        duration: 60,
        description: 'React Custom Hooks & Context API State Management',
        notes: 'Reviewed Rohan\'s dashboard code and refactored state flow from prop drilling to context hooks.',
        date: '2026-10-07T11:15:00.000Z',
        createdAt: '2026-10-07T11:15:00.000Z'
    },
    {
        id: 'act_arav_4',
        userId: 'peer_arav',
        partnerId: 'peer_ishita',
        type: 'Learning Session',
        skill: 'Public Speaking',
        duration: 45,
        description: 'Technical Lightning Talk Structure & Voice Modulation',
        notes: 'Ishita provided actionable feedback on slide pacing and vocal projection for tech conferences.',
        date: '2026-10-04T18:00:00.000Z',
        createdAt: '2026-10-04T18:00:00.000Z'
    },
    {
        id: 'act_arav_5',
        userId: 'peer_arav',
        type: 'Practice Session',
        skill: 'Python',
        duration: 60,
        description: 'Benchmarking Background Task Queues with Redis & Celery',
        notes: 'Built worker process prototypes for distributed asynchronous job execution.',
        date: '2026-09-30T20:00:00.000Z',
        createdAt: '2026-09-30T20:00:00.000Z'
    },
    {
        id: 'act_arav_6',
        userId: 'peer_arav',
        partnerId: 'peer_sneha',
        type: 'Knowledge Sharing',
        skill: 'FastAPI',
        duration: 90,
        description: 'Microservice API Gateway Setup & JWT Security Middleware',
        notes: 'Collaborative code-share on OAuth2 token verification and secure route guards.',
        date: '2026-09-24T15:30:00.000Z',
        createdAt: '2026-09-24T15:30:00.000Z'
    },

    // Priya Patel (peer_priya) - Past Sessions & Exchanges
    {
        id: 'act_priya_1',
        userId: 'peer_priya',
        partnerId: 'peer_arav',
        type: 'Teaching Session',
        skill: 'UI/UX Design',
        duration: 75,
        description: 'Design System Fundamentals & Typography Hierarchies',
        notes: 'Mentored Aravind on contrast ratios, 8pt grid systems, and consistent spacing units.',
        date: '2026-10-09T16:00:00.000Z',
        createdAt: '2026-10-09T16:00:00.000Z'
    },
    {
        id: 'act_priya_2',
        userId: 'peer_priya',
        partnerId: 'peer_arav',
        type: 'Learning Session',
        skill: 'Python',
        duration: 90,
        description: 'Python Scripting for Automating Asset Export & Renaming',
        notes: 'Learned python os/pathlib scripting to bulk-rename exported SVG icons.',
        date: '2026-10-11T14:30:00.000Z',
        createdAt: '2026-10-11T14:30:00.000Z'
    },
    {
        id: 'act_priya_3',
        userId: 'peer_priya',
        partnerId: 'peer_sneha',
        type: 'Teaching Session',
        skill: 'Figma',
        duration: 60,
        description: 'Interactive Component Prototyping & Smart Animate',
        notes: 'Demonstrated spring physics and modal transitions for high-fidelity interactive specs.',
        date: '2026-10-06T17:00:00.000Z',
        createdAt: '2026-10-06T17:00:00.000Z'
    },
    {
        id: 'act_priya_4',
        userId: 'peer_priya',
        partnerId: 'peer_sneha',
        type: 'Learning Session',
        skill: 'React',
        duration: 75,
        description: 'Translating Figma Design Tokens to CSS Custom Properties in React',
        notes: 'Learned styled-components and theme provider architecture.',
        date: '2026-09-29T11:00:00.000Z',
        createdAt: '2026-09-29T11:00:00.000Z'
    },
    {
        id: 'act_priya_5',
        userId: 'peer_priya',
        type: 'Project Work',
        skill: 'UI/UX Design',
        duration: 120,
        description: 'Community Skill Exchange Accessibility Audit (WCAG 2.1 AA)',
        notes: 'Validated color contrast and keyboard navigation flow across all modals.',
        date: '2026-09-21T18:00:00.000Z',
        createdAt: '2026-09-21T18:00:00.000Z'
    },

    // Rohan Mehta (peer_rohan) - Past Sessions
    {
        id: 'act_rohan_1',
        userId: 'peer_rohan',
        partnerId: 'peer_meera',
        type: 'Learning Session',
        skill: 'Machine Learning',
        duration: 90,
        description: 'PyTorch Transformer Attention Heads & Self-Attention Matrices',
        notes: 'Dr. Meera explained cross-attention mechanics and tensor visualization.',
        date: '2026-10-10T10:00:00.000Z',
        createdAt: '2026-10-10T10:00:00.000Z'
    },
    {
        id: 'act_rohan_2',
        userId: 'peer_rohan',
        partnerId: 'peer_arav',
        type: 'Learning Session',
        skill: 'React',
        duration: 60,
        description: 'React State Management & Async Fetching for ML Dashboards',
        notes: 'Connected PyTorch model inference API to interactive frontend graph.',
        date: '2026-10-07T11:15:00.000Z',
        createdAt: '2026-10-07T11:15:00.000Z'
    },
    {
        id: 'act_rohan_3',
        userId: 'peer_rohan',
        partnerId: 'peer_ishita',
        type: 'Practice Session',
        skill: 'Public Speaking',
        duration: 50,
        description: 'Simulated 5-Minute Pitch Rehearsal for College Symposium',
        notes: 'Practiced hook introduction and slide-transition pauses with peer feedback.',
        date: '2026-10-03T16:30:00.000Z',
        createdAt: '2026-10-03T16:30:00.000Z'
    },

    // Sneha Kulkarni (peer_sneha) - Past Sessions
    {
        id: 'act_sneha_1',
        userId: 'peer_sneha',
        partnerId: 'peer_priya',
        type: 'Learning Session',
        skill: 'UI/UX Design',
        duration: 60,
        description: 'Design Handoff Conventions & Component Specing',
        notes: 'Aligned on design tokens and component variable naming.',
        date: '2026-10-06T17:00:00.000Z',
        createdAt: '2026-10-06T17:00:00.000Z'
    },
    {
        id: 'act_sneha_2',
        userId: 'peer_sneha',
        partnerId: 'peer_priya',
        type: 'Teaching Session',
        skill: 'React',
        duration: 75,
        description: 'React Component State, Props, & Synthetic Events',
        notes: 'Helped Priya write interactive toggles, tabs, and form handlers.',
        date: '2026-09-29T11:00:00.000Z',
        createdAt: '2026-09-29T11:00:00.000Z'
    },

    // Ishita Roy (peer_ishita) - Past Sessions
    {
        id: 'act_ishita_1',
        userId: 'peer_ishita',
        partnerId: 'peer_arav',
        type: 'Teaching Session',
        skill: 'Public Speaking',
        duration: 45,
        description: 'Executive Communication & Presentation Delivery',
        notes: 'Worked with Aravind on speech structuring and question-and-answer handling.',
        date: '2026-10-04T18:00:00.000Z',
        createdAt: '2026-10-04T18:00:00.000Z'
    },
    {
        id: 'act_ishita_2',
        userId: 'peer_ishita',
        partnerId: 'peer_rohan',
        type: 'Teaching Session',
        skill: 'Communication',
        duration: 50,
        description: 'Storytelling Frameworks in Technical Demos',
        notes: 'Coached Rohan on building clear analogies for complex neural networks.',
        date: '2026-10-03T16:30:00.000Z',
        createdAt: '2026-10-03T16:30:00.000Z'
    },

    // Devansh Verma (peer_dev) - Past Sessions
    {
        id: 'act_dev_1',
        userId: 'peer_dev',
        partnerId: 'peer_arav',
        type: 'Teaching Session',
        skill: 'Node.js',
        duration: 60,
        description: 'High-Throughput Event Loop & Cluster Module',
        notes: 'Shared worker threads and Redis pub-sub architectural patterns.',
        date: '2026-10-08T15:00:00.000Z',
        createdAt: '2026-10-08T15:00:00.000Z'
    },
    {
        id: 'act_dev_2',
        userId: 'peer_dev',
        partnerId: 'peer_priya',
        type: 'Learning Session',
        skill: 'UI/UX Design',
        duration: 45,
        description: 'Figma Auto-Layout & UI Grid Systems for Devs',
        notes: 'Practiced translating Figma specs to CSS Flexbox layouts.',
        date: '2026-09-25T14:00:00.000Z',
        createdAt: '2026-09-25T14:00:00.000Z'
    },

    // Ananya Sen (peer_ananya) - Past Sessions
    {
        id: 'act_ananya_1',
        userId: 'peer_ananya',
        partnerId: 'peer_arav',
        type: 'Learning Session',
        skill: 'Python',
        duration: 60,
        description: 'Automating Content Scraping with Beautiful Soup',
        notes: 'Wrote automated script to scrape weekly industry trends for newsletter.',
        date: '2026-10-09T12:00:00.000Z',
        createdAt: '2026-10-09T12:00:00.000Z'
    },
    {
        id: 'act_ananya_2',
        userId: 'peer_ananya',
        partnerId: 'peer_kabir',
        type: 'Teaching Session',
        skill: 'Content Writing',
        duration: 45,
        description: 'SEO Copywriting Frameworks & Conversion Hooks',
        notes: 'Coached Kabir on high-converting headlines and readability indices.',
        date: '2026-09-28T16:00:00.000Z',
        createdAt: '2026-09-28T16:00:00.000Z'
    },

    // Karan Johar (peer_karan) - Past Sessions
    {
        id: 'act_karan_1',
        userId: 'peer_karan',
        partnerId: 'peer_ananya',
        type: 'Teaching Session',
        skill: 'Video Editing',
        duration: 60,
        description: 'Premiere Pro Timeline Shortcuts & B-Roll Pacing',
        notes: 'Walked Ananya through video storytelling and sound design sync.',
        date: '2026-10-05T18:00:00.000Z',
        createdAt: '2026-10-05T18:00:00.000Z'
    },
    {
        id: 'act_karan_2',
        userId: 'peer_karan',
        partnerId: 'peer_kabir',
        type: 'Learning Session',
        skill: 'Digital Marketing',
        duration: 50,
        description: 'Short-Form Video Algorithm Distribution on YouTube Shorts',
        notes: 'Learned retention pacing strategies and thumbnail A/B testing.',
        date: '2026-09-22T15:30:00.000Z',
        createdAt: '2026-09-22T15:30:00.000Z'
    },

    // Dr. Meera Nair (peer_meera) - Past Sessions
    {
        id: 'act_meera_1',
        userId: 'peer_meera',
        partnerId: 'peer_rohan',
        type: 'Teaching Session',
        skill: 'Artificial Intelligence',
        duration: 90,
        description: 'Attention Mechanisms in Large Language Models',
        notes: 'Deep dive into rotary positional embeddings and KV caching.',
        date: '2026-10-10T10:00:00.000Z',
        createdAt: '2026-10-10T10:00:00.000Z'
    },
    {
        id: 'act_meera_2',
        userId: 'peer_meera',
        partnerId: 'peer_arav',
        type: 'Learning Session',
        skill: 'React',
        duration: 60,
        description: 'Building Interactive Research Visualizers with React & SVG',
        notes: 'Aravind showed how to wire up interactive tensor heatmaps.',
        date: '2026-09-18T17:00:00.000Z',
        createdAt: '2026-09-18T17:00:00.000Z'
    },

    // Vikram Joshi (peer_vikram) - Past Sessions
    {
        id: 'act_vikram_1',
        userId: 'peer_vikram',
        partnerId: 'peer_arav',
        type: 'Teaching Session',
        skill: 'Java',
        duration: 60,
        description: 'Memory Management & JVM Concurrency Internals',
        notes: 'Analyzed lock-free queue implementations and thread pools.',
        date: '2026-10-06T14:00:00.000Z',
        createdAt: '2026-10-06T14:00:00.000Z'
    },
    {
        id: 'act_vikram_2',
        userId: 'peer_vikram',
        partnerId: 'peer_meera',
        type: 'Learning Session',
        skill: 'Machine Learning',
        duration: 75,
        description: 'Applying Graph Neural Networks to Binary Analysis',
        notes: 'Discussed control-flow graph embeddings for security threat triage.',
        date: '2026-09-30T16:00:00.000Z',
        createdAt: '2026-09-30T16:00:00.000Z'
    },

    // Tanya Kapoor (peer_tanya) - Past Sessions
    {
        id: 'act_tanya_1',
        userId: 'peer_tanya',
        partnerId: 'peer_priya',
        type: 'Teaching Session',
        skill: 'Graphic Design',
        duration: 60,
        description: 'Brand Identity Vector Systems & Figma Color Harmonies',
        notes: 'Shared logo balance grids and optical margin alignment guidelines.',
        date: '2026-10-02T11:00:00.000Z',
        createdAt: '2026-10-02T11:00:00.000Z'
    },
    {
        id: 'act_tanya_2',
        userId: 'peer_tanya',
        partnerId: 'peer_arav',
        type: 'Learning Session',
        skill: 'JavaScript',
        duration: 50,
        description: 'Interactive SVG Manipulation & CSS Micro-Animations',
        notes: 'Wrote script to animate vector iconography on hover states.',
        date: '2026-09-27T15:00:00.000Z',
        createdAt: '2026-09-27T15:00:00.000Z'
    },

    // Rahul Das (peer_rahul) - Past Sessions
    {
        id: 'act_rahul_1',
        userId: 'peer_rahul',
        partnerId: 'peer_dev',
        type: 'Learning Session',
        skill: 'Node.js',
        duration: 60,
        description: 'Express Route Handlers, Middlewares & JWT Authentication',
        notes: 'Devansh walked through secure session tokens and bcrypt hashing.',
        date: '2026-10-07T13:30:00.000Z',
        createdAt: '2026-10-07T13:30:00.000Z'
    },
    {
        id: 'act_rahul_2',
        userId: 'peer_rahul',
        partnerId: 'peer_sneha',
        type: 'Teaching Session',
        skill: 'React',
        duration: 45,
        description: 'Custom React Hooks for Async Data Fetching',
        notes: 'Implemented reusable useFetch hook with abort controllers.',
        date: '2026-09-26T17:00:00.000Z',
        createdAt: '2026-09-26T17:00:00.000Z'
    }
];

// --------------------------------------------------------------------------
// Rich Past Goals & Active Roadmaps for Registered Members
// --------------------------------------------------------------------------
const DEMO_GOALS = [
    // Aravind Sharma (peer_arav)
    {
        id: 'goal_arav_1',
        userId: 'peer_arav',
        title: 'Master Figma Component Systems & Design Tokens',
        skill: 'Figma',
        category: 'Design',
        startDate: '2026-09-10',
        targetDate: '2026-11-15',
        priority: 'High',
        targetProficiency: 'Advanced',
        description: 'Learn modern Figma UI architecture to independently build clean mockups and design token pipelines for web applications.',
        progress: 67,
        status: 'In Progress',
        completed: false,
        milestones: [
            { id: 'm_arav_1_1', text: 'Understand Auto-layout frames, constraints & padding', completed: true },
            { id: 'm_arav_1_2', text: 'Build reusable button, card, and input variant components', completed: true },
            { id: 'm_arav_1_3', text: 'Assemble complete 5-screen responsive application layout', completed: false }
        ]
    },
    {
        id: 'goal_arav_2',
        userId: 'peer_arav',
        title: 'Production Docker Containerization for FastAPI',
        skill: 'Python',
        category: 'Programming',
        startDate: '2026-08-15',
        targetDate: '2026-09-30',
        priority: 'Medium',
        targetProficiency: 'Advanced',
        description: 'Containerize multi-container FastAPI backend with Postgres and Redis caching.',
        progress: 100,
        status: 'Completed',
        completed: true,
        milestones: [
            { id: 'm_arav_2_1', text: 'Write multi-stage lightweight Dockerfile', completed: true },
            { id: 'm_arav_2_2', text: 'Setup Docker Compose with persistent database volumes', completed: true },
            { id: 'm_arav_2_3', text: 'Configure health checks and automated restart policies', completed: true }
        ]
    },
    {
        id: 'goal_arav_3',
        userId: 'peer_arav',
        title: 'Deliver 15-Minute Technical Conference Lightning Talk',
        skill: 'Public Speaking',
        category: 'Communication',
        startDate: '2026-09-20',
        targetDate: '2026-10-30',
        priority: 'High',
        targetProficiency: 'Intermediate',
        description: 'Confidently present on asynchronous microservice patterns with zero notes.',
        progress: 50,
        status: 'In Progress',
        completed: false,
        milestones: [
            { id: 'm_arav_3_1', text: 'Draft 15-minute presentation outline & storytelling arc', completed: true },
            { id: 'm_arav_3_2', text: 'Practice trial run with community mentor (Ishita Roy)', completed: false },
            { id: 'm_arav_3_3', text: 'Deliver talk to community live stream', completed: false }
        ]
    },

    // Priya Patel (peer_priya)
    {
        id: 'goal_priya_1',
        userId: 'peer_priya',
        title: 'Master React Component Architecture & Hooks',
        skill: 'React',
        category: 'Programming',
        startDate: '2026-09-01',
        targetDate: '2026-11-20',
        priority: 'High',
        targetProficiency: 'Advanced',
        description: 'Transition from pure UI designer to technical design engineer capable of building production React components.',
        progress: 75,
        status: 'In Progress',
        completed: false,
        milestones: [
            { id: 'm_priya_1_1', text: 'Understand JSX, Props, and state with useState', completed: true },
            { id: 'm_priya_1_2', text: 'Build accessible modals, dropdowns, and drawer components', completed: true },
            { id: 'm_priya_1_3', text: 'Implement custom dark/light theme switching with CSS variables', completed: true },
            { id: 'm_priya_1_4', text: 'Publish interactive design system storybook in React', completed: false }
        ]
    },
    {
        id: 'goal_priya_2',
        userId: 'peer_priya',
        title: 'Complete Multi-Brand Design System Guidelines',
        skill: 'UI/UX Design',
        category: 'Design',
        startDate: '2026-07-25',
        targetDate: '2026-09-15',
        priority: 'Medium',
        targetProficiency: 'Expert',
        description: 'Comprehensive guidelines for multi-tenant typography, semantic color mapping, and iconography.',
        progress: 100,
        status: 'Completed',
        completed: true,
        milestones: [
            { id: 'm_priya_2_1', text: 'Draft WCAG compliant color token tables', completed: true },
            { id: 'm_priya_2_2', text: 'Construct responsive 12-column grid benchmarks', completed: true },
            { id: 'm_priya_2_3', text: 'Review and align guidelines with cross-functional team', completed: true }
        ]
    },

    // Rohan Mehta (peer_rohan)
    {
        id: 'goal_rohan_1',
        userId: 'peer_rohan',
        title: 'Deep Learning Model Inference Optimization',
        skill: 'Machine Learning',
        category: 'Data & AI',
        startDate: '2026-09-15',
        targetDate: '2026-11-30',
        priority: 'High',
        targetProficiency: 'Expert',
        description: 'Quantize PyTorch neural networks for sub-10ms CPU inference latency.',
        progress: 60,
        status: 'In Progress',
        completed: false,
        milestones: [
            { id: 'm_rohan_1_1', text: 'Benchmark FP32 baseline on evaluation datasets', completed: true },
            { id: 'm_rohan_1_2', text: 'Apply INT8 post-training quantization with ONNX Runtime', completed: true },
            { id: 'm_rohan_1_3', text: 'Deploy optimized model to FastAPI microservice endpoint', completed: false }
        ]
    },

    // Sneha Kulkarni (peer_sneha)
    {
        id: 'goal_sneha_1',
        userId: 'peer_sneha',
        title: 'Master Machine Learning for Frontend Data Visualization',
        skill: 'Machine Learning',
        category: 'Data & AI',
        startDate: '2026-09-01',
        targetDate: '2026-11-20',
        priority: 'High',
        targetProficiency: 'Intermediate',
        description: 'Understand classification and regression models to build intelligent reactive client dashboard features.',
        progress: 55,
        status: 'In Progress',
        completed: false,
        milestones: [
            { id: 'm_sneha_1_1', text: 'Understand Scikit-Learn pipelines and train-test splits', completed: true },
            { id: 'm_sneha_1_2', text: 'Integrate client-side model predictions via ONNX.js', completed: false },
            { id: 'm_sneha_1_3', text: 'Build interactive real-time confusion matrix visualization', completed: false }
        ]
    },
    {
        id: 'goal_sneha_2',
        userId: 'peer_sneha',
        title: 'Complete Enterprise Design Token & CSS Architecture System',
        skill: 'UI/UX Design',
        category: 'Design',
        startDate: '2026-08-01',
        targetDate: '2026-09-25',
        priority: 'Medium',
        targetProficiency: 'Advanced',
        description: 'Standardize semantic design tokens across web components without third-party frameworks.',
        progress: 100,
        status: 'Completed',
        completed: true,
        milestones: [
            { id: 'm_sneha_2_1', text: 'Create unified CSS custom property token palette', completed: true },
            { id: 'm_sneha_2_2', text: 'Audit typography hierarchies across all component cards', completed: true },
            { id: 'm_sneha_2_3', text: 'Benchmark dark mode contrast ratios for WCAG compliance', completed: true }
        ]
    },

    // Devansh Verma (peer_dev)
    {
        id: 'goal_dev_1',
        userId: 'peer_dev',
        title: 'Modern UI/UX Prototyping for Cloud Dashboards',
        skill: 'UI/UX Design',
        category: 'Design',
        startDate: '2026-09-12',
        targetDate: '2026-11-10',
        priority: 'High',
        targetProficiency: 'Intermediate',
        description: 'Learn foundational UI typography, spacing grids, and component hierarchies in Figma.',
        progress: 45,
        status: 'In Progress',
        completed: false,
        milestones: [
            { id: 'm_dev_1_1', text: 'Learn 8pt spatial grid and typographic scales', completed: true },
            { id: 'm_dev_1_2', text: 'Prototype interactive server monitoring telemetry screen', completed: false }
        ]
    },

    // Ananya Sen (peer_ananya)
    {
        id: 'goal_ananya_1',
        userId: 'peer_ananya',
        title: 'Automated Python Scripts for SEO Content Analytics',
        skill: 'Python',
        category: 'Programming',
        startDate: '2026-09-05',
        targetDate: '2026-11-15',
        priority: 'High',
        targetProficiency: 'Intermediate',
        description: 'Write Python scripts to parse XML sitemaps, inspect headings, and extract top keywords.',
        progress: 60,
        status: 'In Progress',
        completed: false,
        milestones: [
            { id: 'm_ananya_1_1', text: 'Master Python lists, dictionaries, and file I/O', completed: true },
            { id: 'm_ananya_1_2', text: 'Build sitemap crawler with requests and BeautifulSoup', completed: true },
            { id: 'm_ananya_1_3', text: 'Export keyword gap analysis to formatted CSV spreadsheets', completed: false }
        ]
    },

    // Karan Johar (peer_karan)
    {
        id: 'goal_karan_1',
        userId: 'peer_karan',
        title: 'Master Digital Marketing & Audience Retention Algorithms',
        skill: 'Digital Marketing',
        category: 'Marketing',
        startDate: '2026-09-10',
        targetDate: '2026-11-05',
        priority: 'Medium',
        targetProficiency: 'Advanced',
        description: 'Apply analytical distribution models to maximize engagement on educational videos.',
        progress: 70,
        status: 'In Progress',
        completed: false,
        milestones: [
            { id: 'm_karan_1_1', text: 'Analyze first 3-second hook retention metrics', completed: true },
            { id: 'm_karan_1_2', text: 'Develop 30-day cross-platform editorial calendar', completed: true },
            { id: 'm_karan_1_3', text: 'Launch community case study campaign', completed: false }
        ]
    },

    // Dr. Meera Nair (peer_meera)
    {
        id: 'goal_meera_1',
        userId: 'peer_meera',
        title: 'Interactive React Visualizers for AI Attention Heads',
        skill: 'React',
        category: 'Programming',
        startDate: '2026-08-20',
        targetDate: '2026-10-30',
        priority: 'High',
        targetProficiency: 'Advanced',
        description: 'Construct interactive web-based visualization tools for students to explore transformer matrices.',
        progress: 80,
        status: 'In Progress',
        completed: false,
        milestones: [
            { id: 'm_meera_1_1', text: 'Build SVG attention matrix component with dynamic tooltips', completed: true },
            { id: 'm_meera_1_2', text: 'Connect real-time token sliders and weight heatmaps', completed: true },
            { id: 'm_meera_1_3', text: 'Publish interactive demo on community platform', completed: false }
        ]
    },

    // Vikram Joshi (peer_vikram)
    {
        id: 'goal_vikram_1',
        userId: 'peer_vikram',
        title: 'Machine Learning for Network Packet Anomaly Detection',
        skill: 'Machine Learning',
        category: 'Data & AI',
        startDate: '2026-09-18',
        targetDate: '2026-12-01',
        priority: 'High',
        targetProficiency: 'Advanced',
        description: 'Train unsupervised isolation forest models on flow telemetry to detect intrusion vectors.',
        progress: 40,
        status: 'In Progress',
        completed: false,
        milestones: [
            { id: 'm_vikram_1_1', text: 'Extract flow duration and byte distribution features in Python', completed: true },
            { id: 'm_vikram_1_2', text: 'Benchmark Isolation Forest vs Autoencoder architectures', completed: false }
        ]
    },

    // Ishita Roy (peer_ishita)
    {
        id: 'goal_ishita_1',
        userId: 'peer_ishita',
        title: 'Deliver 10 Community Mentorship Keynote Sessions',
        skill: 'Public Speaking',
        category: 'Communication',
        startDate: '2026-08-15',
        targetDate: '2026-10-31',
        priority: 'High',
        targetProficiency: 'Expert',
        description: 'Mentor peers in public speaking, technical storytelling, and conference delivery.',
        progress: 100,
        status: 'Completed',
        completed: true,
        milestones: [
            { id: 'm_ishita_1_1', text: 'Host 5 individual speech rehearsal coaching workshops', completed: true },
            { id: 'm_ishita_1_2', text: 'Develop reusable storytelling checklist for engineers', completed: true },
            { id: 'm_ishita_1_3', text: 'Host community-wide presentation showcase', completed: true }
        ]
    },

    // Tanya Kapoor (peer_tanya)
    {
        id: 'goal_tanya_1',
        userId: 'peer_tanya',
        title: 'Interactive SVG Manipulation & Design Micro-Animations',
        skill: 'JavaScript',
        category: 'Programming',
        startDate: '2026-09-08',
        targetDate: '2026-11-12',
        priority: 'Medium',
        targetProficiency: 'Intermediate',
        description: 'Learn modern JavaScript DOM APIs to create interactive vector motion graphics.',
        progress: 65,
        status: 'In Progress',
        completed: false,
        milestones: [
            { id: 'm_tanya_1_1', text: 'Animate inline SVG paths with CSS keyframes & JS', completed: true },
            { id: 'm_tanya_1_2', text: 'Build interactive color theme switcher with CSS variables', completed: true },
            { id: 'm_tanya_1_3', text: 'Deploy animated design system icon catalog', completed: false }
        ]
    },

    // Rahul Das (peer_rahul)
    {
        id: 'goal_rahul_1',
        userId: 'peer_rahul',
        title: 'Master Node.js Microservices & Express REST APIs',
        skill: 'Node.js',
        category: 'Programming',
        startDate: '2026-09-14',
        targetDate: '2026-11-25',
        priority: 'High',
        targetProficiency: 'Advanced',
        description: 'Level up backend development with Express routing, JWT authentication, and MongoDB.',
        progress: 50,
        status: 'In Progress',
        completed: false,
        milestones: [
            { id: 'm_rahul_1_1', text: 'Build modular Express router with middleware validation', completed: true },
            { id: 'm_rahul_1_2', text: 'Connect MongoDB models with Mongoose schemas', completed: false }
        ]
    }
];

// --------------------------------------------------------------------------
// Established Connections for Registered Members
// --------------------------------------------------------------------------
const DEMO_CONNECTIONS = [
    {
        id: 'conn_arav_priya',
        senderId: 'peer_arav',
        receiverId: 'peer_priya',
        status: 'Accepted',
        message: 'Hi Priya! I can teach Python & FastAPI in exchange for Figma UI/UX design mentorship.',
        matchScore: 92,
        createdAt: '2026-08-20T10:00:00.000Z'
    },
    {
        id: 'conn_arav_rohan',
        senderId: 'peer_arav',
        receiverId: 'peer_rohan',
        status: 'Accepted',
        message: 'Hey Rohan, would love to help with React state for your ML visualization projects.',
        matchScore: 85,
        createdAt: '2026-09-02T14:30:00.000Z'
    },
    {
        id: 'conn_arav_ishita',
        senderId: 'peer_arav',
        receiverId: 'peer_ishita',
        status: 'Accepted',
        message: 'Hi Ishita! Preparing for tech conference lightning talks and looking for speaking coaching.',
        matchScore: 88,
        createdAt: '2026-09-15T09:15:00.000Z'
    },
    {
        id: 'conn_sneha_arav',
        senderId: 'peer_sneha',
        receiverId: 'peer_arav',
        status: 'Pending',
        message: 'Hey Aravind! Interested in your experience with backend job queues and Python.',
        matchScore: 78,
        createdAt: '2026-10-10T16:00:00.000Z'
    },
    {
        id: 'conn_priya_sneha',
        senderId: 'peer_priya',
        receiverId: 'peer_sneha',
        status: 'Accepted',
        message: 'Hi Sneha! Exchanging UI design prototyping for deep React front-end mentorship.',
        matchScore: 95,
        createdAt: '2026-08-25T11:45:00.000Z'
    },
    {
        id: 'conn_rohan_meera',
        senderId: 'peer_rohan',
        receiverId: 'peer_meera',
        status: 'Accepted',
        message: 'Dr. Meera, excited to learn from your AI research papers on Transformer architectures.',
        matchScore: 90,
        createdAt: '2026-09-05T13:20:00.000Z'
    }
];

// --------------------------------------------------------------------------
// Past Notifications for Registered Members
// --------------------------------------------------------------------------
const DEMO_NOTIFICATIONS = [
    {
        id: 'notif_arav_1',
        userId: 'peer_arav',
        type: 'session',
        title: 'Exchange Session Completed',
        message: 'Completed 90-minute Python architecture session with Priya Patel. Keep up the momentum!',
        read: true,
        actionUrl: 'activities',
        createdAt: '2026-10-11T16:05:00.000Z'
    },
    {
        id: 'notif_arav_2',
        userId: 'peer_arav',
        type: 'connection',
        title: 'New Connection Request',
        message: 'Sneha Kulkarni sent you a connection invitation to exchange frontend & backend skills.',
        read: false,
        actionUrl: 'connections',
        createdAt: '2026-10-10T16:00:00.000Z'
    },
    {
        id: 'notif_arav_3',
        userId: 'peer_arav',
        type: 'goal',
        title: 'Goal Achieved! 🏆',
        message: 'Congratulations! You marked "Production Docker Containerization for FastAPI" as 100% Complete.',
        read: true,
        actionUrl: 'goals',
        createdAt: '2026-09-30T20:30:00.000Z'
    },
    {
        id: 'notif_priya_1',
        userId: 'peer_priya',
        type: 'session',
        title: 'Session Logged',
        message: '75-minute UI/UX design mentorship session recorded with Aravind Sharma.',
        read: true,
        actionUrl: 'activities',
        createdAt: '2026-10-09T17:15:00.000Z'
    }
];

// Helper to seed community data into LocalStorage
function loadCommunityData(force = false) {
    if (typeof Storage === 'undefined') return false;

    const existingUsers = Storage.getCollection(STORAGE_KEYS.USERS);
    const currentUserId = Storage.getCurrentUserId();

    // Check if there are other users besides the current user
    const otherUsers = existingUsers.filter(u => u.id !== currentUserId);

    if (otherUsers.length === 0 || force) {
        // Seed community users (preserving current user if exists)
        const userMap = new Map();
        if (currentUserId) {
            const currentUser = existingUsers.find(u => u.id === currentUserId);
            if (currentUser) userMap.set(currentUser.id, currentUser);
        }

        DEMO_USERS.forEach(u => userMap.set(u.id, u));
        Storage.set(STORAGE_KEYS.USERS, Array.from(userMap.values()));

        // Seed community skills (preserving current user's skills)
        const currentSkills = currentUserId ? Storage.getUserSkills(currentUserId) : [];
        const skillMap = new Map();
        currentSkills.forEach(s => skillMap.set(s.id, s));
        DEMO_SKILLS.forEach(s => skillMap.set(s.id, s));
        Storage.set(STORAGE_KEYS.SKILLS, Array.from(skillMap.values()));
    }

    // Always ensure activities, goals, connections, and notifications have their past records
    const existingActivities = Storage.getCollection(STORAGE_KEYS.ACTIVITIES);
    if (existingActivities.length === 0 || force) {
        const actMap = new Map();
        existingActivities.forEach(a => actMap.set(a.id, a));
        DEMO_ACTIVITIES.forEach(a => actMap.set(a.id, a));
        Storage.set(STORAGE_KEYS.ACTIVITIES, Array.from(actMap.values()));
    }

    const existingGoals = Storage.getCollection(STORAGE_KEYS.GOALS);
    if (existingGoals.length === 0 || force) {
        const goalMap = new Map();
        existingGoals.forEach(g => goalMap.set(g.id, g));
        DEMO_GOALS.forEach(g => goalMap.set(g.id, g));
        Storage.set(STORAGE_KEYS.GOALS, Array.from(goalMap.values()));
    }

    const existingConnections = Storage.getCollection(STORAGE_KEYS.CONNECTIONS);
    if (existingConnections.length === 0 || force) {
        const connMap = new Map();
        existingConnections.forEach(c => connMap.set(c.id, c));
        DEMO_CONNECTIONS.forEach(c => connMap.set(c.id, c));
        Storage.set(STORAGE_KEYS.CONNECTIONS, Array.from(connMap.values()));
    }

    const existingNotifs = Storage.getCollection(STORAGE_KEYS.NOTIFICATIONS);
    if (existingNotifs.length === 0 || force) {
        const notifMap = new Map();
        existingNotifs.forEach(n => notifMap.set(n.id, n));
        DEMO_NOTIFICATIONS.forEach(n => notifMap.set(n.id, n));
        Storage.set(STORAGE_KEYS.NOTIFICATIONS, Array.from(notifMap.values()));
    }

    console.log(`[Community Seed] Synchronized community members, past activities, and goals.`);
    return true;
}

window.SKILL_CATEGORIES = SKILL_CATEGORIES;
window.POPULAR_SKILLS = POPULAR_SKILLS;
window.DEMO_USERS = DEMO_USERS;
window.DEMO_SKILLS = DEMO_SKILLS;
window.DEMO_ACTIVITIES = DEMO_ACTIVITIES;
window.DEMO_GOALS = DEMO_GOALS;
window.DEMO_CONNECTIONS = DEMO_CONNECTIONS;
window.DEMO_NOTIFICATIONS = DEMO_NOTIFICATIONS;
window.loadCommunityData = loadCommunityData;
window.loadDemoData = loadCommunityData;
