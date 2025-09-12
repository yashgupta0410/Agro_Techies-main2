import express from "express"
const router = express.Router()
import { Seller } from "../models/seller.model.js"
import { isLoggedIn, logout, sellerLogin, sellerRegistration } from "../controllers/auth.controller.js"
import  passport  from "passport"
import { Product } from "../models/product.model.js"
import { upload } from "../middlewares/multer.middleware.js"
import { uploadOnCloudinary } from "../middlewares/cloudinary.middleware.js";
import { addProduct } from "../controllers/seller.controller.js"
import { Order } from "../models/order.model.js"

router.get("/home",isLoggedIn,(req,res)=>{
    res.send("Sellers - HOME")
})
router.get("/signup",(req,res)=>{
    res.render("seller.auth.ejs")
})
router.get("/login",(req,res)=>{
    res.render("sellerLogin")
})
router.post('/addproduct', isLoggedIn, upload.single('productImage'),addProduct)
router.delete('/product/:productId', isLoggedIn, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.productId);
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/updateProduct/:productId', isLoggedIn, async (req, res) => {
    try {
        const productId = req.params.productId;
        console.log(productId);
        const { description, productName, features, price } = req.body; // Corrected variable name to productName
        console.log("productName:", productName); // Logging productName for debugging
        const updates = {};
        if (description) updates.description = description;
        if (productName) updates.productName = productName;
        if (features) updates.features = features;
        if (price) updates.price = price;
        const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        console.log('Updated Product:', updatedProduct); 
        res.redirect(`/seller/myproducts`);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/orders',isLoggedIn,async(req,res)=>{
    const seller = await Seller.findOne({username:req.user.username}).populate('orders')
    console.log(seller)
    res.render('sellerOrder',{seller})
})

router.get('/logout',logout)

router.get('/product/:id',isLoggedIn,async(req,res)=>{
    const product = await Product.findOne({_id:req.params.id})
    res.render('updateProductForm',{product})
})

router.post('/status/:orderId',isLoggedIn,async(req,res)=>{
    const order = await Order.findOne({_id:req.params.orderId})
    order.status = req.body.status;
    await order.save();
    res.redirect('/seller/orders');
})


router.get('/myproducts',isLoggedIn,async(req,res)=>{
    const username = req.user.username;
    console.log(username);
    const seller = await Seller.findOne({username}).populate('products');
    res.render('myproducts',{seller});
})
router.get('/addproduct',isLoggedIn,async(req,res)=>{
    res.render('seller_addproduct')
})
router.post('/login',sellerLogin)
router.post("/signup",sellerRegistration);
router.get('/profile',isLoggedIn,async (req,res)=>{
    const seller = await Seller.findOne({username:req.user.username}).populate('orders')
    res.render('sellerProfile',{seller})
})
router.post("/sellerImage",isLoggedIn,upload.single("profileImage"), async (req, res) => {
    try {
        const username = req.user.username;
        const seller = await Seller.findOne({ username: username });
        
        if (!seller) {
            return res.status(404).json({ error: "Seller not found" });
        }
  
        const path = req.file.path;
        const cloudinaryResponse = await uploadOnCloudinary(path);
  
        if (!cloudinaryResponse || !cloudinaryResponse.url) {
            return res.status(500).json({ error: "Failed to upload image to Cloudinary" });
        }
  
        const url = cloudinaryResponse.url;
        seller.profileImage = url;
        await seller.save();
  
        return res.redirect("/seller/profile");
    } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
router.post("/test",isLoggedIn,upload.single("profileImage"),async(req,res)=>{
    const seller =  await Seller.findOne({username:req.user.username})
    const path = req.file.path
    const cloudinary = await uploadOnCloudinary(path)
    const url = cloudinary.url;
    seller.profileImage = url;
    seller.save();
    res.redirect('/seller/test')
})
router.get("/test",isLoggedIn,(req,res)=>{
    res.render('test')
})


export default router