document.addEventListener('DOMContentLoaded', function() {
    fetchRequests();
});

async function fetchRequests() {
    try {
        const token = localStorage.getItem('jwt');
      
        if (!token) {
            window.location.href = '../../static/login_page/index.html';
            return;
        }

        

        const response = await fetch('http://localhost:3000/labour/landowner_request_details', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
       
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Fetched data:', result); // For debugging

        if (!result.data || !Array.isArray(result.data)) {
            throw new Error('Invalid data format received');
        }

        if (result.data.length === 0) {
            displayNoRequests();
            return;
        }

        displayRequests(result.data);
    } catch (error) {
        console.error('Error:', error);
        displayError('Failed to load requests. Please try again later.');
    }
}

function displayRequests(requests) {
    const container = document.getElementById('request-list-container');
    container.innerHTML = '';

    requests.forEach(request => {
        const jobDetails = request.job_id || {};
        const landownerDetails = jobDetails.created_by || {};
        const status = request.status || null;

        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';
        
        // Different button/status display based on request status
        let actionButtons = '';
        let statusDisplay = '';
        
        if (status === 'ACCEPTED') {
            statusDisplay = `<span class="status-badge accepted">Accepted</span>`;
        } else if (status === 'REJECTED') {
            statusDisplay = `<span class="status-badge rejected">Rejected</span>`;
        } else {
            actionButtons = `
                <div class="request-actions">
                    <button onclick="handleRequest('${request._id}', 'ACCEPTED')" class="accept-btn">
                        <i class="fas fa-check"></i> Accept
                    </button>
                    <button onclick="handleRequest('${request._id}', 'REJECTED')" class="reject-btn">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            `;
        }

        requestCard.innerHTML = `
            <div class="request-header">
                <div class="job-title">
                    <h3>${jobDetails.title || 'Untitled Job'}</h3>
                    <span class="request-date">${formatDate(request.date)}</span>
                </div>
                ${statusDisplay}
            </div>
            ${actionButtons}
            <div class="request-details">
                <div class="landowner-info">
                    <h4>Landowner Details:</h4>
                    <p><i class="fas fa-user"></i> ${landownerDetails.username || 'N/A'}</p>
                    <p><i class="fas fa-phone"></i> ${landownerDetails.mobile_number || 'N/A'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${landownerDetails.address || 'N/A'}</p>
                </div>
                <div class="job-info">
                    <h4>Job Details:</h4>
                    <p><i class="fas fa-rupee-sign"></i> Daily Wage: ₹${jobDetails.daily_wage || 'N/A'}</p>
                    <p><i class="fas fa-calendar"></i> Duration: ${formatDate(jobDetails.start_date)} to ${formatDate(jobDetails.end_date)}</p>
                    <p><i class="fas fa-users"></i> Required Workers: ${jobDetails.required_workers || 'N/A'}</p>
                    ${jobDetails.description ? `<p><i class="fas fa-info-circle"></i> Description: ${jobDetails.description}</p>` : ''}
                </div>
            </div>
        `;
        container.appendChild(requestCard);
    });
}

function displayNoRequests() {
    const container = document.getElementById('request-list-container');
    container.innerHTML = `
        <div class="no-requests">
            <i class="fas fa-inbox"></i>
            <p>No requests found</p>
        </div>
    `;
}

function displayError(message) {
    const container = document.getElementById('request-list-container');
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

async function handleRequest(requestId, action) {
    try {
        const isConfirmed = confirm(`Are you sure you want to ${action.toLowerCase()} this job request?`);
        if (!isConfirmed) return;

        const token = localStorage.getItem('jwt');
        if (!token) {
            alert('Please login again');
            window.location.href = '../../static/login_page/index.html';
            return;
        }

        const response = await fetch('http://localhost:3000/labour/handle_request', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                request_id: requestId,
                action: action
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update request status');
        }

        const result = await response.json();

        // Show success message
        if (action === 'ACCEPTED') {
            alert('You have successfully accepted the job request.');
        } else {
            alert('You have rejected the job request.');
        }

        // Refresh the requests list to show updated status
        await fetchRequests();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update request status. Please try again.');
    }
}
