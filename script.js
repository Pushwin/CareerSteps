// Global variables
let currentUser = null;
let selectedCareer = null;
let currentStep = null;
let careerSteps = [];

// Gemini API configuration
const GEMINI_API_KEY = 'GEMINI_API_KEY_PLACEHOLDER';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Utility functions
function showMessage(elementId, message, type = 'info') {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 3000);
        }
    }
}

function hideMessage(elementId) {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.style.display = 'none';
    }
}

// Local storage functions
function saveUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

function getUserData(email) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(user => user.email === email);
}

function saveUserData(userData) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingIndex = users.findIndex(user => user.email === userData.email);
    
    if (existingIndex >= 0) {
        users[existingIndex] = userData;
    } else {
        users.push(userData);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'loginpageandsighup.html';
}

// Gemini API functions
async function callGeminiAPI(prompt) {
    try {
        console.log('Calling Gemini API with key:', GEMINI_API_KEY ? 'Key present' : 'No key');
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response data:', data);
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format from Gemini API');
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}

async function generateCareerSteps(career) {
    const prompt = `Generate a comprehensive learning path for ${career} with 8-10 detailed steps. 
    Each step should include:
    - Step number and title
    - Duration estimate
    - Detailed description (2-3 sentences)
    - Key skills to learn
    
    Format as JSON array with objects containing: stepNumber, title, duration, description, skills (array)
    
    Make it practical and industry-relevant for 2024-2025.`;

    try {
        const response = await callGeminiAPI(prompt);
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('Could not parse JSON from response');
        }
    } catch (error) {
        console.error('Error generating career steps:', error);
        // Fallback to default steps if API fails
        return getDefaultCareerSteps(career);
    }
}

async function generateResources(career, stepTitle, stepDescription) {
    const prompt = `Generate detailed learning resources for this step in ${career}:
    Step: ${stepTitle}
    Description: ${stepDescription}
    
    IMPORTANT: Only suggest resources that actually exist. For YouTube videos, suggest search terms instead of specific URLs that might not exist.
    
    Provide resources in these categories:
    1. YouTube Search Terms (5-7 search queries that will find relevant videos)
    2. Documentation/Articles (4-5 items with real websites like MDN, official docs)
    3. Project Ideas (3-4 practical projects with descriptions - no URLs needed)
    4. Practice Platforms (3-4 real coding/learning platforms like freeCodeCamp, Codecademy)
    
    Format as JSON object with keys: videos, documents, projects, practice
    For videos: use title, description, searchQuery (instead of url), difficulty, duration
    For others: title, description, url (only if it's a real site), difficulty, duration
    
    Example for video entry:
    {
      "title": "JavaScript Basics Tutorial",
      "description": "Learn JavaScript fundamentals",
      "searchQuery": "javascript tutorial for beginners 2024",
      "difficulty": "beginner",
      "duration": "2-4 hours"
    }`;

    try {
        const response = await callGeminiAPI(prompt);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const resources = JSON.parse(jsonMatch[0]);
            // Convert search queries to YouTube search URLs
            if (resources.videos) {
                resources.videos = resources.videos.map(video => ({
                    ...video,
                    url: `https://youtube.com/results?search_query=${encodeURIComponent(video.searchQuery || video.title)}`
                }));
            }
            return resources;
        } else {
            throw new Error('Could not parse JSON from response');
        }
    } catch (error) {
        console.error('Error generating resources:', error);
        // Fallback to default resources if API fails
        return getDefaultResources(career, stepTitle);
    }
}

