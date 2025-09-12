import express, { request } from "express"
const router = express.Router()
import { Blog } from "../models/blog.model.js";
import { isLoggedIn, logout, officerLogin, officerRegistration } from "../controllers/auth.controller.js";
import { Officer } from "../models/officer.model.js"
import { Seller } from "../models/seller.model.js";
import  passport  from "passport";
import { cropPrice } from '../models/officerCrop.model.js';
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary} from "../middlewares/cloudinary.middleware.js";
import { Mongoose } from "mongoose";
import { Redeem } from "../models/redeem.model.js";

router.post("/blog", isLoggedIn, upload.single('image'), async (req, res) => {
    try {
        const username = req.user.username;
        console.log(username);
        const officer = await Officer.findByUsername(username);
        console.log("data of officer", officer);
        const filePath = req.file.path;
        const cloudinaryResponse = await uploadOnCloudinary(filePath);
        if (!cloudinaryResponse || !cloudinaryResponse.url) {
            throw new Error("Failed to upload image to Cloudinary");
        }
        const url = cloudinaryResponse.url;
        console.log(url);
        const data = await Blog.create({
            heading: req.body.heading,
            content: req.body.content,
            officer: officer.fullName,
            designation: officer.designation,
            elligibility: req.body.elligibility,
            schemeLink: req.body.schemeLink,
            image: url
        });
        await data.save();
        officer.blogs.push(data._id);
        await officer.save();
        res.redirect('/officer/blogt');
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/blog/:id', isLoggedIn, async (req, res) => {
    try {
        const blogId = req.params.id;
        await Blog.findByIdAndDelete(blogId);
        res.status(200).json({ message: 'Blog post deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get("/home",isLoggedIn,(req,res)=>{
    res.send("OFFICERS - HOME")
})
router.post("/officer-p-image-upload",isLoggedIn,upload.single("profileImage"), async (req, res) => {
    try {
        const username = req.user.username;
        const officer = await Officer.findOne({ username: username });
        console.log(username,"bhugevcj ghjv yufg g ftv gh yuvgkjh")
        if (!officer) {
            return res.status(404).json({ error: "Officer not found" });
        }
  
        const path = req.file.path;
        console.log(path)
        const cloudinaryResponse = await uploadOnCloudinary(path);
  
        if (!cloudinaryResponse || !cloudinaryResponse.url) {
            return res.status(500).json({ error: "Failed to upload image to Cloudinary" });
        }
  
        const url = cloudinaryResponse.url;
        console.log(url)
        officer.profileImage = url;
        await officer.save();
        return res.redirect("/officer/profile");
    } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
router.get("/profile",isLoggedIn,async (req,res)=>{
    const officer = await Officer.findOne({username:req.user.username});
    const totalkisaan = await Officer.countDocuments();
    res.render("officerProfile",{officer,totalkisaan})
})
router.get("/blogt", isLoggedIn, async function(req, res) {
    try {
        const blogs = await Blog.find();
        const officer = await Officer.findOne({ username: req.session.passport.user });
        console.log(officer);
        console.log("blogs:", blogs);
        res.render('blogToolkit', { blogs });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/blog",isLoggedIn,async function(req,res){
    const blogs = Blog.find();
    res.render('blog',{blogs})
})
router.get("/signup",(req,res)=>{
    res.render("officer.auth.ejs")
})
router.get("/login",(req,res)=>{
    res.render("officerLogin")
})
router.get('/marketPlace',isLoggedIn,async (req,res)=>{
    const crops = await cropPrice.find();
    res.render('officer_market',{crops})
})
router.post('/marketPlace',isLoggedIn,async (req, res) => {
    try {
        const { 'cropName[]': cropNames, 'price[]': prices } = req.body;
        for (let i = 0; i < cropNames.length; i++) {
            const name = cropNames[i];
            const price = prices[i];

            const crop = await cropPrice.create({
                cropName: name,
                price: price,
            });
        }

        res.redirect('/officer/profile');
    } catch (error) {
        console.error('Error inserting crop prices:', error);
        res.status(500).send('Error inserting crop prices.');
    }
});

router.get('/logout',logout)
router.put('/marketPlace/:cropId', isLoggedIn,async (req, res) => {
    try {
        const { cropId } = req.params;
        const { price } = req.body;

        const updatedCrop = await cropPrice.findByIdAndUpdate(cropId, { price }, { new: true });

        if (!updatedCrop) {
            return res.status(404).send('Crop not found.');
        }
        res.status(200).send('Price updated successfully.');
    } catch (error) {
        console.error('Error updating crop price:', error);
        res.status(500).send('Error updating crop price.');
    }
});

router.delete('/marketPlace/:cropId',isLoggedIn,async (req, res) => {
    try {
        const { cropId } = req.params;
        console.log(cropId)
        const deletedCrop = await cropPrice.findByIdAndDelete(cropId);
        if (!deletedCrop) {
            return res.status(404).send('Crop not found');
        }
        res.status(200).send('Crop deleted successfully');
    } catch (error) {
        console.error('Error deleting crop:', error);
        res.status(500).send('Error deleting crop');
    }
});


router.get('/addCrops',isLoggedIn,(req,res)=>{
    res.render('officer_addCrops')
})
router.get('/addblog',isLoggedIn,(req,res)=>{
    res.render('officer_addblog')
})
router.post("/signup",officerRegistration);
router.post('/login', officerLogin)
router.get('/redeem',isLoggedIn,async (req,res)=>{
    const requests = await Redeem.find();
    res.render('redeem',{requests})
})

export default router;