import { upload } from "../middlewares/multer.middleware.js"
import { uploadOnCloudinary } from "../middlewares/cloudinary.middleware.js";
import express from "express";
import { Seller } from "../models/seller.model.js";
import { Product } from "../models/product.model.js";

const addProduct =  async (req, res) => {
    try {
        const { description, features, price,type,company,productName } = req.body;
        const username = req.user.username;
        const imagePath = req.file.path;
        console.log(imagePath)
        // const cloudinaryResponse = await uploadOnCloudinary(imagePath);
        // console.log(cloudinaryResponse)
        // const url = cloudinaryResponse.url; 
        const seller = await Seller.findOne({ username });
        if (!seller) throw new Error('Seller not found');
        const product = await Product.create({
            seller: seller._id,
            description,
            features,
            productName,
            price,
            type,
            company,
            productImage: "url"
        });
        await product.save();
        seller.products.push(product._id);
        await seller.save();
        res.redirect('/seller/profile');
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Error adding product');
    }
}

export {addProduct}