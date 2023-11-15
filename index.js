import express, { json } from 'express';
import cors from 'cors'
import mongoose from 'mongoose';
import 'dotenv/config';
import UserModel from './models/User.js';
import bcrypt from 'bcryptjs';



const bcryptSalt = bcrypt.genSaltSync(10)

const app = express();
app.use(json())
app.use(cors())
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

app.listen(4000, () => console.log("api app listening on prot 4000!"))