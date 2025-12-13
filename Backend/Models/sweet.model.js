import mongoose from "mongoose";

const sweetSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    category:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    quantity:{
        type:Number,
        required:true,
        min:0
    }
},{timestamps:true})


const sweetModel = mongoose.model("Sweet",sweetSchema)