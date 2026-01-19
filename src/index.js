import mongoose from "mongoose";
import { DB_NAME } from "./constant.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv"
import { error } from "console";
import  app  from "./app.js";


dotenv.config({
    path:'./.env'
})







connectDB()
.then(()=>{
    app.listen(process.env.PORT|| 8000,()=>{
        console.log(`server is running`)
    });
    app.on("error",(error)=>{
        console.error("server error",error);
    });
})
.catch((err)=>{
    console.log("mongo db connection failed",err);
})






//connection of database code method 1


// (async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
//         app.on("error:",(error) => {
//             console.log("ERROR",error);
//             throw error
//         });
//         app.listen(process.env.PORT,()=>{
//             console.log(`APP is listening on PORT $ {process.env.PORT}`);
//         })
//     }
//     catch(error)
//     {
//         console.log("ERROR:",error)
//         throw error
//     }
// })()

