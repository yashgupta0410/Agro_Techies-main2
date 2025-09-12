import mongoose, { Schema, model } from "mongoose";

const redeemModel = new Schema({
    accountNumber:{
        type:Number
    },
    ifsc:String,
    account:String,
    kisaan:{
        type:Schema.Types.ObjectId,
        ref:'Kisaan'
    },
    balance:Number
},
{
    timestamps:true
})

export const Redeem = model("Redeem",redeemModel);