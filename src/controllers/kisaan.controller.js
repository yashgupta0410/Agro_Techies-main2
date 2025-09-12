import express from "express";
import { Crop } from "../models/crop.model.js";
import { Kisaan } from "../models/kisaan.model.js";
import {cropPrice} from "../models/officerCrop.model.js";
import { Product } from "../models/product.model.js";



const weatherApi = async (req, res) => {
    try {
        const kisaan = await Kisaan.findOne({username:req.user.username})
        console.log(kisaan)
        const city = kisaan.city
        console.log(kisaan.city)
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER}&units=metric`);
        const data = await response.json();
  
        const {
            name: cityName,
            main: { temp: temperature, feels_like: feelsLike, humidity },
            weather,
            wind: { speed: windSpeed },
            visibility,
            sys: { sunrise, sunset },
            main: { pressure }
        } = data;
  
        const weatherInfo = {
            city: cityName,
            temperature: temperature,
            feelsLike: feelsLike,
            description: weather[0].description,
            humidity: humidity,
            windSpeed: windSpeed,
            pressure: pressure,
            visibility: visibility,
            sunrise: new Date(sunrise * 1000).toLocaleTimeString('en-US'),
            sunset: new Date(sunset * 1000).toLocaleTimeString('en-US')
        };
  
        res.json(weatherInfo);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  const sellingCrop = async (req, res) => {
    try {
        const cropName = req.params.cropName;
        console.log(cropName);
        const { quantity } = req.body;
        console.log(quantity);
        const kisaanId = req.user._id;
        const kisaan = await Kisaan.findOne({ _id: kisaanId }).populate('crops');
        console.log("yeeeeeeeeeee");
        console.log(kisaan)

        const particularCrop = await cropPrice.findOne({ cropName: cropName });
        console.log(particularCrop)
        if (!particularCrop) {
            return res.status(404).send('Crop not found');
        }
        if (!kisaan.crops || !kisaan.crops[cropName] || kisaan.crops[cropName] < quantity) {
            return res.status(400).send('Insufficient quantity of crop');
        }
        const totalPrice = particularCrop.price * quantity;
        console.log(totalPrice)
        kisaan.balance += totalPrice;
        kisaan.crops[cropName] -= quantity;
        particularCrop.totalSelled += totalPrice;
        kisaan.soldCrops.push({
            cropName,
            quantitySold: quantity,
            pricePerKg: particularCrop.price,
            totalPrice
        });
        await kisaan.save();
        await particularCrop.save();

        res.status(200).send('Crop sold successfully');
    } catch (error) {
        console.error('Error selling crop:', error);
        res.status(500).send('Internal Server Error');
    }
}


const showmarketPlace = async (req,res)=>{
    const crops = await cropPrice.find();
    res.render('kisaan_marketPlace',{crops})
  
  }
const allProducts = async (req,res)=>{
    const products =  await Product.find();
    res.render('kisaan_market',{products});
  }
  const Inventory = async (req, res) => {
    try {
        const username = req.session.passport.user;
        const kisaan = await Kisaan.findOne({ username }).populate('crops');
        console.log("dekhlo yaarc yhi h --------------> ",kisaan.crops)
        res.render('inventory', { crops: kisaan.crops });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


  
const signup =  function(req, res, next) {
    res.render('kisaan.auth.ejs');
  }
const login =  function(req, res, next) {
    res.render('kisaanLogin');
  }
const addCrops = async (req, res) => {
    try {
        const username = req.user.username
        const farmer = await Kisaan.findOne({username});
        const { rice, wheat, maize } = req.body;
        const newCrop = await Crop.create({
            kisaan:farmer._id,
            rice: rice || 0,
            wheat: wheat || 0,
            maize: maize || 0
        });
        await newCrop.save();
        console.log(newCrop)
        farmer.crops = newCrop._id;
        await farmer.save();
        res.redirect('/kisaan/inventory'); 
    } catch (error) {
        console.error('Error adding crops:', error);
        res.status(500).send('Error adding crops');
    }
  }
const addCropsForm = (req,res)=>{
    res.render('kisaan_addCrops')
  }
  
export {weatherApi,sellingCrop,showmarketPlace,allProducts,Inventory,signup,login,addCrops,addCropsForm}