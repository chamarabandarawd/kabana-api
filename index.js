import express, { json } from 'express';
import cors from 'cors'
import mongoose from 'mongoose';
import 'dotenv/config';
import UserModel from './models/User.js';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import PlaceModel from './models/Place.js';


const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY
const bucketName = process.env.AWS_BUCKET_NAME




const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    }
});

async function getObjectURL(key) {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    const getUrl = await getSignedUrl(s3Client, command);
    return getUrl;
}

async function createPreSignedPost(key, contentType) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
    });

    const fileLink = `htps://${bucketName}.s3.eu-north-1.amazonaws.com/${key}`;

    const signedUrl = await getSignedUrl(s3Client, command,);
    return signedUrl;
}

const bcryptSalt = bcrypt.genSaltSync(10)
const jwtSecret = 'fgakjdiukj7393jk373yk0dhbhd790';

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


app.post('/signed_url', async (req, res) => {
    try {
        const { key, content_Type } = req.body;
        console.log(key, content_Type)
        const putImageUrl = await createPreSignedPost('public/' + key, content_Type);
        const getImageUrl = await getObjectURL('public/' + key)
        return res.send({
            putImageUrl,
            getImageUrl
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            error: err.message
        })
    }
})

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

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userDoc = await UserModel.findOne({ email });
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({ email: userDoc.email, id: userDoc._id }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json(userDoc)

            })

        } else {
            res.status(422).json('Incorrect passowrd. Try again!')
        }

    } else {
        res.status(422).json("User not found")
    }
});

app.get('/profile', (req, res) => {

    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, user) => {
            if (err) throw err;
            const userDoc = await UserModel.findById(user.id);
            res.json(userDoc)
        })
    } else {
        res.json(null)
    }
})

app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true);
})

app.post('/places', (req, res) => {
    const { title, address, photoKeys,
        desc, perks, extraInfo,
        checkIn, checkOut, guests, price } = req.body;

    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, user) => {
            if (err) throw err;
            const placeDoc = await PlaceModel.create({
                owner: user.id,
                title: title,
                address: address,
                photos: photoKeys,
                desc: desc,
                perks: perks,
                extraInfo: extraInfo,
                checkIn: checkIn,
                checkOut: checkOut,
                maxGuests: guests,
                price: price,
                s3Keys:photoKeys,
            })
        })
    }

    res.json("Place successfully added!");
})

app.put('/places', (req, res) => {

    const { id, title, address, photoKeys,
        desc, perks, extraInfo,
        checkIn, checkOut, guests, price,s3Keys } = req.body
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const placeDoc = await PlaceModel.findById(id);
            if (userData.id === placeDoc.owner.toString()) {
                placeDoc.set(
                    {
                        title: title,
                        address: address,
                        photos: photoKeys,
                        desc: desc,
                        perks: perks,
                        extraInfo: extraInfo,
                        checkIn: checkIn,
                        checkOut: checkOut,
                        maxGuests: guests,
                        price: price,
                        s3Keys:s3Keys,
                    });
                placeDoc.save()
                res.json('Placess successfully updated!')
            }
            
        })
    }
})

app.get('/user-places', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, user) => {
            if (err) throw err;
            const { id } = user;
            const places = await PlaceModel.find({ owner: id });


            for (let i = 0; i < places.length; i++) {

                let photoList = places[i].photos

                for (let j = 0; j < photoList.length; j++) {
                    photoList[j] = await getObjectURL('public/' + photoList[j])
                }
                places[i].photos = photoList;

            }
            res.json(places)

        })
    }
})


app.get('/places/:id', async (req, res) => {

    const { id } = req.params;
    let placeDoc = await PlaceModel.findById(id)
    let photoList = placeDoc.photos;

    for (let j = 0; j < photoList.length; j++) {
        photoList[j] = await getObjectURL('public/' + photoList[j])
    }
    placeDoc.photos = photoList;
    res.json(placeDoc)
});

app.listen(4000, () => console.log("api app listening on prot 4000!"))