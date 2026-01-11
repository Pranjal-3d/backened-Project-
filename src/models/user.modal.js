import mongoose from "mongoose"
import brcypt from "brcypt"
import json from "jsonwebtoken"

const UserSchema= new mongoose.Schema(
   
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true,//searching feild enalbling like you have to search then use index
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true,
        },
        avatar:{
            type:String,//clodinary url
            required:true,
        },
        coverImage:{
            type:String,
        },
        WatchHistory:{
            type:Schema.types.ObjectId,
            ref:"Video",
        },
        Password:
        {
            type:String,
            required:[true,"Password is required"],
        },
        refreshToken:{
            type:String,
        }
},{timpestamps:true}
)
UserSchema.pre("save",async function (next){
    if(!this.isModified("Password")) return next();
    this.Password=brcypt.hash(this.Password,10)
    next()
})
UserSchema.methods.isPasswordCorrect=async function(Password){
    return   await brcypt.compare(Password,this.Password)

}
UserSchema.methods.generateAccessToken=function(){
    jwt.sign({
        _id:this._id,
        email:this._email,
        username:this._username,
        fullname:this._fullname,
        //left part is payload and right side is coming from database

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expireIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
UserSchema.methods.genrateRefreshToken=function(){
    UserSchema.methods.generateRefreshToken=function(){
        jwt.sign({
            _id:this._id,
            //left part is payload and right side is coming from database 
            //in refresh token information is less 
    
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expireIn:process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
    }
}

export const User=mongoose.model("User",UserSchema)
//bcrypt library is used to safely hash tha password 
//jasonwebToken-it create the token non human readable what ever you want the data to sednd it automatically encdeed
