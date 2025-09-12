import mongoose, { Schema } from "mongoose";
import plm from "passport-local-mongoose"

const sellerSchema = new Schema({
    username: {
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true  
    },

    password:String,
    email:{
        type:String
    },
    fullName:{
        type:String,
        require:true
    },
    contact:{
        type:Number
    },
    company:{
        type:String,
    },
    products:[{
        type: Schema.Types.ObjectId,
        ref:"Product"
    }],
    profileImage:{
        type:String
    },
    orders:[{
        type:Schema.Types.ObjectId,
        ref:"Order"
    }]
},
{
    timestamps:true
}

)
sellerSchema.plugin(plm)

export const Seller = mongoose.model("Seller",sellerSchema)