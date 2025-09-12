import mongoose from "mongoose";

const connectDB = async () =>{
    try {
    //    const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/Kisaan`) 
       const connectionInstance =  await mongoose.connect(`mongodb://localhost:27017/kisaan`) 
       console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`)    
    } catch (error) {
        console.log("MONDODB CONNECTION ERROR -- ",error)
        process.exit(1);
        
    }
}
export default connectDB
