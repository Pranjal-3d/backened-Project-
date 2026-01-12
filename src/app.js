import express from "express"
import cors from "cors"
import cookieParser  from "cookie-parser"

const app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))
app.use(express.json({
    limit:"16kb",
}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
//used in middleware or configuration
app.get("/",(req,res)=>{
    res.send("Server connected");
})

//routes
import userRouter from'./routes/user.routes.js'
import router from "./routes/user.routes.js"

//routes declare 

app.use("/api/v1/users",userRouter)
export default app

//cookie parser conver the raw string into js so that it is readable by express
//app.use -used when we need middlewhere or configure setting