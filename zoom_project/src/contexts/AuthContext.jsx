import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";


export const AuthContext = createContext({});

const API_URL = "http://localhost:8000"; // Add this line to define API_URL

const client = axios.create({
    baseURL: `${API_URL}/api/v1/users` // Update to use API_URL
})


export const AuthProvider = ({ children }) => {

    const authContext = useContext(AuthContext);


    const [userData, setUserData] = useState(authContext);


    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            })

            console.log(name,username,password);
            


            if (request.status === httpStatus.CREATED) {
                return request.data.message;
            }
        } catch (err) {
            throw err;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });

            console.log(username, password);
            console.log(request.data);

            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
                router("/")
            }
        } catch (err) {
            throw err;
        }
    }

    const getHistoryOfUser = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/meetings/history`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching user history:", error);
            return { history: [] };
        }
    };

    const addToUserHistory = async (meetingCode) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                return null;
            }
            
            // Use the meetings API endpoint instead of the users endpoint
            const response = await axios.post(`${API_URL}/api/meetings/add`, {
                meeting_code: meetingCode
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            console.log("Meeting added to history:", response.data);
            return response.data;
        } catch (e) {
            console.error("Error adding meeting to history:", e);
            throw e;
        }
    };
    
    const deleteMeeting = async (meetingId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                return null;
            }
            
            const response = await axios.delete(`${API_URL}/api/meetings/${meetingId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            console.log("Meeting deleted from history:", response.data);
            return response.data;
        } catch (e) {
            console.error("Error deleting meeting from history:", e);
            throw e;
        }
    }


    const data = {
        userData, setUserData, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin, deleteMeeting
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )

}