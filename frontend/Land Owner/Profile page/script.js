document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Fetch profile details on page load
        const response = await fetch('/view_profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Include authentication token if required
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch profile details');
        }

        const profile = await response.json();

        // Populate profile fields with fetched data
        document.getElementById('nameDisplay').textContent = profile.username;
        document.getElementById('genderDisplay').textContent = profile.gender;
        document.getElementById('DOBDisplay').textContent = new Date(profile.DOB).toLocaleDateString('en-GB'); // Format date
        document.getElementById('phoneDisplay').textContent = profile.mobile_number;
        document.getElementById('alt-phoneDisplay').textContent = profile.alternate_mobile_number;
        document.getElementById('aadhaarDisplay').textContent = profile.aadhaar_ID;
        document.getElementById('emailDisplay').textContent = profile.email;
        document.getElementById('addressDisplay').textContent = profile.address;
        document.getElementById('jobDisplay').textContent = profile.job_type;

    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Failed to load profile');
    }
});

