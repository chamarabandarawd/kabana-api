import mongoose, { Schema } from "mongoose";


export const PlaceShema=new Schema({

    owner:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    title:String,
    address:String,
    photos:[String],
    desc: String,
    perks: [String],
    extraInfo:String,
    checkIn:String,
    checkOut: String,
    maxGuests : Number,
    price:String,
    s3Keys:[String],
});

const PlaceModel = mongoose.model('Place',PlaceShema);

export default PlaceModel;