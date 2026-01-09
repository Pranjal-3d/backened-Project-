class ApiError extends Error{
    contructor(
        statusCode,
        message="Something went wrong",
        error=[],
        stack=""
    ){
        super(message)
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success=false,
        this.error=error

        if(statck){
            this.statck=statck

        }
        else{
            Error.captureStackTrace(this,this.contructor)
        }
    }
}
export {ApiError}