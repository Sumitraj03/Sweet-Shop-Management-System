import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    sweetId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Sweet"
    },
    quantity:{
        type:Number,
        required:true
    },
    purchasedAtPrice:{
        type:Number,
        required:true
    },
    totalAmount:{
        type:Number,
        required:true
    }
},{timestamps:true})


export const purchaseModel = mongoose.model('Purchase',purchaseSchema);