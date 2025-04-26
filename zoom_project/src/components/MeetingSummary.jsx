import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Container, 
  Divider, 
  Grid, 
  Paper, 
  TextField, 
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SummarizeIcon from '@mui/icons-material/Summarize';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { transcribeVideoWithWhisper } from '../utils/transcribeVideo';
import { summarizeTranscript, formatSummary } from '../utils/summarizeTranscript';
import { generateSummaryPDF, downloadPDF } from '../utils/generatePDF';

const MeetingSummary = ({ meetingId }) => {
  // State for file upload
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for API key
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  
  // State for processing
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // State for results
  const [transcript, setTranscript] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [formattedSummary, setFormattedSummary] = useState('');
  
  // State for notifications
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(file);
      setNotification({
        open: true,
        message: `File selected: ${file.name}`,
        severity: 'info'
      });
    }
  };
  
  // Handle transcription
  const handleTranscribe = async () => {
    if (!videoFile) {
      setNotification({
        open: true,
        message: 'Please select a video file first',
        severity: 'error'
      });
      return;
    }
    
    if (!openaiApiKey) {
      setNotification({
        open: true,
        message: 'OpenAI API key is required for transcription',
        severity: 'error'
      });
      return;
    }
    
    try {
      setIsTranscribing(true);
      
      // Convert File to Blob
      const videoBlob = new Blob([videoFile], { type: videoFile.type });
      
      // Transcribe the video
      const transcriptText = await transcribeVideoWithWhisper(videoBlob, openaiApiKey);
      setTranscript(transcriptText);
      
      setNotification({
        open: true,
        message: 'Transcription completed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Transcription error:', error);
      setNotification({
        open: true,
        message: `Transcription failed: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsTranscribing(false);
    }
  };
  
  // Handle summarization
  const handleSummarize = async () => {
    if (!transcript) {
      setNotification({
        open: true,
        message: 'Please transcribe the video first',
        severity: 'error'
      });
      return;
    }
    
    if (!openaiApiKey) {
      setNotification({
        open: true,
        message: 'OpenAI API key is required for summarization',
        severity: 'error'
      });
      return;
    }
    
    try {
      setIsSummarizing(true);
      
      // Summarize the transcript
      const summary = await summarizeTranscript(transcript, openaiApiKey);
      setSummaryData(summary);
      
      // Format the summary for display
      const formatted = formatSummary(summary);
      setFormattedSummary(formatted);
      
      setNotification({
        open: true,
        message: 'Summary generated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Summarization error:', error);
      setNotification({
        open: true,
        message: `Summarization failed: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsSummarizing(false);
    }
  };
  
  // Handle PDF generation
  const handleGeneratePDF = async () => {
    if (!summaryData) {
      setNotification({
        open: true,
        message: 'Please generate a summary first',
        severity: 'error'
      });
      return;
    }
    
    try {
      setIsGeneratingPDF(true);
      
      // Generate PDF from summary data
      const pdfBlob = await generateSummaryPDF(summaryData, meetingId);
      
      // Download the PDF
      downloadPDF(pdfBlob, `meeting-summary-${meetingId || 'untitled'}.pdf`);
      
      setNotification({
        open: true,
        message: 'PDF generated and downloaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      setNotification({
        open: true,
        message: `PDF generation failed: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4, background: 'linear-gradient(to right, #3f51b5, #5c6bc0)' }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          Meeting Summary Tool
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'white' }}>
          Transcribe, summarize, and export your meeting recordings
        </Typography>
      </Paper>
      
      {/* API Key Input */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            OpenAI API Key
          </Typography>
          <TextField
            fullWidth
            label="Enter your OpenAI API Key"
            variant="outlined"
            value={openaiApiKey}
            onChange={(e) => setOpenaiApiKey(e.target.value)}
            type="password"
            placeholder="sk-..."
            helperText="Your API key is required for transcription and summarization"
            sx={{ mb: 2 }}
          />
        </CardContent>
      </Card>
      
      {/* File Upload Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Step 1: Upload Meeting Recording
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={isUploading}
            >
              Select Video File
              <input
                type="file"
                hidden
                accept="video/*,audio/*"
                onChange={handleFileChange}
              />
            </Button>
            
            {videoFile && (
              <Typography variant="body2" sx={{ ml: 2 }}>
                {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
              </Typography>
            )}
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={isTranscribing ? <CircularProgress size={20} color="inherit" /> : null}
            onClick={handleTranscribe}
            disabled={!videoFile || isTranscribing || !openaiApiKey}
            sx={{ mr: 2 }}
          >
            {isTranscribing ? 'Transcribing...' : 'Transcribe Video'}
          </Button>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Transcription cost: ~$0.006/minute (36 paise/min) with OpenAI Whisper API
          </Typography>
        </CardContent>
      </Card>
      
      {/* Transcript Display */}
      {transcript && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transcript
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                maxHeight: '200px', 
                overflow: 'auto',
                bgcolor: '#f5f5f5'
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {transcript}
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      )}
      
      {/* Summarization Section */}
      {transcript && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Step 2: Generate AI Summary
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={isSummarizing ? <CircularProgress size={20} color="inherit" /> : <SummarizeIcon />}
              onClick={handleSummarize}
              disabled={!transcript || isSummarizing || !openaiApiKey}
              sx={{ mb: 2 }}
            >
              {isSummarizing ? 'Summarizing...' : 'Generate Summary'}
            </Button>
            
            <Typography variant="body2" color="text.secondary">
              Summarization cost: ~$0.0015 per 1,000 tokens with GPT-3.5
            </Typography>
          </CardContent>
        </Card>
      )}
      
      {/* Summary Display */}
      {formattedSummary && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Meeting Summary
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={isGeneratingPDF ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
                onClick={handleGeneratePDF}
                disabled={!summaryData || isGeneratingPDF}
              >
                {isGeneratingPDF ? 'Generating PDF...' : 'Export as PDF'}
              </Button>
            </Box>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                maxHeight: '400px', 
                overflow: 'auto',
                bgcolor: '#f5f5f5'
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {formattedSummary}
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      )}
      
      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MeetingSummary;