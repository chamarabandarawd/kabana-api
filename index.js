import express, { json } from 'express';
import cors from 'cors'
import mongoose from 'mongoose';
import 'dotenv/config';
import UserModel from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';



const bcryptSalt = bcrypt.genSaltSync(10)
const jwtSecret='fgakjdiukj7393jk373yk0dhbhd790';

const app = express();
app.use(json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
  origin: 'http://localhost:3000',
}))
mongoose.connect(process.env.MONGO_URL);

app.get('/test', (req, res) => {
    res.send("Heloo World!");
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userDoc = await UserModel.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt)
        })
        res.json(userDoc);
    } catch (error) {
        res.status(422).json(error)
    }
});

app.post('/login', async (req,res)=>{
    const {email,password}=req.body;
    const userDoc=await UserModel.findOne({email});
    if(userDoc){
        const passOk=bcrypt.compareSync(password,userDoc.password);
        if(passOk){
            jwt.sign({email:userDoc.email,id:userDoc._id},jwtSecret,{},(err,token)=>{
                if(err) throw err;
                res.cookie('token',token).json(userDoc)

            })
           
        }else{
            res.status(422).json('Incorrect passowrd. Try again!')
        }

    }else{
        res.status(422).json("User not found")
    }
});

app.get('/profile',(req,res)=>{
   
    const {token} = req.cookies;
    if(token){
        jwt.verify(token,jwtSecret,{},async (err,user)=>{
            if(err) throw err;
            const userDoc=await UserModel.findById(user.id);
            res.json(userDoc)
        })
    }else{
        res.json(null)
    }
})

app.post('/logout',(req,res)=>{
    res.cookie('token','').json(true);
})

app.listen(4000, () => console.log("api app listening on prot 4000!"))