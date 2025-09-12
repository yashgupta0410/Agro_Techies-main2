import mongoose, { Schema } from "mongoose";
import plm from "passport-local-mongoose"

const officerSchema = new Schema({
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
    designation:{
        type:String,
        require:true
    },
    blogs:[{
        type:Schema.Types.ObjectId,
        ref:"Blog"
    }],
    contact : {
        type:Number
    },
    profileImage: {
        type:String
    }
},
{
    timestamps:true
}

)
officerSchema.plugin(plm)

export const Officer = mongoose.model("Officer",officerSchema)