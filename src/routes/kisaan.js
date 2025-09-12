import express from "express"
const router = express.Router()
import { Kisaan } from "../models/kisaan.model.js";
import passport from 'passport';
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary } from "../middlewares/cloudinary.middleware.js";
import { farmerRegistration, isLoggedIn, kisaanLogin, logout } from "../controllers/auth.controller.js";
import { Blog } from "../models/blog.model.js";
import { Inventory, addCrops, addCropsForm, allProducts, login, sellingCrop, showmarketPlace, signup, weatherApi } from "../controllers/kisaan.controller.js";
import { Product } from "../models/product.model.js";
import { Crop } from "../models/crop.model.js";
import { cropPrice } from "../models/officerCrop.model.js";

import { orderForm, stripePaymentProcessingGet, stripePaymentProcessingPost, success } from "../controllers/payment.controller.js";
import { Review } from "../models/review.model.js";
import { Seller } from "../models/seller.model.js";
import { Comment } from "../models/blogComments.model.js";
import { Redeem } from "../models/redeem.model.js";
router.get('/payment/:id',stripePaymentProcessingGet);
router.get("/success/:sellerId",isLoggedIn,success)
router.post('/payment/:id', isLoggedIn,stripePaymentProcessingPost)
router.post("/place-order/:id",isLoggedIn,orderForm)

router.get('/signup',signup)
router.get('/login',login)

router.post("/signup",farmerRegistration)

router.post('/login', kisaanLogin)
router.get('/place-order/:Id',isLoggedIn,async(req,res)=>{
  const productId = req.params.Id;
  const kisaan = await Kisaan.findOne({username:req.user.username})
  const product = await Product.findOne({_id:productId})
  res.render('prePlaceOrderForm',{productId,product,kisaan})
})

