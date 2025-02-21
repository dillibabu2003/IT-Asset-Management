import React, { useEffect, useState } from 'react'
import axiosInstance from '../utils/axios';
import {PAGE_LIMIT} from "../utils/constants";
import Checkout from '../components/Checkout';

const CheckoutPage = () => {


const [data,setData]=useState();
const [page,setPage]=useState(1);
console.log(data);

useEffect(()=>{
    const abortController = new AbortController();
    async function fetchData(){
        try {
            const response = await axiosInstance.get(`/assets?page=${page}&limit=${PAGE_LIMIT}`,{signal: abortController.signal});
            console.log(response.data);
            
            setData(response.data);
        } catch (error) {
            console.error(error);
            
            console.log("Error occurred while fetching data");
            
        }
    }
    fetchData();
    return ()=>{
        abortController.abort();
    }
},[page]);
  return (
    <Checkout />
  )
}

export default CheckoutPage;