// Default fallback data
function getDefaultCareerSteps(career) {
    const defaultSteps = {
        'web-development': [
            {
                stepNumber: 1,
                title: "HTML & CSS Fundamentals",
                duration: "2-3 weeks",
                description: "Learn the building blocks of web development. Master HTML structure and CSS styling to create beautiful, responsive websites.",
                skills: ["HTML5", "CSS3", "Flexbox", "CSS Grid", "Responsive Design"]
            },
            {
                stepNumber: 2,
                title: "JavaScript Basics",
                duration: "3-4 weeks",
                description: "Understand programming fundamentals with JavaScript. Learn variables, functions, DOM manipulation, and event handling.",
                skills: ["JavaScript ES6+", "DOM Manipulation", "Event Handling", "Functions", "Objects"]
            },
            {
                stepNumber: 3,
                title: "Frontend Framework - React",
                duration: "4-5 weeks",
                description: "Master React.js to build dynamic, interactive user interfaces. Learn components, state management, and hooks.",
                skills: ["React.js", "JSX", "Components", "State Management", "React Hooks"]
            },
            {
                stepNumber: 4,
                title: "Backend Development - Node.js",
                duration: "4-5 weeks",
                description: "Build server-side applications with Node.js and Express. Learn to create APIs and handle server logic.",
                skills: ["Node.js", "Express.js", "REST APIs", "Middleware", "Authentication"]
            },
            {
                stepNumber: 5,
                title: "Database Management",
                duration: "3-4 weeks",
                description: "Learn database design and management with MongoDB and SQL. Understand data modeling and queries.",
                skills: ["MongoDB", "SQL", "Database Design", "Mongoose", "Data Modeling"]
            },
            {
                stepNumber: 6,
                title: "Full-Stack Project",
                duration: "4-6 weeks",
                description: "Build a complete full-stack application integrating frontend, backend, and database technologies.",
                skills: ["Full-Stack Integration", "Project Planning", "Git", "Deployment", "Testing"]
            }
        ],
        'data-science': [
            {
                stepNumber: 1,
                title: "Python Programming Fundamentals",
                duration: "3-4 weeks",
                description: "Master Python programming basics including syntax, data structures, and object-oriented programming concepts.",
                skills: ["Python", "Data Structures", "OOP", "Functions", "File Handling"]
            },
            {
                stepNumber: 2,
                title: "Statistics and Mathematics",
                duration: "4-5 weeks",
                description: "Learn essential statistical concepts and mathematical foundations required for data science.",
                skills: ["Statistics", "Probability", "Linear Algebra", "Calculus", "Hypothesis Testing"]
            },
            {
                stepNumber: 3,
                title: "Data Manipulation with Pandas",
                duration: "3-4 weeks",
                description: "Master data manipulation and analysis using Pandas library. Learn to clean and transform data effectively.",
                skills: ["Pandas", "NumPy", "Data Cleaning", "Data Transformation", "Data Analysis"]
            },
            {
                stepNumber: 4,
                title: "Data Visualization",
                duration: "2-3 weeks",
                description: "Create compelling visualizations using Matplotlib, Seaborn, and Plotly to communicate insights effectively.",
                skills: ["Matplotlib", "Seaborn", "Plotly", "Data Storytelling", "Dashboard Creation"]
            },
            {
                stepNumber: 5,
                title: "Machine Learning Basics",
                duration: "5-6 weeks",
                description: "Understand fundamental machine learning algorithms and implement them using Scikit-learn.",
                skills: ["Scikit-learn", "Supervised Learning", "Unsupervised Learning", "Model Evaluation", "Feature Engineering"]
            },
            {
                stepNumber: 6,
                title: "Advanced Machine Learning",
                duration: "4-5 weeks",
                description: "Explore deep learning with TensorFlow/PyTorch and advanced algorithms for complex problems.",
                skills: ["TensorFlow", "PyTorch", "Deep Learning", "Neural Networks", "Model Optimization"]
            }
        ]
    };
    
    return defaultSteps[career] || defaultSteps['web-development'];
}

