import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.modal.js";
import { uploadOnCloudinary } from "../utils/clodinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

    if(fullName==""){
        throw new ApiError(400,"fullname is required")
    }
    if(
        [fullName,email,username,password].some((field)=>
            field.trim()==="")//you can check in it by apply condition and ut return true and false
    ){
        throw ApiError(400,"all fields are required")
    }

   const existedUser= User.findOne({
        $or:[{ username },{ email }]
    })//you can also use find

    if(existedUser){
        throw new ApiError(409,"user with email or username already exists")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
   const coverImageLocalPath=req.files?.coverImage[0]?.path;

   if(!avatarLocalPath){
    throw ApiError(400,"Avatar file is required")
   }
   if(!coverImageLocalPath){
    throw ApiError(400,"CoverImage is required")
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
    "-Password -refreshToken"
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

    if(!username||!email){
      throw new ApiError(400,"username or password is required")
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
      secure:true
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
  
})

export {registerUser,loginUser,loggedOut}