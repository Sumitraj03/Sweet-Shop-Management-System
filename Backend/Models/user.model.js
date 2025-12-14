import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true,
        enum:['customer','admin']
    },
},{timestamps:true})


export const userModel = mongoose.model("User",userSchema);