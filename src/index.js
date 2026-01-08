import mongoose from "mongoose";
import { DB_NAME } from "./constant.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv"

dotenv.config({
    path:'./.env'
})






connectDB()






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