function getDefaultResources(career, stepTitle) {
    const resourcesByStep = {
        "HTML & CSS Fundamentals": {
            videos: [
                {
                    title: "HTML & CSS Full Course Tutorial",
                    description: "Complete HTML and CSS tutorial from basics to advanced",
                    url: "https://youtube.com/results?search_query=html+css+full+course+tutorial+2024",
                    difficulty: "beginner",
                    duration: "4-8 hours"
                },
                {
                    title: "CSS Flexbox and Grid Tutorial",
                    description: "Master modern CSS layout techniques",
                    url: "https://youtube.com/results?search_query=css+flexbox+grid+tutorial+responsive",
                    difficulty: "intermediate",
                    duration: "2-3 hours"
                }
            ]
        },
        "JavaScript Basics": {
            videos: [
                {
                    title: "JavaScript Tutorial for Beginners",
                    description: "Complete JavaScript course covering fundamentals",
                    url: "https://youtube.com/results?search_query=javascript+tutorial+beginners+2024+full+course",
                    difficulty: "beginner",
                    duration: "6-10 hours"
                },
                {
                    title: "Modern JavaScript ES6+ Features",
                    description: "Learn modern JavaScript features and syntax",
                    url: "https://youtube.com/results?search_query=javascript+es6+modern+features+tutorial",
                    difficulty: "intermediate",
                    duration: "3-4 hours"
                }
            ]
        },
        "Frontend Framework - React": {
            videos: [
                {
                    title: "React JS Full Course for Beginners",
                    description: "Complete React tutorial from scratch",
                    url: "https://youtube.com/results?search_query=react+js+full+course+beginners+2024",
                    difficulty: "intermediate",
                    duration: "8-12 hours"
                },
                {
                    title: "React Hooks Tutorial",
                    description: "Master React Hooks with practical examples",
                    url: "https://youtube.com/results?search_query=react+hooks+tutorial+useState+useEffect",
                    difficulty: "intermediate",
                    duration: "2-3 hours"
                }
            ]
        },
        "Python Programming Fundamentals": {
            videos: [
                {
                    title: "Python for Beginners - Full Course",
                    description: "Complete Python tutorial for beginners",
                    url: "https://youtube.com/results?search_query=python+programming+full+course+beginners+2024",
                    difficulty: "beginner",
                    duration: "8-12 hours"
                },
                {
                    title: "Python Object Oriented Programming",
                    description: "Learn OOP concepts in Python",
                    url: "https://youtube.com/results?search_query=python+object+oriented+programming+oop+tutorial",
                    difficulty: "intermediate",
                    duration: "4-6 hours"
                }
            ]
        }
    };

    const defaultVideos = resourcesByStep[stepTitle]?.videos || [
        {
            title: `${stepTitle} - Tutorial`,
            description: "Learn the fundamentals and practical applications",
            url: "https://youtube.com/results?search_query=" + encodeURIComponent(stepTitle + " tutorial"),
            difficulty: "beginner",
            duration: "2-4 hours"
        }
    ];

    return {
        videos: defaultVideos,
        documents: [
            {
                title: "MDN Web Docs - HTML",
                description: "Official Mozilla documentation for HTML",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
                difficulty: "beginner",
                duration: "2-3 hours"
            },
            {
                title: "CSS-Tricks - Complete Guide",
                description: "Comprehensive CSS guides and tutorials",
                url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
                difficulty: "intermediate",
                duration: "1-2 hours"
            },
            {
                title: "W3Schools - Web Development",
                description: "Interactive tutorials and references",
                url: "https://www.w3schools.com/html/",
                difficulty: "beginner",
                duration: "3-4 hours"
            }
        ],
        projects: [
            {
                title: "Personal Portfolio Website",
                description: "Build your own responsive portfolio using HTML, CSS, and JavaScript",
                url: "https://github.com/topics/portfolio-website",
                difficulty: "beginner",
                duration: "1-2 weeks"
            },
            {
                title: "Landing Page Design",
                description: "Create a modern, responsive landing page",
                url: "https://github.com/topics/landing-page",
                difficulty: "intermediate",
                duration: "3-5 days"
            },
            {
                title: "CSS Animation Challenge",
                description: "Build interactive animations and transitions",
                url: "https://github.com/topics/css-animation",
                difficulty: "intermediate",
                duration: "1 week"
            }
        ],
        practice: [
            {
                title: "freeCodeCamp",
                description: "Free coding bootcamp with certification",
                url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
                difficulty: "beginner",
                duration: "Ongoing"
            },
            {
                title: "Codecademy",
                description: "Interactive HTML & CSS courses",
                url: "https://www.codecademy.com/learn/learn-html",
                difficulty: "beginner",
                duration: "Ongoing"
            },
            {
                title: "CSS Battle",
                description: "CSS coding challenges and competitions",
                url: "https://cssbattle.dev/",
                difficulty: "intermediate",
                duration: "Ongoing"
            },
            {
                title: "Frontend Mentor",
                description: "Real-world frontend challenges",
                url: "https://www.frontendmentor.io/challenges",
                difficulty: "intermediate",
                duration: "Ongoing"
            }
        ]
    };
}

