  const mongoose=require("mongoose");
  const zod= require("zod");

  mongoose.connect("mongodb+srv://melvin:melvin0011@cluster0.do87x1x.mongodb.net/labour_field");
  // Mongoose schema for landowner
  const landownerSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      gender: { type: String, required: true },
      DOB: { type: Date, required: true },
      aadhaar_ID: { type: String, required: true, unique: true },
      mobile_number: { type: String, required: true },
      alternate_mobile_number: { type: String, required: false },
      email: { type: String, required: true, unique: true },
      address:  { type: String, required: true },
      land_location: String,
      land_size: String,
      land_type: String,
      password: { type: String, required: true }, 
      state: String,
      city: String,
      taluk: String,
      refferal:[{ type: mongoose.Schema.Types.ObjectId , ref: 'Labour' }],
      job_history:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
      requests:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Requests' }]
    
    });
    
  // Mongoose schema for labours
  const labourSchema = new mongoose.Schema({
    username:{ type: String, required: true ,unique: true},
    gender:{ type: String, required: true },
    DOB:{ type: Date , required: true },
    aadhaar_ID: { type: String, required: true, unique: true },
    mobile_number: { type: String, required: true,unique: true },
    alternate_mobile_number: { type: String, required: false },
    email: { type: String, required: false, unique: true },
    address: { type: String, required: true },
    password:{ type: String, required: true },
    state: { type: String, required: true },
    city:{ type: String, required: true },
    taluk: { type: String, required: true },
    job_skills: String,
    refferal:[{ type: mongoose.Schema.Types.ObjectId , ref: 'Labour' }],
    job_history:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    requests:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Requests' }]
  });
  // Mongoose schema for job
  const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: Boolean, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    number_of_workers: { type: Number, required: true },
    worker_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Labour' }],
    created_by:{ type: mongoose.Schema.Types.ObjectId, ref: 'Landowner' },
    state: String,
      city: String,
      taluk: String,
  });


  const requestSchema = new mongoose.Schema({
    labour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Labour', required: true },
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: { type: String, enum: ['ACCEPTED', 'REJECTED', null], default: null },
    date: { type: Date, default: Date.now }
  });

  const Requests=mongoose.model('Requests',requestSchema)
  const Landowner = mongoose.model('Landowner', landownerSchema);


  // Middleware to set job status based on dates during save
jobSchema.pre('save', function (next) {
  const currentDate = new Date();
  this.status = (currentDate >= this.start_date && currentDate <= this.end_date);
  next();
});


  const Job = mongoose.model('Job', jobSchema);
  const Labour = mongoose.model('Labour', labourSchema);


  module.exports = {
      Landowner,
      Labour,
      Job,
      Requests
    };