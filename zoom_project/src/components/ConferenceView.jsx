import React, { useState, useContext, useRef } from 'react';
import styles from '../styles/videoComponent.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { AuthContext } from '../contexts/AuthContext';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { uploadVideoToStorage } from '../utils/uploadVideo';

// Update the component props to include socketRef
export function ConferenceView({ videos, isCreator, socketRef }) {
    const { meetingId } = useParams();
    const { userData } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [recordedVideoBlob, setRecordedVideoBlob] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadUrl, setUploadUrl] = useState('');
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    // Add toggle functions
    const toggleAudio = () => {
        if (window.localStream) {
            const audioTrack = window.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (window.localStream) {
            const videoTrack = window.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                window.localStream = screenStream;
                setIsScreenSharing(true);
            } else {
                if (window.localStream) {
                    window.localStream.getTracks().forEach(track => track.stop());
                }
                setIsScreenSharing(false);
            }
        } catch (error) {
            console.error('Error sharing screen:', error);
            setIsScreenSharing(false);
        }
    };
    
    // Video recording functions
    const startRecording = () => {
        if (!window.localStream) {
            alert("No video stream available to record");
            return;
        }
        
        try {
            // Create a new MediaRecorder instance
            const mediaRecorder = new MediaRecorder(window.localStream, {
                mimeType: 'video/webm;codecs=vp9'
            });
            
            // Clear previous recorded chunks
            recordedChunksRef.current = [];
            
            // Handle data available event
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };
            
            // Start recording
            mediaRecorder.start(1000); // Collect data every second
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            
        } catch (error) {
            console.error('Error starting recording:', error);
            alert(`Failed to start recording: ${error.message}`);
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            // Store a reference to the current mediaRecorder
            const currentMediaRecorder = mediaRecorderRef.current;
            
            // Update the onstop handler to show the upload dialog
            currentMediaRecorder.onstop = () => {
                // Create a blob from the recorded chunks
                const blob = new Blob(recordedChunksRef.current, {
                    type: 'video/webm'
                });
                
                // Store the blob for potential upload
                setRecordedVideoBlob(blob);
                
                // Show the upload dialog
                setShowUploadDialog(true);
                
                setIsRecording(false);
            };
            
            // Stop the recording
            currentMediaRecorder.stop();
        }
    };
    
    // Function to handle video download
    const handleDownload = () => {
        if (!recordedVideoBlob) return;
        
        // Create a download link
        const url = URL.createObjectURL(recordedVideoBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `meeting-recording-${meetingId}-${new Date().toISOString()}.webm`;
        
        // Append to body, trigger download, and clean up
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
        
        // Close the dialog
        setShowUploadDialog(false);
    };
    
    // Function to handle video upload to Firebase Storage
    const handleUpload = async () => {
        if (!recordedVideoBlob) return;
        
        try {
            setIsUploading(true);
            
            // Generate a unique filename
            const fileName = `meeting-recording-${meetingId}-${new Date().toISOString()}.webm`;
            
            // Upload the video to Firebase Storage
            const downloadURL = await uploadVideoToStorage(
                recordedVideoBlob,
                meetingId,
                fileName
            );
            
            // Update state with success and URL
            setUploadSuccess(true);
            setUploadUrl(downloadURL);
            
            // Show success message
            console.log('Video uploaded successfully:', downloadURL);
            
        } catch (error) {
            console.error('Error uploading video:', error);
            alert(`Failed to upload video: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };
    
    // Function to close the dialog
    const handleCloseDialog = () => {
        setShowUploadDialog(false);
        setUploadSuccess(false);
        setUploadUrl('');
    };
    
    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    // Use isCreator prop to determine if the current user is the meeting owner
    
    // Add endMeeting function
    // Update the endMeeting function to use the passed socketRef
    const endMeeting = async () => {
        if (!isCreator) {
            alert("Only the meeting creator can end the meeting");
            return;
        }

        try {
            if (socketRef && socketRef.current) {
                socketRef.current.emit('end-meeting', window.location.href);
                console.log("End meeting event emitted");
                
                // Navigate back to dashboard after ending the meeting
                navigate('/dashboard');
            } else {
                console.error("Socket reference not available");
            }
        } catch (error) {
            console.error("Error ending meeting:", error);
        }
    };

    // In the return statement, update the end meeting button to use isCreator instead of isMeetingOwner
    // Replace this line:
    // {isMeetingOwner && (
    // With:
    // {isCreator && (
    return (
        <div>
            {/* Upload Dialog */}
            <Dialog
                open={showUploadDialog}
                onClose={handleCloseDialog}
                aria-labelledby="upload-dialog-title"
                aria-describedby="upload-dialog-description"
            >
                <DialogTitle id="upload-dialog-title">
                    {uploadSuccess ? "Upload Successful" : "Save Recording"}
                </DialogTitle>
                <DialogContent>
                    {isUploading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                            <CircularProgress />
                            <DialogContentText style={{ marginTop: '20px' }}>
                                Uploading your recording to cloud storage...
                            </DialogContentText>
                        </div>
                    ) : uploadSuccess ? (
                        <DialogContentText>
                            Your video has been successfully uploaded to cloud storage.
                            <div style={{ marginTop: '10px' }}>
                                <a href={uploadUrl} target="_blank" rel="noopener noreferrer">
                                    View your recording
                                </a>
                            </div>
                        </DialogContentText>
                    ) : (
                        <DialogContentText id="upload-dialog-description">
                            Your recording is ready. Would you like to download it to your device or upload it to cloud storage?
                        </DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    {!isUploading && !uploadSuccess && (
                        <>
                            <Button onClick={handleDownload} color="primary">
                                Download
                            </Button>
                            <Button 
                                onClick={handleUpload} 
                                color="primary" 
                                startIcon={<CloudUploadIcon />}
                            >
                                Upload to Cloud
                            </Button>
                        </>
                    )}
                    {(isUploading || uploadSuccess) && (
                        <Button onClick={handleCloseDialog} color="primary">
                            Close
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
            
            {/* Video Controls */}
            <div className={styles.videoControls} style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '10px 20px',
                borderRadius: '50px',
                zIndex: 1000
            }}>
                <Tooltip title={isAudioMuted ? "Unmute" : "Mute"}>
                    <IconButton 
                        onClick={toggleAudio} 
                        style={{ 
                            color: isAudioMuted ? 'red' : 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            margin: '0 5px'
                        }}
                    >
                        {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
                    </IconButton>
                </Tooltip>
                
                <Tooltip title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}>
                    <IconButton 
                        onClick={toggleVideo} 
                        style={{ 
                            color: isVideoOff ? 'red' : 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            margin: '0 5px'
                        }}
                    >
                        {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
                    </IconButton>
                </Tooltip>
                
                <Tooltip title={isScreenSharing ? "Stop Sharing" : "Share Screen"}>
                    <IconButton 
                        onClick={toggleScreenShare} 
                        style={{ 
                            color: isScreenSharing ? 'red' : 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            margin: '0 5px'
                        }}
                    >
                        {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                    </IconButton>
                </Tooltip>
                
                <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"}>
                    <IconButton 
                        onClick={toggleRecording} 
                        style={{ 
                            color: isRecording ? 'red' : 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            margin: '0 5px'
                        }}
                    >
                        {isRecording ? <StopIcon /> : <FiberManualRecordIcon />}
                    </IconButton>
                </Tooltip>
                
                {isCreator && (
                    <Tooltip title="End Meeting for All">
                        <IconButton 
                            onClick={endMeeting} 
                            style={{ 
                                color: 'red',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                margin: '0 5px'
                            }}
                        >
                            <CallEndIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </div>
            
            {videos.map((video, index) => (
                <div
                    key={`${video.socketId}-${index}`}
                    style={{
                        margin: '10px',
                        position: 'relative'
                    }}
                >
                    <video
                        data-socket={video.socketId}
                        ref={(ref) => {
                            if (ref && video.stream) {
                                ref.srcObject = video.stream;
                            }
                        }}
                        autoPlay
                        style={{
                            width: '300px',
                            height: '250px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #4caf50',
                            backgroundColor: 'black',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                        }}
                    />
                    <h3
                        style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '10px',
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            margin: '0',
                            fontSize: '14px'
                        }}
                    >
                        {video.socketId}
                    </h3>
                </div>
            ))}
        </div>
    );
}

export default ConferenceView;