// Authentication page functions
function initAuthPage() {
    // Check if user is already logged in
    currentUser = getCurrentUser();
    if (currentUser) {
        window.location.href = 'careerchoose.html';
        return;
    }

    const showSignupBtn = document.getElementById('showSignup');
    const showLoginBtn = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginFormElement = document.getElementById('loginFormElement');
    const signupFormElement = document.getElementById('signupFormElement');

    // Toggle between login and signup forms
    showSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        hideMessage('authMessage');
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
        hideMessage('authMessage');
    });

    // Handle login
    loginFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const user = getUserData(email);
        
        if (user && user.password === password) {
            currentUser = user;
            saveUser(user);
            showMessage('authMessage', 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'careerchoose.html';
            }, 1000);
        } else {
            showMessage('authMessage', 'Invalid email or password. Please try again.', 'error');
        }
    });

    // Handle signup
    signupFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (password !== confirmPassword) {
            showMessage('authMessage', 'Passwords do not match.', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('authMessage', 'Password must be at least 6 characters long.', 'error');
            return;
        }

        // Check if user already exists
        if (getUserData(email)) {
            showMessage('authMessage', 'User with this email already exists.', 'error');
            return;
        }

        // Create new user
        const newUser = {
            name: name,
            email: email,
            password: password,
            joinDate: new Date().toISOString(),
            completedSteps: [],
            selectedCareer: null
        };

        saveUserData(newUser);
        currentUser = newUser;
        saveUser(newUser);

        showMessage('authMessage', 'Account created successfully! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'careerchoose.html';
        }, 1000);
    });
}

// Career choose page functions
function initCareerChoosePage() {
    // Check if user is logged in
    currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'loginpageandsighup.html';
        return;
    }

    // Update user greeting
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.textContent = `Welcome, ${currentUser.name}!`;
    }

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Handle career selection
    const careerCards = document.querySelectorAll('.career-card');
    careerCards.forEach(card => {
        card.addEventListener('click', () => {
            const career = card.getAttribute('data-career');
            selectedCareer = career;
            
            // Update user's selected career
            currentUser.selectedCareer = career;
            saveUser(currentUser);
            saveUserData(currentUser);
            
            showMessage('careerMessage', `Selected ${card.querySelector('h3').textContent}! Generating your learning path...`, 'success');
            
            setTimeout(() => {
                window.location.href = 'steps.html';
            }, 1500);
        });
    });
}

