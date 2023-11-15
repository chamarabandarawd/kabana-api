import express, { json } from 'express';
import cors from 'cors'



const app=express();
app.use(json())
app.use(cors())

app.get('/test',(req,res)=>{
    res.send("Heloo World!");
});

app.post('/register',(req,res)=>{
    const {name,email,password}=req.body;
    res.json({name,email,password});
});

app.listen(4000,()=>console.log("api app listening on prot 4000!"))