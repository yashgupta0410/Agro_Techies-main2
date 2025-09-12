import mongoose, { Schema } from "mongoose";
const blogSchema = new Schema({
    // officer:{
    //     type:Schema.Types.ObjectId,
    //     ref:"Officer"
    // },
    officer:String,
    designation:String,
    heading:{
        type:String,
        require:true
    },
    content:{
        type:String,
        require:true
    },
    elligibility:{
        type:String
    },
    schemeLink:{
        type:String
    },
    shareableLink:{
        type:String,
        unique:true
    },
    image:String,
    createdAt:{
        type:Date,
        default:Date.now()
    }
},
{
    timestamps:true
})

blogSchema.pre('save',function(next){
    this.shareableLink = `http://localhost:8000/kisaan/blog/${this._id}`
    next()
})

export const Blog = mongoose.model("Blog",blogSchema)