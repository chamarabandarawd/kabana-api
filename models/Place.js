import mongoose, { Schema } from "mongoose";


export const PlaceShema=new Schema({

    title:String,
    address:String,
    photos:[String],
    desc: String,
    perks: [String],
    extraInfo:String,
    checkIn:Number,
    checkOut: Number,
    maxGuests : Number,
});

const PlaceModel = mongoose.model('Place',PlaceShema);

export default PlaceModel;