import mongoose, { Schema, model }  from "mongoose";
const commentSchema = new Schema({
    kisaanImage:{
        type:String,
    },
    user:{
        type:String
    },
    comment:{
        type:String
    },
    blog:{
        type:Schema.Types.ObjectId,
        ref:"Blog"
    }

},{timestamps:true}
)
export const Comment = model("Comment",commentSchema);