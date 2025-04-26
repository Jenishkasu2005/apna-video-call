// Utility function for uploading videos to Firebase Storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import axios from 'axios';

/**
 * Uploads a video blob to Firebase Storage and saves the URL to the backend
 * @param {Blob} videoBlob - The video blob to upload
 * @param {string} meetingId - The ID of the meeting
 * @param {string} fileName - The name of the file
 * @returns {Promise<string>} - The download URL of the uploaded video
 */
export const uploadVideoToStorage = async (videoBlob, meetingId, fileName) => {
  try {
    // Create a reference to the file location in Firebase Storage
    const videoRef = ref(storage, `videos/${meetingId}/${fileName}`);
    
    // Upload the blob to Firebase Storage
    const uploadResult = await uploadBytes(videoRef, videoBlob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    // Save the video URL to the backend (optional)
    await saveVideoUrlToBackend(meetingId, downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

/**
 * Saves the video URL to the backend
 * @param {string} meetingId - The ID of the meeting
 * @param {string} videoUrl - The URL of the uploaded video
 * @returns {Promise<void>}
 */
const saveVideoUrlToBackend = async (meetingId, videoUrl) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('User not authenticated, skipping backend save');
      return;
    }
    
    // Make API call to backend to save video URL
    await axios.post(
      '/api/meetings/video',
      { meetingId, videoUrl },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Video URL saved to backend successfully');
  } catch (error) {
    console.error('Error saving video URL to backend:', error);
    // Don't throw error here to prevent blocking the main upload flow
  }
};