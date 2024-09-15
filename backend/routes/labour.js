const express = require('express');
const router = express.Router();
const {Landowner,Labour,Job,Requests}= require('../db/db')
const { jwt_screat } = require('../config');
const jwt=require("jsonwebtoken");
const {registerlabours,signin,createjobs,updateLabourProfile }=require("../type")
const {labourMiddleware}=require("../middleware/labour")

router.post('/signup', async (req, res) => {
    // Create the payload from the request body
    const createpayload = req.body;
    if (typeof createpayload.DOB === 'string') {
        createpayload.DOB = new Date(createpayload.DOB);
    }
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


router.post('/signin', async (req, res) => {
    const identifier = req.body.identifier; // This will be email or phone number
    const password = req.body.password;
   
    // Find a labour by either email or phone number
  const labour = await Labour.findOne({
    $or: [
        { email: identifier },
        {  mobile_number: identifier }
    ]
});
    if (labour) {
        const token = jwt.sign({ username: labour.username }, jwt_screat); // Assuming landowner has a username field
        return res.status(200).json({ token });
    }
    
    return res.status(401).json({ message: 'Invalid credentials' });
});



router.get("/available_jobs", labourMiddleware, async function(req, res) {
    try {
      const {  city, taluk } = req.user;  
     
      // Build the query to fetch jobs based on location (taluk, city)
      const query = {
        $or: [
            { city, taluk },  // Most specific: city and taluk
            { city },         // Less specific: city only
        ],
        worker_id: { $ne: req.user._id } // Exclude jobs where the labour is already part of worker_id
    };

  
      // Fetch jobs from the database using a single query
      const jobs = await Job.find(query);
      
      // Log the length of the fetched jobs for debugging
      console.log(jobs.length, "jobs fetched");
  
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

//joint current active jobs 
// Route to fetch active jobs for a specific labour based on their job history
router.get("/active_job", labourMiddleware, async function(req, res) {
    try {
        // Assuming req.user contains the authenticated labour's information
        const labourId = req.user._id; // This should come from the authenticated user session, middleware, or token

        // Find the labour by ID and populate the job_history with actual Job details
        const labour = await Labour.findById(labourId).populate({
            path: 'job_history', // Populate job history array with actual job details
            match: { status: true } // Only fetch jobs where status is active (status: true)
        }).exec();

        // Extract the active jobs from job_history (populated with active jobs)
        const activeJobs = labour.job_history;

        return res.status(200).json({ activeJobs });
    } catch (error) {
        console.error("Error fetching active jobs: ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/endroll", labourMiddleware, async function(req, res) {
    const job_id = req.body.job_id;   // Get job ID from the request body
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

        return res.status(200).json({ message: "Labour successfully enrolled in job" });

    } catch (error) {
        console.error("Error enrolling labour in job: ", error);
        return res.status(500).json({ message: "Internal server error" });
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
  router.post("/update_profile", labourMiddleware, async function (req, res) {
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
        const updatedProfile = await Landowner.findByIdAndUpdate(user_id, {
            username,
            gender,
            DOB,
            aadhaar_ID,
            mobile_number,
            alternate_mobile_number,
            email,
            address,
            land_location,
            land_size,
            land_type,
            state,
            city,
            taluk
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

router.use(labourMiddleware)
module.exports = router;