// Steps page functions
function initStepsPage() {
    // Check if user is logged in
    currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'loginpageandsighup.html';
        return;
    }

    // Check if career is selected
    if (!currentUser.selectedCareer) {
        window.location.href = 'careerchoose.html';
        return;
    }

    selectedCareer = currentUser.selectedCareer;

    // Handle navigation
    const backToCareerBtn = document.getElementById('backToCareerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (backToCareerBtn) {
        backToCareerBtn.addEventListener('click', () => {
            window.location.href = 'careerchoose.html';
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Update career title
    const careerTitle = document.getElementById('careerTitle');
    if (careerTitle) {
        careerTitle.textContent = `${selectedCareer.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Learning Path`;
    }

    // Generate and display steps
    generateAndDisplaySteps();
}

async function generateAndDisplaySteps() {
    const loadingEl = document.getElementById('loadingSteps');
    const contentEl = document.getElementById('stepsContent');
    const careerDescEl = document.getElementById('careerDescription');
    
    try {
        // Show loading
        loadingEl.style.display = 'block';
        contentEl.style.display = 'none';
        
        // Generate steps using Gemini API
        careerSteps = await generateCareerSteps(selectedCareer);
        
        // Update career description
        if (careerDescEl) {
            careerDescEl.textContent = `Complete this ${careerSteps.length}-step learning journey to master ${selectedCareer.replace('-', ' ')}.`;
        }
        
        // Display steps
        displaySteps();
        
        // Hide loading and show content
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        
    } catch (error) {
        console.error('Error generating steps:', error);
        showMessage('stepsMessage', 'Error generating learning path. Using default curriculum.', 'error');
        
        // Use default steps as fallback
        careerSteps = getDefaultCareerSteps(selectedCareer);
        displaySteps();
        
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
    }
}

function displaySteps() {
    const stepsList = document.getElementById('stepsList');
    if (!stepsList) return;
    
    stepsList.innerHTML = '';
    
    careerSteps.forEach((step, index) => {
        const stepEl = document.createElement('div');
        stepEl.className = 'step-item';
        stepEl.setAttribute('data-step', index);
        
        // Check if step is completed
        const isCompleted = currentUser.completedSteps && currentUser.completedSteps.includes(index);
        if (isCompleted) {
            stepEl.classList.add('completed');
        }
        
        stepEl.innerHTML = `
            <div class="step-header">
                <div class="step-number">${step.stepNumber}</div>
                <div class="step-title">${step.title}</div>
                <div class="step-duration">${step.duration}</div>
            </div>
            <div class="step-description">${step.description}</div>
            <div class="step-skills">
                ${step.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        `;
        
        // Add click handler to open resources
        stepEl.addEventListener('click', () => {
            currentStep = index;
            localStorage.setItem('currentStep', JSON.stringify(step));
            window.location.href = 'resources.html';
        });
        
        stepsList.appendChild(stepEl);
    });
    
    // Update progress bar
    updateProgress();
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    if (!progressFill) return;
    
    const completedSteps = currentUser.completedSteps ? currentUser.completedSteps.length : 0;
    const totalSteps = careerSteps.length;
    const progressPercentage = (completedSteps / totalSteps) * 100;
    
    progressFill.style.width = `${progressPercentage}%`;
}

// Resources page functions
function initResourcesPage() {
    // Check if user is logged in
    currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'loginpageandsighup.html';
        return;
    }

    // Check if step is selected
    const stepData = localStorage.getItem('currentStep');
    if (!stepData) {
        window.location.href = 'steps.html';
        return;
    }

    currentStep = JSON.parse(stepData);

    // Handle navigation
    const backToStepsBtn = document.getElementById('backToStepsBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (backToStepsBtn) {
        backToStepsBtn.addEventListener('click', () => {
            window.location.href = 'steps.html';
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Update step information
    const resourceTitle = document.getElementById('resourceTitle');
    const stepTitle = document.getElementById('stepTitle');
    const stepDescription = document.getElementById('stepDescription');
    
    if (resourceTitle) {
        resourceTitle.textContent = `Resources: ${currentStep.title}`;
    }
    
    if (stepTitle) {
        stepTitle.textContent = currentStep.title;
    }
    
    if (stepDescription) {
        stepDescription.textContent = currentStep.description;
    }

    // Initialize tabs
    initResourceTabs();
    
    // Generate and display resources
    generateAndDisplayResources();
}

function initResourceTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and panels
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            btn.classList.add('active');
            document.getElementById(`${targetTab}Tab`).classList.add('active');
        });
    });
}