router.post("/kisaan-p-image-upload",isLoggedIn,upload.single("image"), async (req, res) => {
  try {
      const username = req.user.username;
      const kisaan = await Kisaan.findOne({ username: username });
      
      if (!kisaan) {
          return res.status(404).json({ error: "Kisaan not found" });
      }

      const path = req.file.path;
      const cloudinaryResponse = await uploadOnCloudinary(path);

      if (!cloudinaryResponse || !cloudinaryResponse.url) {
          return res.status(500).json({ error: "Failed to upload image to Cloudinary" });
      }

      const url = cloudinaryResponse.url;
      kisaan.profileImage = url;
      await kisaan.save();

      return res.redirect("/kisaan/profile");
  } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/orders',isLoggedIn,async(req,res)=>{
  const kisaan = await Kisaan.findOne({username:req.user.username}).populate('orders')
  res.render('kisaanOrder',{kisaan})
})
router.get('/profile',isLoggedIn,async(req,res)=>{
  const kisaan = await Kisaan.findOne({username:req.session.passport.user})
  res.render('kisaanProfile',{kisaan})
})
router.get('/inventory',isLoggedIn,Inventory)
router.get('/chatbot',isLoggedIn, async function(req, res, next) {
  const kisaan = await Kisaan.findOne({username:req.session.passport.user})
  res.render("chatbot",{kisaan});
});
router.get('/market',isLoggedIn,allProducts)
router.get('/product/:id',isLoggedIn,async (req,res)=>{
  const product = await Product.findOne({_id:req.params.id}).populate('seller')
  const review = await Review.find({productid:req.params.id}).populate('user')
  console.log(review)
  res.render('farmer_product_detail',{product,review});
})
router.post('/buy/:id',isLoggedIn,async (req,res)=>{
  const id = req.params.id
  const products =  await Product.findOne({_id:id});
  res.send(products);
})
router.post("/review/:id", isLoggedIn, upload.single("reviewImage"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    if (!req.file) {
      return res.status(400).send("No image uploaded");
    }

    const path = req.file.path;
    const cloud = await uploadOnCloudinary(path);
    if (!cloud || !cloud.url) {
      return res.status(500).send("Error uploading image to Cloudinary");
    }

    const kisaan = await Kisaan.findByUsername(req.session.passport.user);
    if (!kisaan) {
      return res.status(404).send("User not found");
    }

    const review = await Review.create({
      reviewImage: cloud.url,
      reviews: req.body.reviews,
      productid: req.params.id,
      product: product.productName,
      user: kisaan._id
    });

    await review.save();
    res.redirect(`/kisaan/product/${product._id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.get('/logout',logout)

router.get('/marketPlace',isLoggedIn,showmarketPlace);
router.post('/marketPlace/:cropName',isLoggedIn,sellingCrop);
router.post('/addCrops', isLoggedIn, addCrops);
router.get('/addCrops',isLoggedIn,addCropsForm);

router.get("/blog",isLoggedIn,async (req,res)=>{
  const blogs = await Blog.find();
  console.log(blogs);
  res.render('blog',{blogs})
})

router.get('/blogs/:id',isLoggedIn,async(req,res)=>{
  const blog = await Blog.findOne({_id:req.params.id});
  const comments = await Comment.find({blog:blog._id});
  res.render('kisaanIndividualBlog',{blog,comments});
})
router.get('/blog/:id',async(req,res)=>{
  const blog = await Blog.findOne({_id:req.params.id});
  const comments = await Comment.find({blog:blog._id});
  res.render('kisaanIndividualBlog',{blog,comments});
})
router.post('/redeem',isLoggedIn, async(req,res)=>{
  const kisaan = await Kisaan.findOne({username:req.user.username})
  const {account,ifsc,accountNumber} = req.body
  const redeem = await Redeem.create({
    account,
    accountNumber,ifsc,kisaan:kisaan._id,balance:kisaan.balance
  })
  await redeem.save();
  kisaan.balance = 0;
  await kisaan.save();
  res.redirect('/kisaan/profile')
})
router.get("/market",isLoggedIn,async (req,res)=>{
  const product = await Product.find();
  res.send(product)
})
router.get('/weather',isLoggedIn, weatherApi)
router.get('/weether',isLoggedIn,(req,res)=>{
  res.render('weather')
})
router.post('/comment/:blogId',isLoggedIn,async(req,res)=>{
  const blogId = req.params.blogId
  const blog = await Blog.findOne({_id:req.params.blogId});
  const kisaan = await Kisaan.findOne({username:req.user.username});

  const comment = await Comment.create({
    comment:req.body.comment,
    kisaanImage:kisaan.profileImage,
    user:kisaan.username,
    blog:blog._id
  });
  await comment.save();

  res.redirect(`/kisaan/blogs/${blogId}`)
})

router.get('/logout',logout)
router.get('/dashboard',isLoggedIn,async(req,res)=>{
  const username = req.user.username
  const kisaan = await Kisaan.findOne({username});
  // const balanceHistory = await kisaan.select('balanceHistory').exec();
  res.render('kisaanDashboard',{kisaan})
})
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//for dashboard .....
router.get('/balance-chart', async (req, res) => {
  try {
      // Simulated data for testing
      const balanceHistory = [
          1244, 124, 1204, 1444, 1244, 124, 1204, 1444, 1244, 124,
          1204, 1444, 1244, 124, 1204, 1444, 1244, 124, 1204, 1444,
          1244, 124, 1204, 1444
      ];

      // Create a canvas and context
      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext('2d');

      // Create a new chart instance
      const chart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: Array.from({ length: balanceHistory.length }, (_, i) => i + 1),
              datasets: [{
                  label: 'Balance (INR)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  data: balanceHistory
              }]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: true
                      }
                  }]
              }
          }
      });

      // Convert the chart to a base64-encoded PNG image
      const chartImageUrl = canvas.toDataURL();

      // Send the chart image as the response
      res.send(`<img src="${chartImageUrl}" alt="Balance Chart">`);
  } catch (error) {
      console.error('Error generating balance chart:', error);
      res.status(500).send('Internal Server Error');
  }
});
router.get('/soldcrops',isLoggedIn,async(req,res)=>{
  const username = req.user.username
  const kisaan = await Kisaan.findOne({username}); 
  res.json(kisaan.soldCrops);
})

router.get('/shareProduct/:productId',async(req,res)=>{
  const productId = req.params.productId
  const product = await Product.findOne({_id:productId})
  res.render("shareProduct",{product})
})
// Route to fetch crop quantity data
router.get('/crop-quantity', async (req, res) => {
  try {
      const kisaanId = req.user._id;
      const kisaan = await Kisaan.findById(kisaanId).select('crops').exec();
      res.json(kisaan.crops);
  } catch (error) {
      console.error('Error fetching crop quantity data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to fetch crop distribution data
router.get('/crop-distribution', async (req, res) => {
  try {
      // Add logic to fetch crop distribution data from the database
      res.json({ message: 'Crop distribution data' });
  } catch (error) {
      console.error('Error fetching crop distribution data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to fetch crop price data
router.get('/crop-price', async (req, res) => {
  try {
      // Add logic to fetch crop price data from the database
      res.json({ message: 'Crop price data' });
  } catch (error) {
      console.error('Error fetching crop price data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default router
