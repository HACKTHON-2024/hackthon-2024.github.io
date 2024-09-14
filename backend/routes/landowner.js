const express = require('express');
const router = express.Router();
const {Landowner,Labour,Job,Requests}= require('../db/db')
const { jwt_screat } = require('../config');
const jwt=require("jsonwebtoken");
const {registerlandowner,signin,createjobs }=require("../type")
const {landownerMiddleware}=require("../middleware/landowner")



router.post('/signup', async (req, res) => {
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
        alternate_mobile_number, email, addess, land_location,
        land_size, land_type, state, city, taluk
    } = parsedPayload.data;

    // Convert DOB to JavaScript Date object if necessary
    const dobDate = new Date(DOB);

    try {
        // Create the Landowner entry in the database
        await Landowner.create({
            username, password, gender, DOB: dobDate, aadhaar_ID, mobile_number,
            alternate_mobile_number, email, addess, land_location,
            land_size, land_type, state, city, taluk
        });
        res.status(200).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
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
        const token = jwt.sign({ username: landowner.username }, jwt_screat); // Assuming landowner has a username field
        return res.status(200).json({ token });
    }
    
    return res.status(401).json({ message: 'Invalid credentials' });
});


router.post('/createjob', landownerMiddleware,async (req, res) => {
    const createpayload = req.body;
   
    
    //converting the date formate string to date
    if(typeof createpayload.start_date === 'string') {
        createpayload.start_date = new Date(createpayload.start_date);
    }
    if(typeof createpayload.end_date === 'string') {
        createpayload.end_date = new Date(createpayload.end_date);
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

router.get("/available_job", landownerMiddleware, async function(req, res) {
    try {
      const { state, city, taluk } = req.user;  
      // Build a dynamic filter object
      let filter = {};
  
      if (state) {
        filter.state = state;
      }
      if (city) {
        filter.city = city;
      }
      if (taluk) {
        filter.taluk = taluk;
      }
      // Fetch jobs from the database based on the filter
      const jobs = await Job.find(filter);
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
  


router.get("/dx",landownerMiddleware,function(req,res){
    console.log(req.username)
    console.log(req._id)
res.json({"mess":"hiii"})
})

// router.get('/purchasedCourses', userMiddleware, async (req, res) => {
//     // Implement fetching purchased courses logic

//     const username=req.username;
//     const userdata =await User.findOne({username})
   
//     const courses=await Course.find({_id:{"$in":userdata.purchedcourses}})
//     res.status(200).json({courses})
 
// });

router.use(landownerMiddleware)
module.exports = router;