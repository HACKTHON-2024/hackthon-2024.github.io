// Add network status monitoring
window.addEventListener('online', handleNetworkChange);
window.addEventListener('offline', handleNetworkChange);

// Initial network check
checkNetworkStatus();

// Function to check network status initially
function checkNetworkStatus() {
    if (!navigator.onLine) {
        window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/network-error.html';
    } else {
        checkServerStatus();
    }
}

// Function to handle network changes
function handleNetworkChange(event) {
    if (!navigator.onLine) {
        window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/network-error.html';
    } else {
        const currentPath = window.location.pathname;
        if (currentPath.includes('network-error') || currentPath.includes('server-error')) {
            checkServerStatus().then(isServerRunning => {
                if (isServerRunning) {
                    window.location.href = 'https://labourfieldtest.onrender.com/frontend/static/home_page/index.html';
                }
            });
        }
    }
}

// Function to check if server is running
async function checkServerStatus() {
    try {
        const response = await fetch('https://labourfieldtest.onrender.com/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(5000)
        });
        return true;
    } catch (error) {
        if (!window.location.pathname.includes('server-error.html')) {
            window.location.href = '../server-error.html';
        }
        return false;
    }
}

// Check server status every 5 seconds
setInterval(checkServerStatus, 5000);

// Get the modals
var modal = document.getElementById("loginModal");
var alertt = document.getElementById("alert");

// Get the buttons that open the modal
var loginBtn = document.getElementById("loginBtn");
var signupBtn = document.getElementById("signupBtn"); // New signup button
var active = document.getElementById("active");
var list = document.getElementById("list");
var request = document.getElementById("request");

// Get the <span> elements that close the modals
var closeButtons = document.getElementsByClassName("close");
var ok = document.getElementById("ok");

// Flag to track if it's login or signup
var isLogin = true;

// Check if user is logged in (replace 'userToken' with your key in localStorage or sessionStorage)
var userLoggedIn = localStorage.getItem('jwt') !== null; // Assuming a token is saved on login

// Function to decode JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error parsing JWT:", e);
        return null;
    }
}

// Modify the checkAuthAndRedirect function
function checkAuthAndRedirect() {
    const jwt = localStorage.getItem('jwt');
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    
    if (jwt) {
        // User is logged in - hide login/signup buttons
        if (loginBtn) loginBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";
    } else {
        // User is not logged in - show login/signup buttons
        if (loginBtn) loginBtn.style.display = "block";
        if (signupBtn) signupBtn.style.display = "block";
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndRedirect();
});

// When the user clicks the "Log In" button, open the modal and set flag to login
loginBtn.onclick = function() {
    isLogin = true;
    modal.style.display = "block";
}

// When the user clicks the "Sign Up" button, open the modal and set flag to signup
signupBtn.onclick = function() {
    isLogin = false;
    modal.style.display = "block";
}

// Get service buttons
const activeJobsBtn = document.getElementById("active");
const jobListingsBtn = document.getElementById("list");
const labourRequestBtn = document.getElementById("request");

// Function to handle service button clicks
function handleServiceRedirect(userType) {
    if (!userType) {
        alertt.style.display = "block";
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    const baseUrl = 'https://labourfieldtest.onrender.com/frontend';
    let redirectUrl;

    if (userType === 'labour') {
        redirectUrl = `${baseUrl}/Labours/LandOwner_Jobs/index.html`;
    } else if (userType === 'landowner') {
        redirectUrl = `${baseUrl}/Landowner/Job_Listing/index.html`;
    }

    if (redirectUrl) {
        window.location.href = redirectUrl;
    }
}

// Event listeners for service buttons
if (activeJobsBtn) {
    activeJobsBtn.onclick = function() {
        const jwt = localStorage.getItem('jwt');
        const userType = localStorage.getItem('userType');
        
        if (!jwt) {
            alertt.style.display = "block";
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Specific handling for Active Jobs
        if (userType === 'labour') {
            window.location.href = 'https://labourfieldtest.onrender.com/frontend/Labours/Active_Jobs/index.html';
        } else if (userType === 'landowner') {
            window.location.href = 'https://labourfieldtest.onrender.com/frontend/Landowner/active_job/index.html';
        }
    }
}

if (jobListingsBtn) {
    jobListingsBtn.onclick = function() {
        const jwt = localStorage.getItem('jwt');
        const userType = localStorage.getItem('userType');
        
        if (!jwt) {
            alertt.style.display = "block";
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Specific handling for Job Listings
        if (userType === 'labour') {
            window.location.href = 'https://labourfieldtest.onrender.com/frontend/Labours/LandOwner_Jobs/index.html';
        } else if (userType === 'landowner') {
            window.location.href = 'https://labourfieldtest.onrender.com/frontend/Landowner/job_listing/index.html';
        }
    }
}

if (labourRequestBtn) {
    labourRequestBtn.onclick = function() {
        const jwt = localStorage.getItem('jwt');
        const userType = localStorage.getItem('userType');
        
        if (!jwt) {
            alertt.style.display = "block";
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Specific handling for Labour Request
        if (userType === 'labour') {
            window.location.href = 'https://labourfieldtest.onrender.com/frontend/Labours/Labour_Request/index.html';
        } else if (userType === 'landowner') {
            window.location.href = 'https://labourfieldtest.onrender.com/frontend/Landowner/Labour_Request/index.html';
        }
    }
}

// When the user clicks on "OK" in the alert popup, close the alert popup
ok.onclick = function() {
    alertt.style.display = "none"; // Hide the alert popup
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top of the page smoothly
}

// Close the modals when the user clicks on <span> (x)
Array.from(closeButtons).forEach(function(closeButton) {
    closeButton.onclick = function() {
        modal.style.display = "none"; // Close the login modal
        alertt.style.display = "none"; // Close the alert popup
    }
});

// When the user clicks anywhere outside the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
    if (event.target == alertt) {
        alertt.style.display = "none";
    }
}

// Modify the landownerBtn and labourBtn click handlers
landownerBtn.onclick = function() {
    if (isLogin) {
        localStorage.setItem('userType', 'landowner'); // Set user type
        window.location.href = "https://labourfieldtest.onrender.com/frontend/Landowner/signin/index.html";
    } else {
        localStorage.setItem('userType', 'landowner'); // Set user type
        window.location.href = "https://labourfieldtest.onrender.com/frontend/Landowner/SIgnUp_Page/index.html";
    }
}

labourBtn.onclick = function() {
    if (isLogin) {
        localStorage.setItem('userType', 'labour'); // Set user type
        window.location.href = "https://labourfieldtest.onrender.com/frontend/Labours/Login_Page/index.html";
    } else {
        localStorage.setItem('userType', 'labour'); // Set user type
        window.location.href = "https://labourfieldtest.onrender.com/frontend/Labours/SIgnUp_Page/index.html";
    }
}
