import express, { json } from 'express';
import cors from 'cors'
import mongoose from 'mongoose';
import 'dotenv/config';
import UserModel from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
// import multer from 'multer';
// import * as fs from 'fs';
// import AWS from 'aws-sdk';
// import multerS3 from 'multer-s3';


// const bucketName = process.env.AWS_BUCKET_NAME
// const region = process.env.AWS_BUCKET_REGION
// const accessKeyId = process.env.AWS_ACCESS_KEY
// const secretAccessKey = process.env.AWS_SECRET_KEY

// AWS.config.update({
//     accessKeyId,
//     secretAccessKey
// });


// const s3 = new AWS.S3();

// var upload=multer({
//     storage:multerS3({
//         s3:s3,
//         bucket:bucketName,
//         acl:"public-read",
//         contentType:multerS3.AUTO_CONTENT_TYPE,
//         key:function(req,file,cb){
//             cb(null, file.originalname);
//         }
//     })
// })








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

// const dirname='C:/Users/chama/Desktop/kabana'

// app.post('/upload-by-link', async (req,res)=>{
//     const {link}=req.body;
//     const newName=Date.now()+'.jpg'
//     await ImageDownloader.image({
//         url:link,
//         dest: dirname+ newName,
//     });
//     res.json(dirname+ newName);

// })
// const photosMiddleware=multer({dest:'uploads/'})

// app.post('/upload',photosMiddleware.array('photos',100),(req,res)=>{

//     const uploadedFiles=[];

//     for(let i=0 ;i< req.files.length;i++){
//         const {path,originalname}=req.files[i];
//         const parts=originalname.split('.');
//         const ext=parts[parts.length-1];
//         const newPath=path+'.'+ext;
//         fs.renameSync(path,newPath);  
//         uploadedFiles.push(newPath)  
//     }
//     console.log(uploadedFiles)
//     res.json(uploadedFiles)
// })

// app.post('/upload',upload.single('photo'),async (req,res)=>{
//     const file=req.files[0];
//     console.log("file from FE" , file)

//     const result = await uploadFile(file);
//     console.log(result)
//     res.json("ok")
// })

app.listen(4000, () => console.log("api app listening on prot 4000!"))