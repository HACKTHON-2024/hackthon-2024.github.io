const express = require('express');
const router = express.Router();
const {Landowner,Labour,Job,Requests}= require('../db/db')
const { jwt_scret } = require('../config');
const jwt=require("jsonwebtoken");
const {registerlandowner,signin,createjobs,updateLandownerProfile }=require("../type")
const {landownerMiddleware}=require("../middleware/landowner")



router.post('/signup', async (req, res) => {
  try {

  console.log("signup")
    // Create the payload from the request body
    const createpayload = req.body;
    if (typeof createpayload.DOB === 'string') {
        createpayload.DOB = new Date(createpayload.DOB);
    }

    // Validate input using Zod's safeParse
    const parsedPayload = registerlandowner.safeParse(createpayload);   
  
    // Check if the validation passed
    if (!parsedPayload.success) {
        // Extract error details and send back to the user
        const errorDetails = parsedPayload.error.errors.map(err => {
          console.log(err.message)
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
        alternate_mobile_number, email, address, land_location,
        land_size, land_type, state, city, taluk
    } = parsedPayload.data;

    // Check if the username already exists in the database
    const existingUser = await Landowner.findOne({ where: { username } }); // Adjust this query based on your database/ORM
    if (existingUser) {
        // If username is taken, return a validation error
        return res.status(400).json({
            message: "Validation failed",
            errors: [{ field: 'username', message: 'Username already taken' }]
        });
    }

    // Convert DOB to JavaScript Date object if necessary
    const dobDate = new Date(DOB);

        // Create the Landowner entry in the database
        await Landowner.create({
            username, password, gender, DOB: dobDate, aadhaar_ID, mobile_number,
            alternate_mobile_number, email, address, land_location,
            land_size, land_type, state, city, taluk
        });
        res.status(200).json({ message: 'User created successfully' });
    }catch (error) {
      // Handle MongoDB duplicate key error
      if (error.code === 11000) {
          const field = Object.keys(error.keyValue)[0];
          return res.status(400).json({
              message: "Duplicate field error",
              errors: [{ field: field, message: `${field} already exists` }]
          });
      }
      // Handle general server errors
      res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});
// this sigin is used when users verifyed their mobil no. by otp
router.post('/signin_by_otp', async (req, res) => {
  const identifier = req.body.identifier; // Email or mobile number
  try {
      // Find landowner by either email or mobile number
      const landowner = await Landowner.findOne({
          $or: [
              { email: identifier },
              { mobile_number: identifier }
          ]
      });

      if (landowner) {
          // Generate JWT token since OTP is already verified
          const token = jwt.sign({ username: landowner.username }, jwt_scret); // Token valid for 1 hour
          
          // Send token as response
          return res.status(200).json({ token });
      }

      // If no landowner found
      return res.status(404).json({ message: 'User not found' });
  } catch (error) {
      console.error("Error in signing in:", error);
      return res.status(500).json({ message: 'Server error' });
  }
});


router.post('/signin', async (req, res) => {
    const identifier = req.body.identifier; // This will be email or phone number
    const password = req.body.password;
   
    // Find a landowner by either email or phone number
  // Find a landowner by either email or phone number
  const landowner = await Landowner.findOne({
    $or: [
        { email: identifier },
        {  mobile_number: identifier }
    ]
});
    if (landowner) {
        const token = jwt.sign({ username: landowner.username }, jwt_scret); // Assuming landowner has a username field
        
        return res.status(200).json({ token });
    }
    
    return res.status(401).json({ message: 'Invalid credentials' });
});


router.post('/createjob', landownerMiddleware,async (req, res) => {
    const createpayload = req.body;
    const user=req.user;
    
    //converting the date formate string to date
    if(typeof createpayload.start_date === 'string') {
        createpayload.start_date = new Date(createpayload.start_date);
    }
    if(typeof createpayload.end_date === 'string') {
        createpayload.end_date = new Date(createpayload.end_date);
    }

    createpayload.state=user.state
    createpayload.city=user.city
    createpayload.taluk=user.taluk
    createpayload.amount=Number(req.body.amount)
    createpayload.number_of_workers=Number(req.body.number_of_workers)

    // Set the current date
    const currentDate = new Date();

    // Set the status based on the current date and the start/end dates
    if (createpayload.start_date <= currentDate && currentDate <= createpayload.end_date) {
        createpayload.status = true;
    } else {
        createpayload.status = false;
    }
    
    //zod input validation
    const parsedPayload = createjobs.safeParse(createpayload);

    if(!parsedPayload.success) {
        return res.status(400).json({
            message: 'Invalid input',
            errors: parsedPayload.error.errors
        });
    }
    parsedPayload.data.created_by=req.user._id;

    try {   
        const job = new Job(parsedPayload.data);
        await job.save(); 
         // Update the landowner's job_history by pushing the new job _id
         const landownerUpdate = await Landowner.updateOne(
            { _id: req.user._id },
            { $push: { job_history: job._id } } // Push the job ID into the job_history array
        );
        if (landownerUpdate.nModified === 0) {
            throw new Error('Failed to update landowner job history');
        }
        return res.status(201).json({ message: 'Job created successfully', job });
       
    } catch (error) {
        console.error('Error creating job:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get("/available_jobs", landownerMiddleware, async function(req, res) {
  try {
    const { city, taluk, _id: landowner_id } = req.user;  // Get city, taluk, and landowner ID from req.user
    const { selectedDate } = req.query;  // Get the selected date from query parameters

    // Build the query with conditions for location (taluk, city)
    const query = {
      $or: [
        { city, taluk },  // Most specific: city and taluk
        { city }          // Less specific: city only
      ],
      created_by: { $ne: landowner_id } // Exclude jobs created by the current landowner
      
    };

    // Fetch jobs from the database using the query
    let jobs = await Job.find(query);

    // Log the number of fetched jobs for debugging
    console.log(jobs.length, "jobs fetched before date filter");

    // If user provided a date, filter jobs based on the selected date
    if (selectedDate) {
      const date = new Date(selectedDate);

      // Filter jobs based on start and end dates
      jobs = jobs.filter(job => {
        return new Date(job.start_date) <= date && new Date(job.end_date) >= date;
      });

      console.log(jobs.length, "jobs fetched after date filter");
    }
    // Return the filtered or unfiltered jobs to the client
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


router.get("/available_labours", landownerMiddleware, async function(req, res) {
    try {
      const {  city, taluk } = req.user;  
     console.log("/available_labours")
      // Build a query with multiple conditions using $or to prioritize taluk > city > state
      const query = {
        $or: [
          {  city, taluk },  // Most specific: state, city, taluk
          {  city },         // Less specific: state, city
        ]
      };
  
      // Fetch jobs from the database using a single query
      const labours = await Labour.find(query);
      
      // Log the length of the fetched jobs for debugging
      console.log(labours.length, "labours fetched");
  
      // Return the fetched jobs to the client
      res.status(200).json({
        success: true,
        data: labours
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching jobs",
        error: error.message
      });
    }
  });


  router.get("/active_jobs", landownerMiddleware, async function(req, res) {
    try {
     
        // landownerMiddleware sets req.user to the logged-in landowner
        const landownerId = req.user._id;
        // Fetch the landowner's job history
        const landowner = await Landowner.findById(landownerId).populate('job_history');
        // Filter the jobs where the status is true
        const activeJobs = landowner.job_history.filter(job => job.status);
        // Send the active jobs in the response
       
        res.json(activeJobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching active jobs" });
    }
  });
  
  router.post("/request", landownerMiddleware, async function(req, res) {
    try {
        const  labour_id  = req.body.labour_id;
        const job_id=req.body.job_id;
        const landowner_id = req.user._id; //landownerMiddleware adds this to req.user

        // Step 1: Validate that both labour and job exist
        const labour = await Labour.findById(labour_id);
        const job = await Job.findById(job_id);
        if (!labour) {
            return res.status(404).json({ message: "Labourer not found" });
        }       
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        // Step 2: Check if this landowner is the creator of the job
        if (String(job.created_by) !== String(landowner_id)) {
            return res.status(403).json({ message: "You are not authorized to request workers for this job." });
        }

        // Step 3: Check if a request for this labour and job already exists
        const existingRequest = await Requests.findOne({ labour_id, job_id });
        if (existingRequest) {
            return res.status(400).json({ message: "A request for this labourer and job already exists." });
        }

        // Step 4: Create a new request
        const newRequest = new Requests({
            labour_id,
            job_id,
            status: false, // Initial status is false (pending)
            date: new Date()
        });

        await newRequest.save();
        console.log(newRequest._id)
        
        // Step 5: Push the new request ID into the landowner's requests array
        await Landowner.findByIdAndUpdate(
          landowner_id,
          { $push: { requests: newRequest._id } },
          { new: true } // Return the updated document
      );
        // Step 5: Respond to the client with the created request
        res.status(201).json({
            message: "Request created successfully",
            request: newRequest
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while creating the request" });
    }
});

router.get("/view_requests", landownerMiddleware, async function(req, res) {
    try {
      const landowner_id = req.user._id;
      console.log(landowner_id)
      // Fetch landowner's requests from the landowner's collection
      const landowner = await Landowner.findById(landowner_id).populate({
        path: 'requests', // Populate the 'requests' field with details
        populate: { 
          path: 'job_id', // Further populate the 'job_id' field within requests
          model: 'Job'
        }
      });
  
      if (!landowner) {
        return res.status(404).json({ message: "Landowner not found" });
      }
  
      // Filter out active jobs based on job status
      const active_requests = landowner.requests.filter(req => req.job_id && req.job_id.status);
  
      res.json(active_requests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while fetching active jobs" });
    }
  });
  
  router.get("/view_profile", landownerMiddleware,async function(req, res) {
    const user_id = req.user._id; // Assuming user is authenticated and attached to req.user
    try {
      // Fetch profile details and exclude the password field
      const profile_details = await Landowner.findById(user_id, { password: 0 });
      console.log(profile_details)
  
      if (!profile_details) {
        return res.status(404).json({ message: "Profile not found" });
      }
  
      res.json(profile_details);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while fetching the profile" });
    }
  });
  router.get("/get_job_history", landownerMiddleware, async (req, res) => {
    try {
        const user_id = req.user._id; // Assuming req.user contains authenticated landowner's ID

        // Fetch the landowner's job history and populate the job details
        const landowner = await Landowner.findById(user_id).populate('job_history').exec();

        if (!landowner || landowner.job_history.length === 0) {
            return res.status(404).json({ message: "No jobs found in the landowner's job history" });
        }

        res.status(200).json(landowner.job_history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching jobs", error: error.message });
    }
});


  
  router.post("/update_profile", landownerMiddleware, async function (req, res) {
      try {

        const createpayload = req.body;
    if (typeof createpayload.DOB === 'string') {
        createpayload.DOB = new Date(createpayload.DOB);
    }
    // Validate input using Zod's safeParse 
          // Step 1: Validate input data using Zod
         
          const validationResult = updateLandownerProfile.safeParse(createpayload);
          if (!validationResult.success) {
              return res.status(400).json({
                  message: "Validation error",
                  errors: validationResult.error.errors
              });
          }
  
          // Step 2: Extract validated data
          const {
              username, gender, DOB, aadhaar_ID, mobile_number, alternate_mobile_number,
              email, address, land_location, land_size, land_type, state, city, taluk
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



//it called when confirm box is clicked in send the request to labours 
router.post("/request_confirm", landownerMiddleware,async (req, res) => {
  const { job_id,  labour_id } = req.body;
  const user_id=req.user._id;
  console.log("api called");
  console.log("job:",job_id,"labour:",labour_id)
  
  try {
    // Step 1: Validate if job_id and labour_id exist
    const job = await Job.findById(job_id);
    const labour = await Labour.findById(labour_id);
    const landowner = await Landowner.findById(user_id);
    
    if (!job || !labour || !landowner) {
      return res.status(404).json({ error: "Job, Landowner, or Labour not found." });
    }

    // Step 2: Check for existing request
    const existingRequest = await Requests.findOne({
      labour_id: labour._id,
      job_id: job._id
    });

    if (existingRequest) {
      return res.status(400).json({ error: "A request for this labour and job already exists." });
    }


    // Step 3: Create a new request in the Requests collection
    const newRequest = new Requests({
      labour_id: labour._id,
      job_id: job._id,
      status: false, // Assuming 'false' means pending
      date: new Date()
    });

    await newRequest.save();

    // Step 4: Update the landowner's and labour's requests arrays
    landowner.requests.push(newRequest._id);
    await landowner.save();

    labour.requests.push(newRequest._id);
    await labour.save();  

    // Optional Step 4: Update the job details if necessary
    // For example, adding labour_id to worker_id if the request is confirmed
    // job.worker_id.push(labour._id);
    // await job.save();

    res.status(200).json({ message: "Request confirmed and updated successfully.", request: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/request_by_owner", landownerMiddleware, async function(req, res) {
  const { jobId, mobileNumber } = req.body;

  try {
      // Step 1: Find the Labour by Mobile Number
      const labour = await Labour.findOne({ mobile_number: mobileNumber });

      if (!labour) {
          return res.status(404).json({ success: false, message: "Labour not found" });
      }

      // Step 2: Find the Job by Job ID
      const job = await Job.findById(jobId);

      if (!job) {
          return res.status(404).json({ success: false, message: "Job not found" });
      }

      // Step 3: Check if labour is already added to job
      if (job.worker_id.includes(labour._id)) {
          return res.status(400).json({ success: false, message: "Labour already assigned to this job" });
      }

      // Step 4: Add Job ID to Labour's job history
      labour.job_history.push(job._id);
      await labour.save(); // Save updated labour

      // Step 5: Add Labour ID to Job's worker_id
      job.worker_id.push(labour._id);
      await job.save(); // Save updated job

      // Step 6: Create a new Request Record
      const newRequest = new Requests({
          labour_id: labour._id,
          status: true, // You can set status based on your logic
          job_id: job._id,
          date: new Date()
      });

      await newRequest.save(); // Save the request

      // Step 7: Send Success Response
      res.status(200).json({ success: true, message: "Job request sent successfully" });
  } catch (error) {
      console.error("Error processing job request:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});

router.use(landownerMiddleware)
module.exports = router;