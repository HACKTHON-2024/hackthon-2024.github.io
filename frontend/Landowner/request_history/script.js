document.addEventListener('DOMContentLoaded', function() {
    // Add network status monitoring
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    console.log('DOM Content Loaded');
    const container = document.querySelector('.request-list');
    if (!navigator.onLine) {
        window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
        return;
    }
    if (!container) {
        console.error('Request list container not found in DOM');
    } else {
        console.log('Request list container found');
        loadRequestHistory();
    }

    // Add this code to set today's date in the datepicker
    const datepicker = document.getElementById('datepicker');
    if (datepicker) {
        const today = new Date();
        // Format date as YYYY-MM-DD for the input value
        const formattedDate = today.toISOString().split('T')[0];
        datepicker.value = formattedDate;
    }
});

async function loadRequestHistory() {
    try {
        if (!navigator.onLine) {
            window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
            return;
        }
        console.log('Starting to load request history...');
        
        const token = localStorage.getItem('jwt');
        console.log('Token:', token ? 'Present' : 'Missing');

        const response = await fetch('http://localhost:3000/landowner/request_history', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });

        console.log('Response status:', response.status);

        if (response.redirected) {
            console.log('Response was redirected');
            window.location.href = '/login';
            return;
        }

        if (!response.ok) {
            console.log('Response not OK:', response.status);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);

        if (Array.isArray(data)) {
            console.log('Processing array of requests:', data);
            displayRequests(data);
        } else if (!data) {
            console.log('No data received');
            throw new Error('No data received from server');
        } else {
            console.error('Invalid data format:', data);
            showError('Invalid data format received');
        }
    } catch (error) {
        console.error('Detailed error:', error);
        if (error.name === 'SyntaxError') {
            console.log('Syntax error - redirecting to login');
            window.location.href = '/login';
        } else {
            showError('Failed to load request history. Please try again later.');
        }
        if (!navigator.onLine) {
            window.location.href = 'http://localhost:5500/frontend/static/network-error.html';
            return;
        }
    }
}

