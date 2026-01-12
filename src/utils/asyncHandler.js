const asyncHandler =(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}

//basically express cannot see the error causing in async await so this async handler see the error in async and send to the express this is function of asyncHandler


export {asyncHandler}


// const asyncHandler=()=>{}
// const asyncHandler=(func)=>()=>{}
// const asyncHandler(func)=> async ()=>{}

// const asyncHandler=(fn)=>async(req,res,next)=>{
//     try{
//             await fn(req,res,next)
//     }
//     catch(error){
//         res.status(err.code||500).json({
//             success:false,
//             message:err.message,
//         })
//     }
// }