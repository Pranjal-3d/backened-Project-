import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.modal.js";
import { uploadOnCloudinary } from "../utils/clodinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens=async(userId)=>{
  try{
      const user=await User.findById(userId) //for generating the token first we have to find the user
      const accessToken= user.generateAccessToken()//it save in browser for if i login previously so next time you will be login 
      const refreshToken=user.generateRefreshToken()

      user.refreshToken=refreshToken
      await user.save({validateBeforeSave:false})//we have use the validateBeforedave bacause save function password rrquired before here password is not there so false

      return {accessToken,refreshToken}

  }
  catch(error){
    throw new ApiError(500,"something went wrong while generating refresh and access token")
  }
}
// for registration success full firstly we need to take the data validate it then store it to mongodb and responses to client that successful register
const registerUser=asyncHandler( async(req,res)=>{
    //get user details from frontened
    //validation 
    //check if user already exist : username and email
    //check for images,check for avatar
    //upload them to cloudinary,avatar 
    //create user object {because mongodb is nosql so make object} create entry in db
    //remove password and refresha token feild from remove
    //check for user creation 
    //return response 

    const {fullName,email,username,password}=req.body
    console.log("email: ",email);

    // Check if any required field is missing or empty
    if(
        [fullName,email,username,password].some((field)=>
            field === undefined || field === null || (typeof field === 'string' && field.trim() === "")
        )
    ){
        throw new ApiError(400,"all fields are required")
    }

   const existedUser= await User.findOne({
        $or:[{ username },{ email }]
    })//you can also use find

    if(existedUser){
        throw new ApiError(409,"user with email or username already exists")
    }

    const avatarLocalPath=req.files?.avatar?.[0]?.path;
   const coverImageLocalPath=req.files?.coverImage?.[0]?.path;

   console.log("BODY:", req.body);
console.log("FILES:", req.files);

   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
   }
   if(!coverImageLocalPath){
    throw new ApiError(400,"CoverImage is required")
   }

  const avatar= await uploadOnCloudinary(avatarLocalPath)
  const coverImage= await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400,"avatar is required")
  }
  if(!coverImage){
    throw new ApiError(400,"CoverImage is required")
  }
  const user= await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage.url,
    email,
    password,
    username:username.toLowerCase(),
  })

  const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
  )//by using select the data which you want 

  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")
  }
  return res.status(201).json (
    new ApiResponse(200,createdUser,"User Registered Successfully")
  )

})
const loginUser=asyncHandler(async(req,res)=>
  
  {


// user detail from frontened 
//username or email 
//find the user
//uer password and email will be match from the database means both refreshtoken will match from the database
//send cookies and send response 
    const {email,username,password}=req.body

    if(!username && !email){
      throw new ApiError(400,"username or email is required")
    }

    if(!password){
      throw new ApiError(400,"password is required")
    }

    const user=await User.findOne({
      $or:[{username},{email}]
    })
    if(!user){
      throw new ApiError(400,"User is not registered ")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
      throw new ApiError(400,"Invalid user credentials")
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
      httpOnly:true,
      secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(
        200,
        {
          user:loggedInUser,accessToken,
          refreshToken

        },
        "User logged in successfully"
      )
    )
})

const loggedOut=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined // this removes the field from document
      }
    },
    {
      new: true
    }
  )

  const options={
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{

  const incomingRefreshTokens=req.cookie.refreshAccessToken||req.body.refreshAccessToken

  if(!incomingRefreshTokens)
  {
    throw new ApiError(401,"Unaurthorized Request")
  }

 try {
   const decodedToken=jwt.verify(
     incomingRefreshTokens,
     process.env.REFRESH_TOKEN_SECRET
   )
 
   const user=await User.findById(decodedToken?._id)
 
   if(!user)
   {
     throw new ApiError(401,"Invalid refreshToken")
   }
 
   if(incomingRefreshTokens !== user?.refreshAccessToken){
     throw new ApiError(401,"Refresh token is expired or used")
   }
 
   const options={
     httpOnly:true,
     secure:true
   }
 
   await generateAccessAndRefreshTokens(user._id)
 
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
     new ApiResponse(
       200,
       {accessToken,refreshToken :newrefreshToken},
       "access token refreshed"
     )
   )
 } catch (error) {

  throw new ApiError(401,error?.message)
  
 }

})
export {registerUser,loginUser,loggedOut,refreshAccessToken}