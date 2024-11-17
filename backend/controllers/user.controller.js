import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getSuggestedConnections = async (req, res) => {
    
    try{
        const currentUser = await User.findById(req.user._id).select("connections");
        
        //find users who are not in the current user's connections and also not suggest our own profile
        const suggestedUser  = await User.find({
            _id: {
                $ne:req.user._id,$nin: currentUser.connections
            }
        })
        .select("name username profilePic headline")
        .limit(3);

        res.json(suggestedUser);
    }catch(error){
        console.error("Error in suggestedConnection Controller",error);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const getPublicProfile = async (req, res) => {
    try{
        const user = await User.findOne({username:req.params.username}).select("-password");

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        res.json(user);
    }catch(error){
        console.error("Error in getPublicProfile Controller",error);
        res.status(500).json({message:"Server Error"});
    }
}

export const updateProfile = async (req, res) => {
    try{
        const allowedFields = [
            "name",
            "username",
            "headline",
            "about",
            "location",
            "profilePicture",
            "bannerImg",
            "skills",
            "experience",
            "education"
        ];

        const updateData = {};

        for(const field of allowedFields){
            if(req.body[field]){
                updateData[field] = req.body[field];
            }
        }

        if(req.body.profilePicture){
            const result = await cloudinary.uploader.upload(req.body.profilePicture)
            updateData.profilePicture = result.secure_url;
        }

        if (req.body.bannerImage) {
            const result = await cloudinary.uploader.upload(req.body.bannerImage)
            updateData.bannerImage = result.secure_url;
        }

        const user = await User.findByIdAndUpdate(req.user._id , {$set: updateData, },{new:true}).select(
            "-password"
        );

        res.json(user);

    }catch(error){
        console.error("Error in updateProfile Controller",error);
        res.status(500).json({message:"Server Error"});
    }
}