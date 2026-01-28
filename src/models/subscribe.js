import mongoose, { Schema } from "mongoose";

const SubscribeSchema= new Schema({
    subcriber:{
        type:Schema.Types.ObjectId, //one is who is subscibing 
        ref:"User",
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
},{timestamps:true})

export const subscription = mongoose.model("Subsciption",SubscribeSchema)