document.addEventListener('DOMContentLoaded', async function () {
    // Add network status monitoring
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);


    // Add this new function to handle network changes
    function handleNetworkChange(event) {
        if (!navigator.onLine) {
            // Redirect to network error page when offline
            window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
        } else {
            // Optional: Reload the current page when coming back online
            // Only reload if we were previously on the job listing page
            const currentPath = window.location.pathname;
            if (currentPath.includes('network_error')) {
                window.location.href = '../job_listing/index.html';
            }
        }
    }

});


// Update the checkAuthStatus function
async function checkAuthStatus() {
    const token = getToken();
    const authBtnContainer = document.getElementById('auth-btn-container');
    
    if (!authBtnContainer) {
        console.error('Auth button container not found');
        return;
    }
    
    authBtnContainer.innerHTML = ''; // Clear existing content

    if (token) {
        // If user is logged in, show the styled Logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.className = 'auth-btn';
        logoutBtn.innerHTML = `
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
        `;
        logoutBtn.addEventListener('click', logoutUser); // Add event listener directly
        authBtnContainer.appendChild(logoutBtn);
    } else {
        // If user is not logged in, show the login/signup popup
        showAuthPopup();
    }
}

// Get JWT token from localStorage
function getToken() {
    return localStorage.getItem('jwt');
}

// Make sure to call checkAuthStatus when the page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

// Function to handle network changes
function handleNetworkChange(event) {
    if (!navigator.onLine) {
        // Redirect to network error page when offline
        window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
    } else {
        const currentPath = window.location.pathname;
        if (currentPath.includes('network-error') || currentPath.includes('server-error')) {
            checkServerStatus().then(isServerRunning => {
                if (isServerRunning) {
                    window.history.back();
                }
            });
        }
    }
}

// Function to check if server is running
async function checkServerStatus() {
    try {
        const token = getToken();
        const response = await fetch('http://localhost:3000/landowner/active_jobs', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(5000)
        });
        return true;
    } catch (error) {
        if (!window.location.pathname.includes('server-error.html')) {
            window.location.href = 'http://localhost:5500/frontend/static/server-error.html';
        }
        return false;
    }
}

// Elements
const walletBalanceEl = document.getElementById('wallet-balance');
const addFundsBtn = document.getElementById('add-funds-btn');
const payButtons = document.querySelectorAll('.pay-btn');
const addFundsPopup = document.getElementById('add-funds-popup');
const closePopup = document.getElementById('close-popup');
const confirmPayment = document.getElementById('confirm-payment');
const paymentMethod = document.getElementById('payment-method');
const amountInput = document.getElementById('amount');
const navbar = document.querySelector('.navbar'); // Select the navbar

// Open Add Funds Popup
addFundsBtn.addEventListener('click', () => {
    addFundsPopup.classList.remove('hidden');
    navbar.classList.add('transparent'); // Change navbar to semi-transparent
});

// Close Popup
closePopup.addEventListener('click', () => {
    addFundsPopup.classList.add('hidden');
    navbar.classList.remove('transparent'); // Restore original navbar background
});

// Function to log transactions
function logTransaction(amount, type) {
    const transactionList = document.getElementById('transaction-list');
    const transactionItem = document.createElement('li');
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    transactionItem.className = 'transaction-item';
    transactionItem.innerHTML = `
        <div class="transaction-icon">
            <i class="${type === 'added' ? 'fas fa-wallet' : 'fas fa-shopping-cart'}"></i>
        </div>
        <div class="transaction-details">
            <div class="transaction-amount">₹${amount}</div>
            <div class="transaction-date">${date} at ${time}</div>
        </div>
    `;
    transactionItem.classList.add(type === 'added' ? 'transaction-added' : 'transaction-debited');
    transactionList.appendChild(transactionItem);
}


// Confirm Payment and Add to Wallet
confirmPayment.addEventListener('click', () => {
    const amount = parseInt(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Enter a valid amount!');
        return;
    }
    const currentBalance = parseInt(walletBalanceEl.textContent);
    walletBalanceEl.textContent = currentBalance + amount;
    alert(`₹${amount} added to your wallet!`);
    logTransaction(amount, 'added'); // Log the transaction
    document.getElementById('amount').value = ''; // Clear the input field
});

// Deduct Payment for Jobs
payButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const amount = parseInt(btn.dataset.amount);
        const currentBalance = parseInt(walletBalanceEl.textContent);
        if (currentBalance >= amount) {
            walletBalanceEl.textContent = currentBalance - amount;
            alert(`₹${amount} paid for job!`);
        } else {
            alert('Insufficient wallet balance! Please add funds.');
        }
    });
});

// Get Minimum Amount for Payment Methods
function getMinimumAmount(method) {
    switch (method) {
        case 'upi': return 500;
        case 'card': return 1000;
        case 'netbanking': return 2000;
        default: return 0;
    }
}

const wallet = new WalletManager();

// Initialize wallet display
function updateWalletDisplay() {
    const balanceElement = document.getElementById('wallet-balance');
    balanceElement.textContent = wallet.getBalance().toLocaleString('en-IN');
}

// Handle add funds
document.getElementById('add-funds-btn').addEventListener('click', () => {
    document.getElementById('add-funds-popup').classList.remove('hidden');
});

// Handle payment confirmation
document.getElementById('confirm-payment').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('amount').value);
    const method = document.getElementById('payment-method').value;
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const minAmount = getMinimumAmount(method);
    if (amount < minAmount) {
        alert(`Minimum amount for ${method.toUpperCase()} is ₹${minAmount}`);
        return;
    }

    if (wallet.addFunds(amount, method)) {
        updateWalletDisplay();
        document.getElementById('add-funds-popup').classList.add('hidden');
        document.getElementById('amount').value = '';
        showSuccessMessage(`Successfully added ₹${amount} via ${method.toUpperCase()}`);
    }
});

// Close popup
document.getElementById('close-popup').addEventListener('click', () => {
    document.getElementById('add-funds-popup').classList.add('hidden');
});

// Get minimum amount for payment methods
function getMinimumAmount(method) {
    const limits = {
        upi: 100,
        card: 500,
        netbanking: 1000
    };
    return limits[method] || 100;
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Initialize
updateWalletDisplay();