function displayRequests(requests) {
    console.log('Starting to display requests:', requests);

    const container = document.querySelector('.request-list');
    if (!container) {
        console.error('Request list container not found');
        return;
    }
    
    container.innerHTML = '';

    if (!requests || requests.length === 0) {
        console.log('No requests to display');
        container.innerHTML = `
            <div class="no-requests">
                <i class="fas fa-inbox"></i>
                <p>No requests found</p>
            </div>
        `;
        return;
    }

    requests.forEach((request, index) => {
        try {
            console.log('Processing request:', request);
            console.log('Job ID:', request.job_id?._id);

            const statusClass = getStatusClass(request.status);
            const statusText = getStatusText(request.status);
            
            const jobId = request.job_id?._id;
            if (!jobId) {
                console.error('Job ID is missing for request:', request);
            }
            
            const requestCard = `
                <div class="request-card">
                    <div class="request-header" onclick="toggleDetails(this)">
                        <div class="header-content">
                            <div class="labour-info">
                                <i class="fas fa-user"></i>
                                <span>${request.labour_id?.username || 'N/A'}</span>
                            </div>
                            <div class="job-info">
                                <i class="fas fa-briefcase"></i>
                                <span>${request.job_id?.title || 'Untitled Job'}</span>
                            </div>
                            <div class="status ${statusClass}">
                                ${statusText}
                            </div>
                            <div class="date">
                                <i class="far fa-calendar-alt"></i>
                                <span>${new Date(request.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="toggle-icon">
                            <i class="fas fa-chevron-down"></i>
                        </div>
                    </div>
                    <div class="request-details hidden">
                        <div class="details-grid">
                            <div class="detail-item">
                                <i class="fas fa-tasks"></i>
                                <span>Description:</span>
                                <p>${request.job_id?.description || 'No description'}</p>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-users"></i>
                                <span>Workers Needed:</span>
                                <p>${request.job_id?.worker_id?.length || 0}/${request.job_id?.number_of_workers || 0}</p>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-calendar"></i>
                                <span>Duration:</span>
                                <p>${formatDateRange(request.job_id?.start_date, request.job_id?.end_date)}</p>
                            </div>
                        </div>
                        <div class="action-buttons">
                            <button onclick="window.location.href='/frontend/Landowner/Labour_Assigned/index.html?jobId=${jobId}'" class="view-details-btn">
                                <i class="fas fa-user-circle"></i>
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML += requestCard;
        } catch (error) {
            console.error('Error displaying request:', error);
        }
    });
}

function formatDateRange(startDate, endDate) {
    try {
        if (!startDate || !endDate) return 'Dates not specified';
        return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    } catch (error) {
        return 'Invalid dates';
    }
}

function getStatusClass(status) {
    switch(status) {
        case 'ACCEPTED':
            return 'status-accepted';
        case 'REJECTED':
            return 'status-rejected';
        default:
            return 'status-pending';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'ACCEPTED':
            return '<i class="fas fa-check-circle"></i> Accepted';
        case 'REJECTED':
            return '<i class="fas fa-times-circle"></i> Rejected';
        default:
            return '<i class="fas fa-clock"></i> Pending';
    }
}

function showError(message) {
    const container = document.querySelector('.request-list');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

function toggleDetails(element) {
    // Find the closest request card
    const card = element.closest('.request-card');
    if (!card) return;

    // Find the details section and toggle icon within this card
    const details = card.querySelector('.request-details');
    const icon = card.querySelector('.toggle-icon i');
    
    if (!details || !icon) return;

    // Toggle the hidden class and rotate icon
    details.classList.toggle('hidden');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}

function redirectToLabourAssigned(jobId) {
    if (jobId) {
        window.location.href = `/frontend/Landowner/Labour_Assigned/index.html?id=${jobId}`;
    } else {
        console.error('Job ID is undefined');
    }
}

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

// Add this at the beginning of your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    const infoButton = document.querySelector('.floating-info');
    const infoModal = document.querySelector('.info-modal');
    const overlay = document.querySelector('.info-overlay');
    const closeButton = document.querySelector('.close-modal');

    function showModal() {
        infoModal.classList.add('active');
        overlay.classList.add('active');
    }

    function hideModal() {
        infoModal.classList.remove('active');
        overlay.classList.remove('active');
    }

    infoButton.addEventListener('click', showModal);
    closeButton.addEventListener('click', hideModal);
    overlay.addEventListener('click', hideModal);
});

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

document.addEventListener('DOMContentLoaded', function() {
    // Create and append the tour button
    const tourButton = document.createElement('button');
    tourButton.id = 'startTour';
    tourButton.className = 'tour-button';
    tourButton.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>Take a Tour</span>
    `;
    document.body.appendChild(tourButton);

    // Initialize Shepherd Tour
    const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
            classes: 'shadow-md bg-purple-dark',
            scrollTo: true,
            cancelIcon: {
                enabled: true
            }
        }
    });

    // Add tour steps
    tour.addStep({
        id: 'welcome',
        text: 'Welcome! Let us show you how to use this page.',
        attachTo: {
            element: '.page-controls',
            on: 'bottom'
        },
        buttons: [{
            text: 'Next',
            action: tour.next
        }]
    });

    tour.addStep({
        id: 'job-cards',
        text: 'Here you can see all your active jobs.',
        attachTo: {
            element: '.labour-card',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Back',
                action: tour.back
            },
            {
                text: 'Next',
                action: tour.next
            }
        ]
    });

    tour.addStep({
        id: 'navigation',
        text: 'Use this navigation bar to move between different sections.',
        attachTo: {
            element: '.navbar',
            on: 'right'
        },
        buttons: [
            {
                text: 'Back',
                action: tour.back
            },
            {
                text: 'Finish',
                action: tour.complete
            }
        ]
    });

    // Add click event to start tour
    tourButton.addEventListener('click', () => {
        tour.start();
    });
});