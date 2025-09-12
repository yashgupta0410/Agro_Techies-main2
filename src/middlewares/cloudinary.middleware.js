import { v2 as cloudinary} from "cloudinary";
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localfilepath)=>{
    try {
        if(!localfilepath) return null;
        //upload the file on cloudinaryp
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        //file has been succesfully uploaded
        console.log("file has been uploaded on cloudinary",response.url)
        // unlinking i.e. deleting the file in localstorage
        fs.unlinkSync(localfilepath)
        return response;
        
    } catch (error) {
        fs.unlinkSync(localfilepath) //remove the locally saved temporary file as upload is get failed   
        return null      
    }
}

export {uploadOnCloudinary}

