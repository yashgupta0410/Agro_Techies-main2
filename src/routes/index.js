import express from "express";
import dotenv from "dotenv";
import connectDB from "../db/index.js";
import { handleChatMessage, trainClassifier } from "../controllers/chatbot.controller.js";
import { logout } from "../controllers/auth.controller.js";
const router = express.Router();
const classifier = trainClassifier();

dotenv.config({
  path: './.env'
});

connectDB();




router.get('/chatbot', async function(req, res, next) {
    res.render("chatbot");
});

router.get("/",(req,res)=>{
  res.render("index")
})
router.post('/chat', (req, res) => {
  const { message } = req.body;
  console.log(message)
  const answer = handleChatMessage(classifier, message);
  res.json({ answer });
});


router.get('/logout',logout)





export default router;
