import mongoose, { Schema } from "mongoose";
const productSchema = new Schema({
    seller:{
        type:Schema.Types.ObjectId,
        ref:'Seller'
    },
    description:String,
    features:{
        type:String,
    },
    productName:{
        type:String,

    },
    price:Number,
    rating:{
        type:String
    },
    shareableLink:{
        type:String,
        unique:true
    },
    productImage:{
        type:String,
        required:false
    },
    comapany:{
        type:String,
        default:"Agro Techies"
    }

})

productSchema.pre('save',function(next){
    this.shareableLink = `http://localhost:8000/kisaan/shareProduct/${this._id}`
    next()
})

export const Product = mongoose.model("Product",productSchema)