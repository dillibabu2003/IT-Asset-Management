import React, { useEffect, useState } from 'react'
import CustomTable from '../components/CustomTable';
import axiosInstance from '../utils/axios';
import Loader from '../components/Loader';
import {PAGE_LIMIT} from "../utils/constants";
import InvoiceSection from '../components/InvoiceSection';
import InvoiceSection1 from '../components/InvoiceSection1';
const InvoicesPage = () => {


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
    !data ? <Loader />:
    <InvoiceSection />
    // <InvoiceSection1 />
    // <CustomTable currentSection="invoices" data={data} setPage={setPage}/>
  )
}

export default InvoicesPage;