import { Schema, model } from 'mongoose';
import plm from 'passport-local-mongoose';

const orderSchema = new Schema({
  product : {
    type:Schema.Types.ObjectId,
    ref:"Product"
  },
  user:{
    type:Schema.Types.ObjectId,
    ref:"Kisaan"
  },
  productName:String,
  address:String,
  username:String,
  price:Number,
  mode:String,
  contact:Number,
  productImage:String,
  status:String
});

orderSchema.plugin(plm);

export const Order = model('Order', orderSchema);

