import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/ApiConfig';
import { useAlert } from './AlertContext';
const LeaveContext = createContext();
export const LeaveProvider = ({ children }) => {
  const token = localStorage.getItem("userToken");
  const [leaves, setLeaves] = useState([]);
  const [hrLeave, setHRLeave] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pmleaves, setPmLeaves] = useState([]);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const { showAlert } = useAlert();

  const postStatuses = async (statusData) => {
    setLoading(true);
    setError(null);
    console.log(statusData);

    try {
      console.log("this is token", token);
        const response = await fetch(`${API_URL}/api/approve-leave`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(statusData)
        });

        const contentType = response.headers.get("content-type");
            const rawResponse = await response.text(); 

            console.log("Response Status:", response.status);
            console.log("Raw Response:", rawResponse);

            if (!response.ok) {
                if (contentType && contentType.includes("application/json")) {
                    const errorData = JSON.parse(rawResponse);
                    showAlert({ variant: "error", title: "Error", message: rawResponse });
                    throw new Error(errorData.message || "Failed to post statuses");
                } else {
                    throw new Error(`Unexpected response: ${rawResponse}`);
                }
            }
            hrLeaveDetails();
            pmLeavesfnc();
      //  console.log("Statuses updated successfully");
       showAlert({ variant: "success", title: "Success", message: "Leave updated successfully" });
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
};



  const addLeave = async (leaveData) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Sending Leave Data to API:", leaveData);
      const response = await axios.post(
        `${API_URL}/api/add-leave`,
        leaveData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("API Response:", response.data);
      showAlert({ variant: "success", title: "Success", message: "Leave uploaded successfully" });
      return response.data;
    } catch (err) {
      showAlert({ variant: "error", title: "Error", message: err.response?.data || err.message });
      return null;
    } finally {
      setLoading(false);
    }
  };


  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/getleaves-byemploye`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leaves");
      }

      const result = await response.json();
    setLeaves(result.data || []); 
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const hrLeaveDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/getall-leave-forhr`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch HR leave details");
      }

      const result = await response.json();
      setHRLeave(result.data || []); 
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const pmLeavesfnc = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/showmanager-leavesfor-teamemploye`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.data.success) {
            setPmLeaves(response.data.data);
        }
    } catch (error) {
        console.error("Error fetching PM leaves:", error);
    }
};


  useEffect(() => {
    fetchLeaves();
    hrLeaveDetails();
    pmLeavesfnc();
  }, []);
  return (
    <LeaveContext.Provider value={{  postStatuses, response , pmleaves, pmLeavesfnc, leaves, addLeave, loading, error, fetchLeaves, hrLeaveDetails, hrLeave }}>
      {children}
    </LeaveContext.Provider>
  );
};
export const useLeave = () => {
  return useContext(LeaveContext);
};
