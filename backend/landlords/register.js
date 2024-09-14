const express=require("express")
const app=express()
const port=3000
const {registerlandowner}=require("./type")
const {registerlabours}=require("./type")
const {Landowner}=require("./db")
const zod=require("zod");

app.use(express.json());

app.post("/",async function(req,res){
    const createpayload=req.body;
    const parsedpayload=createTodo.safeParse(createpayload);
    console.log(parsedpayload)
    if(!parsedpayload.success){
        res.status(401).json({
            mess:"you sent wrong input"
        })
        return;
    }

    await todo.create({
        title:createpayload.title,
        description:createpayload.description,
        completed:false

     })

     res.json({
        mess:"todos created "
     })
})

app.get("/todo",async function(req,res){
   const todos= await todo.find({})
   res.json({todos})
})
app.put("/todo",async function(req,res){
    const uploadpayload=req.body;
    const parsedpayload=updateTodo.safeParse(uploadpayload);
    if(!parsedpayload.success){
        res.status(401).json({
            mess:"you sent wrong input   "
        })
        return;
    }

    await todo.updateOne({
        _id:req.body.id
    },{completed: true    })

    res.json({
        mess:"todo marked as completed"
    })

})

app.listen(port)


