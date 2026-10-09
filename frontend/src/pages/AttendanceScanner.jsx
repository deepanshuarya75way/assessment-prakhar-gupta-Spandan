import  {useState} from "react";
import {Html5QrcodeScanner} from "html5-qrcode";
import {useEffect} from "react";
import api from "../api/axios";
import { DecodedTextType } from "html5-qrcode/esm/core";

export default function AttendanceScanner(){
  const [message, serMessage]=useState("");
  const [scanning, setScanning]=useState(true);
  useEffect(()=>{
    if(!scanning)return;

    const scanner=new Html5QrcodeScanner("attendance-reader",{
      fps:10,
      qrbox:{width:250,height:250},
    },
    false
  );
  let processing=false;
  scanner.render(async(decodedText)=>{
    if(processing)return;
    processing=true;
    try{
      setMessage("Processing attendance...");
      const response=await api.post("/admin/attendance/scan",{token:decodedText});

      setMessage(
        response.data.message ||"Attendance marked successfully"
      )
    }catch(error){
      setMessage(
        error.response?.data?.message || "Failed to mark attendance"
      )
    }finally{
      processing=false;
    }
  },()=>{});
  return ()=>{
    scanner.clear().catch(()=>{});
  }
  },[scanning]);

  return(
    <div className="min-h-screen bg-gray-950 p-6 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-3 text-3xl font-bold">Event Attendance Scanner</h1>
        <p className="mb-6 text-gray-300">Scan a participant's Event QR code to record attendance</p>
        {
          scanning && (
            <div id="attendance-reader" className="rounded-lg bg white p-4 text black"/>
          )
        }
        {
          message && (
            <div className="mt-4 rounded-lg bg-gray-800 p-4" role="status">{message}</div>
          )
        }
        <button onClick={()=>setScanning((value)=>!value)} className="mt-6 rounded-lg bg-blue-600px-5 py-3 font-semibold hover:bg-blue-500">
          {scanning?"Stop Scanner":"Start Scanner"}
        </button>
      </div>
    </div>
  )
}