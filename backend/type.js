const z=require("zod")

const registerlandowner=z.object({
    name:z.string(),
    gender:z.string(),
    DOB:z.date(),
    aadhaar_ID: zod.string().length(12, "Aadhaar ID must be exactly 12 digits"),
    mobile_number: zod.string().length(10, "Mobile number must be exactly 10 digits"),
    email:z.email(),
    addess:z.string(),
    land_location:z.string(),
    land_size:z.string(),
    land_type:z.string(),
    password:z.string().min(6)
})

const registerlabours=z.object({
    name:z.string(),
    gender:z.string(),
    DOB:z.date(),
    aadhaar_ID: z.string().length(12, "Aadhaar ID must be exactly 12 digits"),
    mobile_number: z.string().length(10, "Mobile number must be exactly 10 digits"),
    alternate_mobile_number:z.string().length(10, "Mobile number must be exactly 10 digits"),
    email:z.email(),
    addess:z.string(),
    password:z.string().min(6),
    state:z.strinig(),
    city:z.strinig(),
    taluk:z.strinig(),
    job_skills:z.strinig() 
})

const jobs=z.object({
    title:z.strinig() ,
    description:z.strinig() ,
    location:z.strinig() ,
    amount:z.number(),
    status:z.boolean(),
    start_date:z.date(),
    end_date:z.date(),
    number_of_workers:z.number()
})




module.exports={
    registerlandowner:registerlandowner,
    registerlabours:registerlabours    
}