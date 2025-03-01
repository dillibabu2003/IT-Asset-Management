import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import axiosInstance from '../utils/axios';

const VerifyEmail = () => {
    const [isLoading,setIsLoading] = useState(true);
    const [result,setResult] = useState(null);
    const id = useParams().id;
    useEffect(()=>{
        if(!id){
            setResult("Invalid Verification Link");
            setIsLoading(false);
            return;
        }
        const abortController = new AbortController();
        async function verifyEmail(){
            try {
                const response = await axiosInstance.get(`/auth/verify-email/${id}`,null,{signal: abortController.signal});
                console.log(response.data);
                setResult(response.data.message);
            } catch (error) {
                console.error(error);
                setResult("An error occurred while verifying email");
            }
            finally{
                setIsLoading(false);
            }
        }
        verifyEmail();
        return ()=>{
            abortController.abort();
        }
    }
    ,[])
  return (
    <div>
        {isLoading ? "Verifying Your Email...": result}
    </div>
  )
}

export default VerifyEmail;