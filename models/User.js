import mongoose, { Schema } from "mongoose";



export const UserSchema=new Schema({
    name: String,
    email : {type:String , unique:true},
    password: String,
});

const UserModel=mongoose.model('User',UserSchema);


export default UserModel;