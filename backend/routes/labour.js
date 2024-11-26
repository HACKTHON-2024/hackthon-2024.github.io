const express = require('express');
const router = express.Router();
const {Landowner,Labour,Job,Requests}= require('../db/db')
const { jwt_secret } = require('../config');
const jwt=require("jsonwebtoken");
const {registerlabours,signin,createjobs,updateLabourProfile }=require("../type")
const {labourMiddleware}=require("../middleware/labour")

router.post('/signup', async (req, res) => {
    // Create the payload from the request body
    const createpayload = req.body;
    if (typeof createpayload.DOB === 'string') {
        createpayload.DOB = new Date(createpayload.DOB);
    }
    console.log("hii",createpayload);
    // Validate input using Zod's safeParse
    const parsedPayload = registerlabours.safeParse(createpayload);    
    // Check if the validation passed
    if (!parsedPayload.success) {
        // Extract error details and send back to the user
        const errorDetails = parsedPayload.error.errors.map(err => {
            return {
                field: err.path[0], // The field that caused the error
                message: err.message // The error message
            };
        });
        return res.status(400).json({
            message: "Validation failed",
            errors: errorDetails // Send detailed validation errors to the user
        });
    }

    // Proceed with user creation if validation passes
    const {
        username, password, gender, DOB, aadhaar_ID, mobile_number,
        alternate_mobile_number, email, address,
        state, city, taluk,job_skills
    } = parsedPayload.data;

    // Convert DOB to JavaScript Date object if necessary
    const dobDate = new Date(DOB);

    try {
        // Create the Landowner entry in the database
        await Labour.create({
            username, password, gender, DOB: dobDate, aadhaar_ID, mobile_number,
            alternate_mobile_number, email, address, state, city, taluk,job_skills
        });
        res.status(200).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// this sigin is used when users verifyed their mobil no. by otp
router.post('/signin_by_otp', async (req, res) => {
    const identifier = req.body.identifier; // Email or mobile number
    try {
        // Find Labour by either email or mobile number
        const labour = await Labour.findOne({
            $or: [
                { email: identifier },
                { mobile_number: identifier }
            ]
        });
  
        if (labour) {
            // Generate JWT token with username and role
            const token = jwt.sign(
                { 
                    username: labour.username,
                    role: 'labour'  // Add role identifier
                }, 
                jwt_secret,
                { expiresIn: '1h' }
            );
            
            // Send token as response
            return res.status(200).json({ token });
        }
  
        // If no labour found
        return res.status(404).json({ message: 'User not found' });
    } catch (error) {
        console.error("Error in signing in:", error);
        return res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.post('/signin', async (req, res) => {
    const { identifier, password } = req.body;

    try {
        // Find a laborer by either email or phone number
        const labour = await Labour.findOne({
            $or: [
                { email: identifier },
                { mobile_number: identifier }
            ]
        });

        if (!labour) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if the provided password matches the stored password
        if (labour.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token with username and role
        const token = jwt.sign(
            { 
                username: labour.username,
                role: 'labour'  // Add role identifier
            }, 
            jwt_secret, 
            { expiresIn: '1h' }
        );
        
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error during sign-in:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.get("/available_jobs", labourMiddleware, async function(req, res) {
    try {
      const {  city, taluk } = req.user;  
      const { selectedDate } = req.query;  // Get the selected date from query parameters
        
      // Build the query to fetch jobs based on location (taluk, city)
      const query = {
        $or: [
            { city, taluk },  // Most specific: city and taluk
            { city },         // Less specific: city only
        ],
        worker_id: { $ne: req.user._id } // Exclude jobs where the labour is already part of worker_id
    };
    
  
      // Fetch jobs from the database using a single query
      let jobs = await Job.find(query);
  // If user provided a date, filter jobs based on the selected date
  if (selectedDate) {
    const date = new Date(selectedDate);

    // Filter jobs based on start and end dates
    jobs = jobs.filter(job => {
      return new Date(job.start_date) <= date && new Date(job.end_date) >= date;
    });
    

    console.log(jobs.length, "jobs fetched after date filter");
  }
      // Return the fetched jobs to the client
      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching jobs",
        error: error.message
      });
    }
  });  

// current active jobs that fetch the jobs from history and update the status field based on dates and filter the active jobs
router.get("/active_jobs", labourMiddleware, async function(req, res) {
    try {
        const labourId = req.user._id;

        // Fetch the labour with populated job_history
        const labour = await Labour.findById(labourId).populate('job_history');

        if (!labour || !labour.job_history) {
            return res.status(404).json({ message: "No job history found for this laborer" });
        }

        // Update the status for each job based on current date
        const currentDate = new Date();
        labour.job_history.forEach(job => {
            job.status = currentDate >= job.start_date && currentDate <= job.end_date;
        });

        // Save updated jobs
        await Promise.all(labour.job_history.map(job => job.save()));

        // Filter for active jobs
        const activeJobs = labour.job_history.filter(job => job.status);

        res.json(activeJobs);
    } catch (error) {
        console.error("Error updating and fetching active jobs:", error);
        res.status(500).json({ message: "An error occurred while fetching active jobs" });
    }
});

  
router.post("/endroll", labourMiddleware, async function(req, res) {
    const job_id = req.body.jobId;   // Get job ID from the request body
    const labour_id = req.user._id;   // Get labour ID from the authenticated user

    try {
        // Check if the job exists
        const job = await Job.findById(job_id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Check if the labour is already in the job's worker_id list
        if (job.worker_id.includes(labour_id)) {
            return res.status(400).json({ message: "Labour already enrolled in this job" });
        }

        // Add the job ID to the labour's job_history if not already present
        await Labour.findByIdAndUpdate(labour_id, {
            $addToSet: { job_history: job_id }  // $addToSet ensures no duplicates
        });

        // Add the labour ID to the job's worker_id array
        await Job.findByIdAndUpdate(job_id, {
            $addToSet: { worker_id: labour_id }  // $addToSet ensures no duplicates
        });

        return res.status(200).json({ 
            message: "Labour successfully enrolled in job", 
            labour_id: labour_id ,// Include the labour_id in the response
            success: true
        });

    } catch (error) {
        console.error("Error enrolling labour in job: ", error);
        return res.status(500).json({ message: "Internal server error",
            success: false
         });
    }
});


router.get("/view_profile", labourMiddleware,async function(req, res) {
    const user_id = req.user._id; // Assuming user is authenticated and attached to req.user
    try {
      // Fetch profile details and exclude the password field
      const profile_details = await Labour.findById(user_id, { password: 0 });
  
      if (!profile_details) {
        return res.status(404).json({ message: "Profile not found" });
      }
  
      res.json(profile_details);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while fetching the profile" });
    }
  });

   //test this update_profile
  router.put("/update_profile", labourMiddleware, async function (req, res) {
    try {

      const createpayload = req.body;
  if (typeof createpayload.DOB === 'string') {
      createpayload.DOB = new Date(createpayload.DOB);
  }
  // Validate input using Zod's safeParse 
        // Step 1: Validate input data using Zod
       
        const validationResult = updateLabourProfile.safeParse(createpayload);

        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation error",
                errors: validationResult.error.errors
            });
        }

        // Step 2: Extract validated data
        const {
            username, gender, DOB, aadhaar_ID, mobile_number, alternate_mobile_number,
            email, address, state, city, taluk
        } = validationResult.data;

        const user_id = req.user._id; // Assuming user is authenticated and user ID is attached to req.user

        // Step 3: Update landowner details in the database
        const updatedProfile = await Labour.findByIdAndUpdate(user_id, {
            username, gender, DOB, aadhaar_ID, mobile_number, alternate_mobile_number,
            email, address, state, city, taluk
        }, { new: true, runValidators: true });

        if (!updatedProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }
      
        // Step 4: Respond with the updated profile data
        res.status(200).json({
            message: "Profile updated successfully",
            profile: updatedProfile
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while updating the profile", error: error.message });
    }
});

router.post("/job_endroll_for_others", labourMiddleware, async function (req, res) {
    try {
        const { mobile_number, job_id } = req.body;
        const labourID=req.user._id;
        console.log(mobile_number, job_id)
        // 1. Find the Labour by mobile number
        const labour = await Labour.findOne({ mobile_number });
        if (!labour) {
            return res.status(404).json({ success: false, message: 'Labour not found' });
        }

        // 2. Find the Job by job_id
        const job = await Job.findById(job_id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // 3. Update Labour's job_history
        if (!labour.job_history.includes(job._id)) {
            labour.job_history.push(job._id);
            await labour.save();
        }

        // 4. Update Job's worker_id (add Labour's ID to worker list)
        if (!job.worker_id.includes(labour._id)) {
            job.worker_id.push(labour._id);
            await job.save();
        }

        // 5. put the labour id in refferl array for reffer
        const user = await Labour.findById(labourID);
        if (!user) {
            return res.status(404).json({ success: false, message: 'user not found' });
        }

        // 6. Update user's refferal (add Labour's ID to referral list)
        if (!user.refferal.includes(labour._id)) {
            user.refferal.push(labour._id);
            await user.save();
        }
        console.log(labour._id)
        // Send success response
        res.status(200).json({ success: true, message: 'Labour enrolled successfully', laborId:labour._id});

    } catch (error) {
        console.error('Error enrolling labour for job:', error);
        res.status(500).json({ success: false, message: 'An error occurred', error });
    }
});

//jobs that labours joined till now
router.get("/get_job_history", labourMiddleware, async (req, res) => {
    try {
        const user_id = req.user._id;
        console.log(`Fetching job history for user: ${user_id}`);

        const labour = await Labour.findById(user_id).populate('job_history').exec();
        console.log(`Labour found: ${labour}`);

        if (!labour || labour.job_history.length === 0) {
            console.log("No jobs found in the labour's job history");
            return res.status(404).json({ message: "No jobs found in the labour's job history" });
        }

        res.status(200).json(labour.job_history);
    } catch (error) {
        console.error('Error occurred while fetching jobs:', error);
        res.status(500).json({ message: "An error occurred while fetching jobs", error: error.message });
    }
});

router.post('/validate-user', async (req, res) => {
    const { identifier } = req.body;

    try {
        let userExists;

        // Determine if the identifier is an email or mobile number
        if (identifier.includes('@')) {
            // Check for email in the database
            userExists = await Labour.findOne({ email: identifier });
        } else {
            // Check for mobile number in the database
            userExists = await Labour.findOne({ mobile_number: identifier });
        }

        if (userExists) {
            res.status(200).json({ success: true, message: 'User exists' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error validating user:', error);
        res.status(500).json({ success: false, message: 'Error validating user' });
    }
});


// Route to fetch job details along with landowner details
router.get("/job/:jobId", async (req, res) => {
    const { jobId } = req.params;  // Getting the jobId from the request parameters
  
    try {
        // Fetch job details and populate the created_by field
        const jobDetails = await Job.findById(jobId)
            .populate({
                path: 'created_by',
                select: 'username  mobile_number address' // Select the landowner fields you want to include
            });

        if (!jobDetails) {
            return res.status(404).json({ 
                success: false,
                message: "Job not found" 
            });
        }

        // Return all job details with landowner information
        res.status(200).json({
            success: true,
            data: {
                job: jobDetails,  // This will include all job fields
                landowner: jobDetails.created_by
            }
        });

    } catch (error) {
        console.error("Error fetching job details:", error);
        res.status(500).json({ 
            success: false,
            message: "Error fetching job details",
            error: error.message 
        });
    }
});

router.get("/landowner_request_details", labourMiddleware, async (req, res) => {
    try { 
        const labour_id = req.user._id;
        
       
       

        // Fetch requests for this labour and populate both job and landowner details
        const requests = await Requests.find({ labour_id })
            .populate({
                path: 'job_id',
                populate: {
                    path: 'created_by',
                    select: 'username mobile_number address' // Select relevant landowner fields
                }
            })
            .sort({ date: -1 }); // Sort by date descending (most recent first)

        if (!requests || requests.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No requests found"
            });
        }

        res.status(200).json({
            success: true,
            data: requests
        });

    } catch (error) {
        console.error("Error fetching request details:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching request details",
            error: error.message
        });
    }
});

router.post("/handle_request", labourMiddleware, async (req, res) => {
    try {

        const { request_id, action } = req.body;
        
    

        // Validate inputs
        if (!request_id || !action) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: request_id or action" 
            });
        }

        // Validate action
        if (!['ACCEPTED', 'REJECTED'].includes(action)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid action. Must be 'ACCEPTED' or 'REJECTED'" 
            });
        }

        // Update request status
        const updatedRequest = await Requests.findByIdAndUpdate(
            request_id,
            { status: action },
            { new: true }
        ).populate('job_id');

        if (!updatedRequest) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        if (action === 'ACCEPTED') {
            // If accepted, update job and labour relationships
            await Promise.all([
                // Add labour to job's workers
                Job.findByIdAndUpdate(
                    updatedRequest.job_id._id,
                    { $addToSet: { worker_id: updatedRequest.labour_id } }
                ),

                // Add job to labour's job history
                Labour.findByIdAndUpdate(
                    updatedRequest.labour_id,
                    { $addToSet: { job_history: updatedRequest.job_id._id } }
                )
            ]);

            // You could also send notification to landowner here
            
        } else {
            // If rejected, you might want to:
            // 1. Mark the request as rejected
            // 2. Optionally notify the landowner
            // 3. Maybe store rejection reason if provided
        }

        res.status(200).json({
            success: true,
            message: `Request ${action.toLowerCase()} successfully`,
            request: updatedRequest
        });

    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({
            success: false,
            message: "Error processing request",
            error: error.message
        });
    }
});

router.use(labourMiddleware)
module.exports = router;