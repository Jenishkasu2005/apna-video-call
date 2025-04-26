import { React, useEffect, useRef, useState, useContext } from "react";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';  
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import { io } from "socket.io-client";
import styles from '../styles/videoComponent.module.css';
import {ConferenceView} from '../components/ConferenceView.jsx';
import ChatComponent from '../components/ChatComponent.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';



const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
    "iceServer": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export function VideoMeetComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();
    const navigate = useNavigate(); // Move useNavigate inside component
    const { meetingId } = useParams(); // Extract meetingId from URL params
    const { addToUserHistory } = useContext(AuthContext); // Access AuthContext
    
    let [videoAvailable, setvideoAvailable] = useState(true);

    let [audioAvailable, setaudioAvailabel] = useState(true);
    let [video, setvideo] = useState();

    let [audio, setaudio] = useState();

    let [screen, setscreen] = useState();

    let [showModal, setModal] = useState();

    let [screenAvailable, setscreenAvailable] = useState();

    let [messages, setmessages] = useState([]);

    let [message, setmessage] = useState();

    let [newmessage, setnewmessage] = useState(0);

    let [askForUsername, setaskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    // State for chat visibility
    let [isChatOpen, setIsChatOpen] = useState(false);

    const videoRef = useRef([]);

    let [videos, setvideos] = useState([]);

    // console.log(styles);


    const getpermission = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setvideoAvailable(true);
            } else {
                setvideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setaudioAvailabel(true);
            } else {
                setaudioAvailabel(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setscreenAvailable(true);
            } else {
                setscreenAvailable(false);
            }

            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .catch(err => console.error("Permission denied or other error:", err));

            if (videoAvailable || audioAvailable) {
                // console.log("Requesting permissions...");
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    // console.log("Permissions granted, stream received:", userMediaStream);
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                        // localVideoRef.current.load(); // Force reload
                    }
                } else {
                    console.error("Stream not available.");
                }
            }
        } catch (err) {
            console.log(err);
        }
    };


    useEffect(() => {
        if (localVideoRef.current) {
            getpermission();
        }
    }, []);


    let getusermediaSucess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setvideo(false);
            setaudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }


    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getusermediaSucess)//TODO:getusermediaSucess
                .then((stream) => { })
                .catch((e) => console.log(e))
        }
        else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }



    useEffect(() => {
        if (video === undefined && audio === undefined) {
            getUserMedia();
        }
    }, [audio, video])


    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    // Add isCreator state
    let [isCreator, setIsCreator] = useState(false);

    // Add useEffect to save meeting to history only once when component mounts
    useEffect(() => {
        // Only save to history if user is authenticated (has a token) and this is a new session
        const token = localStorage.getItem("token");
        const hasAddedToHistory = sessionStorage.getItem(`meeting_${meetingId}_added`);
        
        if (token && meetingId && !hasAddedToHistory) {
            // Add meeting to user's history
            addToUserHistory(meetingId)
                .then(response => {
                    console.log("Meeting added to history:", response);
                    // Mark this meeting as added to history for this session
                    sessionStorage.setItem(`meeting_${meetingId}_added`, 'true');
                })
                .catch(error => {
                    console.error("Error adding meeting to history:", error);
                });
        }
    }, [meetingId, addToUserHistory]);

    // Modify connectToSocketServer function
    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })
    
        socketRef.current.on('signal', gotMessageFromServer)
    
        socketRef.current.on('connect', () => {
            // Get the current URL and check if it's a new meeting
            const isNewMeeting = !window.location.href.includes('join');
            setIsCreator(isNewMeeting);
            
            socketRef.current.emit('join-call', window.location.href, isNewMeeting)
            socketIdRef.current = socketRef.current.id

            console.log("socket Id:", socketRef.current.id);

            // Add meeting-ended handler
            socketRef.current.on("meeting-ended", (meetingId) => {
                console.log("Meeting ended by host");
                alert("This meeting has been ended by the host");
                
                // Clean up connections
                for (let id in connections) {
                    if (connections[id] && connections[id].close) {
                        connections[id].close();
                        delete connections[id];
                    }
                }
                
                // Stop local stream
                if (window.localStream) {
                    window.localStream.getTracks().forEach(track => track.stop());
                }
                
                // Navigate to home page
                navigate('/');
            });

            // Existing event handlers
            socketRef.current.on('user-left', (id) => {
                setvideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].ontrack = (event) => {
                        setvideos((prevVideos) => {
                            // Check if a video with the same socketId already exists
                            const videoExists = prevVideos.some((video) => video.socketId === socketListId);
                            if (!videoExists) {
                                return [...prevVideos, { socketId: socketListId, stream: event.streams[0] }];
                            }
                            return prevVideos; // No update needed if the video already exists
                        });
                    };




                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }


    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }



    let getMedia = () => {
        setvideo(videoAvailable);
        setaudio(audioAvailable);
        connectToSocketServer();
    }

    let connect = () => {
        setaskForUsername(false);
        getMedia();
    }

    useEffect(() => {
        // console.log("Videos array:", videos);
    }, [videos]);

    // console.log("askForUsername:", askForUsername);

    // console.log("CSS Module Styles:", styles);
    // console.log("meetUserVideo class:", styles.meetUserVideo);
    try {
        return (
            <div className="Videomeetbody" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
                {askForUsername === true
                    ?
                    <div className="usertrue" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '40px',
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                        width: '400px',
                        maxWidth: '90%'
                    }}>
                        <h2 style={{
                            color: '#3f51b5',
                            marginBottom: '24px',
                            fontSize: '28px',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                        }}>Enter the Lobby</h2>
                        <TextField
                            id="outlined-basic"
                            label="Username"
                            variant="outlined"
                            value={username}
                            onChange={e => { setUsername(e.target.value) }}
                            autoFocus
                            fullWidth
                            style={{ marginBottom: '20px' }}
                        />
                        <Button
                            variant="contained"
                            onClick={connect}
                            style={{
                                marginBottom: '24px',
                                padding: '10px 30px',
                                fontSize: '16px',
                                backgroundColor: '#3f51b5'
                            }}
                        >
                            Connect
                        </Button>

                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            style={{
                                width: '100%',
                                height: '240px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                backgroundColor: 'black',
                                border: '2px solid #3f51b5'
                            }}
                        ></video>
                    </div>
                    :
                    <>
                        <div className={styles.meetVideoContainer}>
                            {/* Meeting ID Label */}
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                backgroundColor: 'rgba(63, 81, 181, 0.8)',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                zIndex: 1000,
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span>Meeting ID: {meetingId}</span>
                            </div>
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                className={styles.meetUserVideo}
                                style={{
                                    border: '2px solid #3f51b5',
                                    borderRadius: '8px',
                                    width: '300px',
                                    height: '250px',
                                    objectFit: 'cover',
                                    backgroundColor: 'black',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                    margin: '10px'
                                }}
                                onLoadedData={() => console.log("Video loaded and ready.")}
                                onError={(e) => console.error("Video load error:", e)}
                            />
                            <ConferenceView videos={videos} isCreator={isCreator} socketRef={socketRef} />
                            {/* Chat Component */}
                            <ChatComponent 
                                socketRef={socketRef} 
                                username={username} 
                                isChatOpen={isChatOpen} 
                                setIsChatOpen={setIsChatOpen} 
                            />
                        </div>
                    </>
                }
            </div>
        )
    }
    catch (e) {
        console.log(`error in the video block ${e}`)
    }
}