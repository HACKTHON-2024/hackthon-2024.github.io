const z=require("zod")

const registerlandowner=z.object({
    username:z.string(),
    gender:z.string(),
    DOB:z.date(),
    aadhaar_ID: z.string().length(12, "Aadhaar ID must be exactly 12 digits"),
    mobile_number: z.string().length(10, "Mobile number must be exactly 10 digits"),
    alternate_mobile_number:z.string().length(10, "Mobile number must be exactly 10 digits"),
    email:z.string().email(),
    addess:z.string(),
    land_location:z.string(),
    land_size:z.string(),
    land_type:z.string(),
    password:z.string().min(6),
    state:z.string(),
    city:z.string(),
    taluk:z.string()
})

const registerlabours=z.object({
    username:z.string(),
    gender:z.string(),
    DOB:z.date(),
    aadhaar_ID: z.string().length(12, "Aadhaar ID must be exactly 12 digits"),
    mobile_number: z.string().length(10, "Mobile number must be exactly 10 digits"),
    alternate_mobile_number:z.string().length(10, "Mobile number must be exactly 10 digits"),
    email:z.string().email(),
    addess:z.string(),
    password:z.string().min(6),
    state:z.z.string(),
    city:z.z.string(),
    taluk:z.z.string(),
    job_skills:z.z.string() 
})

const createjobs=z.object({
    title:z.z.string() ,
    description:z.z.string() ,
    location:z.z.string() ,
    amount:z.number(),
    status:z.boolean(),
    start_date:z.date(),
    end_date:z.date(),
    number_of_workers:z.number(),
    state:z.z.string(),
    city:z.z.string(),
    taluk:z.z.string()
})

const signin=z.object({
    password: z.string().min(6, "Password must be at least 6 characters")
})

module.exports={
    registerlandowner:registerlandowner,
    registerlabours:registerlabours ,
    signin,
    createjobs
}