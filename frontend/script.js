// Ninja Ping: Wake up Render server in the background silently
const RENDER_BACKEND_URL = "https://nexora-backend-m37r.onrender.com"; // Yahan apna asli Render URL daalna

fetch(`${RENDER_BACKEND_URL}/docs`)
    .then(() => console.log("✅ AI Engine is awake and ready!"))
    .catch(() => console.log("Waking up AI Engine..."));

// Ensure DOM is fully loaded before animating
document.addEventListener("DOMContentLoaded", () => {
    
    // Navbar Animation - Slides down from top
    gsap.from(".navbar", {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    // Hero Section Animations - Staggered fade in and slide up
    gsap.from(".badge", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out"
    });

    gsap.from(".hero-title", {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: "power3.out"
    });

    gsap.from(".hero-subtitle", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        ease: "power3.out"
    });

    gsap.from(".hero-cta", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.8,
        ease: "power3.out"
    });

    // Dashboard Preview Animation - Zooms in slightly
    gsap.from(".dashboard-preview", {
        y: 50,
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        delay: 1,
        ease: "back.out(1.2)"
    });
});

// --- MODAL & AUTHENTICATION LOGIC ---

// Elements
const modal = document.getElementById('authModal');
const closeModalBtn = document.getElementById('closeModal');
const loginBtn = document.getElementById('loginBtn');
const getStartedBtn = document.getElementById('getStartedBtn');
const startGenBtn = document.getElementById('startGenBtn');

// Toggle Elements (Login vs Signup)
const toggleAuthMode = document.getElementById('toggleAuthMode');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const nameField = document.getElementById('nameField');
const submitAuthBtn = document.getElementById('submitAuthBtn');
const toggleAuthText = document.getElementById('toggleAuthText');

let isLoginMode = true;

// Open Modal Function
const openModal = (mode = 'login') => {
    modal.classList.remove('hidden');
    
    // Smooth GSAP animation for modal popup
    gsap.fromTo(".modal-content", 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
    );

    if (mode === 'signup' && isLoginMode) {
        toggleMode();
    } else if (mode === 'login' && !isLoginMode) {
        toggleMode();
    }
};

// Close Modal Function
const closeModal = () => {
    modal.classList.add('hidden');
};

// Toggle between Login and Sign Up
const toggleMode = () => {
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        modalTitle.innerText = "Welcome Back";
        modalSubtitle.innerText = "Login to access your AI dashboard";
        nameField.classList.add('hidden');
        submitAuthBtn.innerHTML = 'Login securely <i class="fa-solid fa-arrow-right"></i>';
        toggleAuthText.innerHTML = 'Don\'t have an account? <span id="toggleAuthMode" class="highlight-link">Sign up</span>';
    } else {
        modalTitle.innerText = "Create Account";
        modalSubtitle.innerText = "Start generating premium content today";
        nameField.classList.remove('hidden');
        submitAuthBtn.innerHTML = 'Create Account <i class="fa-solid fa-arrow-right"></i>';
        toggleAuthText.innerHTML = 'Already have an account? <span id="toggleAuthMode" class="highlight-link">Login</span>';
    }
    
    // Re-attach event listener to new injected span
    document.getElementById('toggleAuthMode').addEventListener('click', toggleMode);
};

// Event Listeners for Buttons
loginBtn.addEventListener('click', () => openModal('login'));
getStartedBtn.addEventListener('click', () => openModal('signup'));
startGenBtn.addEventListener('click', () => openModal('signup'));
closeModalBtn.addEventListener('click', closeModal);

// Close modal if clicked outside the box
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Initial attachment for toggle button
toggleAuthMode.addEventListener('click', toggleMode);


// --- NEW: PREMIUM LOADER FUNCTIONS ---
// Show Premium Loader overlay
function showServerLoader() {
    const loader = document.createElement('div');
    loader.id = 'premium-server-loader';
    loader.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.7); backdrop-filter:blur(8px); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:9999; text-align:center;">
            <i class="fa-solid fa-wand-magic-sparkles fa-spin" style="font-size: 50px; color: #005571; margin-bottom:20px;"></i>
            <h2 style="color:#111; font-family:sans-serif; margin-bottom:10px;">Initializing AI Engine... 🚀</h2>
            <p style="color:#555; font-family:sans-serif; font-size:16px;">Booting up secure servers. This might take 30-50 seconds.<br>Grab a sip of water!</p>
        </div>
    `;
    document.body.appendChild(loader);
}

// Hide Premium Loader overlay
function hideServerLoader() {
    const loader = document.getElementById('premium-server-loader');
    if (loader) loader.remove();
}


// --- API CONNECTION FOR LOGIN & SIGNUP ---
const authForm = document.getElementById('authForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const API_BASE_URL = "https://nexora-backend-m37r.onrender.com"; // Tumhara FastAPI backend port

authForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Ye page reload hone se rokega!
    
    // Button ko loading state me dikhana
    const originalBtnText = submitAuthBtn.innerHTML;
    submitAuthBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    submitAuthBtn.disabled = true;

    // Jaise hi user Login/Signup par click karega, Premium Loader screen par aa jayega
    showServerLoader();

    try {
        if (isLoginMode) {
            // --- LOGIN LOGIC ---
            // FastAPI expects form data for login
            const formData = new URLSearchParams();
            formData.append('username', emailInput.value); // FastAPI uses 'username' field for email
            formData.append('password', passwordInput.value);

            const response = await fetch(`${API_BASE_URL}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (!response.ok) throw new Error("Invalid Email or Password");
            
            const data = await response.json();
            
            // Save Token securely in browser
            localStorage.setItem('nexora_token', data.access_token);
            
            // Redirect to dashboard
            window.location.href = "dashboard.html";

        } else {
            // --- SIGNUP LOGIC ---
            const payload = {
                full_name: fullNameInput.value,
                email: emailInput.value,
                password: passwordInput.value
            };

            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Error creating account");
            }

            // Signup successful, now automatically switch to login mode
            alert("Account created successfully! Please login.");
            toggleMode();
        }
    } catch (error) {
        alert(error.message); // Agar koi error aayi (jaise wrong password) to alert dikhayega
    } finally {
        // Button ko wapas normal kar do aur Premium loader hata do
        submitAuthBtn.innerHTML = originalBtnText;
        submitAuthBtn.disabled = false;
        hideServerLoader(); 
    }
});