async function generateAndDisplayResources() {
    const loadingEl = document.getElementById('loadingResources');
    const contentEl = document.getElementById('resourcesContent');
    
    try {
        // Show loading
        loadingEl.style.display = 'block';
        contentEl.style.display = 'none';
        
        // Generate resources using Gemini API
        const resources = await generateResources(currentUser.selectedCareer, currentStep.title, currentStep.description);
        
        // Display resources in each tab
        displayVideos(resources.videos || []);
        displayDocuments(resources.documents || []);
        displayProjects(resources.projects || []);
        displayPractice(resources.practice || []);
        
        // Hide loading and show content
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        
    } catch (error) {
        console.error('Error generating resources:', error);
        showMessage('resourcesMessage', 'Error generating resources. Using default resources.', 'error');
        
        // Use default resources as fallback
        const defaultResources = getDefaultResources(currentUser.selectedCareer, currentStep.title);
        displayVideos(defaultResources.videos);
        displayDocuments(defaultResources.documents);
        displayProjects(defaultResources.projects);
        displayPractice(defaultResources.practice);
        
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
    }
}

function displayVideos(videos) {
    const videosList = document.getElementById('videosList');
    if (!videosList) return;
    
    videosList.innerHTML = '';
    
    videos.forEach(video => {
        const videoEl = document.createElement('div');
        videoEl.className = 'resource-item';
        videoEl.innerHTML = `
            <div class="resource-title">${video.title}</div>
            <div class="resource-description">${video.description}</div>
            <a href="${video.url}" target="_blank" rel="noopener noreferrer" class="resource-link">Watch Video</a>
            <div class="resource-meta">
                <span class="difficulty ${video.difficulty}">${video.difficulty}</span>
                <span>Duration: ${video.duration}</span>
            </div>
        `;
        videosList.appendChild(videoEl);
    });
}

function displayDocuments(documents) {
    const documentsList = document.getElementById('documentsList');
    if (!documentsList) return;
    
    documentsList.innerHTML = '';
    
    documents.forEach(doc => {
        const docEl = document.createElement('div');
        docEl.className = 'resource-item';
        docEl.innerHTML = `
            <div class="resource-title">${doc.title}</div>
            <div class="resource-description">${doc.description}</div>
            <a href="${doc.url}" target="_blank" rel="noopener noreferrer" class="resource-link">Read Article</a>
            <div class="resource-meta">
                <span class="difficulty ${doc.difficulty}">${doc.difficulty}</span>
                <span>Reading time: ${doc.duration}</span>
            </div>
        `;
        documentsList.appendChild(docEl);
    });
}

function displayProjects(projects) {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;
    
    projectsList.innerHTML = '';
    
    projects.forEach(project => {
        const projectEl = document.createElement('div');
        projectEl.className = 'resource-item';
        projectEl.innerHTML = `
            <div class="resource-title">${project.title}</div>
            <div class="resource-description">${project.description}</div>
            <div class="resource-meta">
                <span class="difficulty ${project.difficulty}">${project.difficulty}</span>
                <span>Estimated time: ${project.duration}</span>
            </div>
        `;
        projectsList.appendChild(projectEl);
    });
}

function displayPractice(practice) {
    const practiceList = document.getElementById('practiceList');
    if (!practiceList) return;
    
    practiceList.innerHTML = '';
    
    practice.forEach(platform => {
        const platformEl = document.createElement('div');
        platformEl.className = 'resource-item';
        platformEl.innerHTML = `
            <div class="resource-title">${platform.title}</div>
            <div class="resource-description">${platform.description}</div>
            <a href="${platform.url}" target="_blank" rel="noopener noreferrer" class="resource-link">Visit Platform</a>
            <div class="resource-meta">
                <span class="difficulty ${platform.difficulty}">${platform.difficulty}</span>
                <span>${platform.duration}</span>
            </div>
        `;
        practiceList.appendChild(platformEl);
    });
}

// Initialize page based on current URL
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'loginpageandsighup.html':
        case '':
        case '/':
            initAuthPage();
            break;
        case 'careerchoose.html':
            initCareerChoosePage();
            break;
        case 'steps.html':
            initStepsPage();
            break;
        case 'resources.html':
            initResourcesPage();
            break;
    }
});
