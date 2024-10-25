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

// Function to show/hide login and signup buttons based on login status
function updateAuthButtons() {
    if (userLoggedIn) {
        loginBtn.style.display = "none"; // Hide login button
        signupBtn.style.display = "none"; // Hide signup button
    } else {
        loginBtn.style.display = "inline-block"; // Show login button
        signupBtn.style.display = "inline-block"; // Show signup button
    }
}

// Run the function to check on page load
updateAuthButtons();

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

// When the user clicks on service buttons, open the alert popup
active.onclick = function() {
    isLogin = false;
    alertt.style.display = "block";
}

list.onclick = function() {
    isLogin = false;
    alertt.style.display = "block";
}

request.onclick = function() {
    isLogin = false;
    alertt.style.display = "block";
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

// Redirect based on the button click and flag status
landownerBtn.onclick = function() {
    if (isLogin) {
        window.location.href = "http://localhost:5500/frontend/Landowner/signin/index.html"; // Replace with actual login path
    } else {
        window.location.href = "http://localhost:5500/frontend/Landowner/SignUp_Page/index.html"; // Replace with actual signup path
    }
}

labourBtn.onclick = function() {
    if (isLogin) {
        window.location.href = "http://localhost:5500/frontend/Labours/Login_Page/index.html"; // Replace with actual login path
    } else {
        window.location.href = "http://localhost:5500/frontend/Labours/SignUp_Page/index.html"; // Replace with actual signup path
    }
}
