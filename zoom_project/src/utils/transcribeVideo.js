// Utility function for transcribing videos using OpenAI Whisper API
import axios from 'axios';

/**
 * Transcribes a video blob using OpenAI's Whisper API
 * @param {Blob} videoBlob - The video blob to transcribe
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string>} - The transcribed text
 */
export const transcribeVideoWithWhisper = async (videoBlob, apiKey) => {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API key is required for transcription');
    }

    // Convert blob to File object with .mp3 extension (Whisper works well with audio)
    const audioFile = new File([videoBlob], 'meeting_audio.mp3', { type: 'audio/mp3' });
    
    // Create FormData for the API request
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    
    // Make API call to OpenAI Whisper
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    // Return the transcribed text
    return response.data.text;
  } catch (error) {
    console.error('Error transcribing video:', error);
    throw error;
  }
};

/**
 * Alternative implementation using local Whisper model (if available)
 * This is a placeholder for future implementation
 * @param {Blob} videoBlob - The video blob to transcribe
 * @returns {Promise<string>} - The transcribed text
 */
export const transcribeVideoLocally = async (videoBlob) => {
  // This is a placeholder for local Whisper implementation
  // Would require setting up a local server with Whisper installed
  throw new Error('Local transcription not implemented yet');
};

/**
 * Extracts audio from video blob
 * This is useful if you want to reduce the file size before sending to API
 * @param {Blob} videoBlob - The video blob to extract audio from
 * @returns {Promise<Blob>} - Audio blob
 */
export const extractAudioFromVideo = async (videoBlob) => {
  return new Promise((resolve, reject) => {
    try {
      // Create video element to load the blob
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoBlob);
      
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();
      const source = audioContext.createMediaElementSource(video);
      source.connect(destination);
      
      // Create MediaRecorder to capture the audio
      const mediaRecorder = new MediaRecorder(destination.stream);
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        resolve(audioBlob);
      };
      
      // Start playing video and recording audio
      video.oncanplay = () => {
        video.play();
        mediaRecorder.start();
        
        // Stop recording when video ends
        video.onended = () => {
          mediaRecorder.stop();
          video.remove();
          URL.revokeObjectURL(video.src);
        };
        
        // Manually trigger end if video is too long
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            video.pause();
            mediaRecorder.stop();
            video.remove();
            URL.revokeObjectURL(video.src);
          }
        }, 60000); // 1 minute timeout
      };
      
    } catch (error) {
      console.error('Error extracting audio:', error);
      reject(error);
    }
  });
};