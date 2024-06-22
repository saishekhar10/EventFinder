const ErrorNotificaiton =({message})=>{

    if(message===''){
        return null
    }
    else{
        return(
            <div className='errorNotification'>
                {message}
            </div>
        )

    }

}
export default ErrorNotificaiton