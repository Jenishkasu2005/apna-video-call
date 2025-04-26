import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, IconButton, Divider, Button, Link } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MeetingHistory = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMeetingHistory();
    }, []);

    const fetchMeetingHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get(
                'http://localhost:8000/api/meetings/history',
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            if (response.data && response.data.history) {
                setMeetings(response.data.history);
            } else {
                setMeetings([]);
            }
        } catch (err) {
            console.error('Error fetching meeting history:', err);
            setError('Failed to load meeting history. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinMeeting = (meetingCode) => {
        navigate(`/meeting/${meetingCode}`);
    };

    const handleDeleteMeeting = async (meetingCode) => {
        try {
            await axios.delete(
                `http://localhost:8000/api/meetings/${meetingCode}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            // Remove the deleted meeting from state
            setMeetings(meetings.filter(meeting => meeting.meeting_code !== meetingCode));
        } catch (err) {
            console.error('Error deleting meeting:', err);
            alert('Failed to delete meeting. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 4, background: 'linear-gradient(to right, #3f51b5, #5c6bc0)' }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Meeting History
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'white' }}>
                    View and manage your past meetings and recordings
                </Typography>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <Typography>Loading meeting history...</Typography>
                </Box>
            ) : error ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            ) : meetings.length === 0 ? (
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        No meeting history found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Start a new meeting to see it in your history
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/dashboard')}
                    >
                        Go to Dashboard
                    </Button>
                </Paper>
            ) : (
                <Paper elevation={2} sx={{ p: 0 }}>
                    <List sx={{ width: '100%' }}>
                        {meetings.map((meeting, index) => (
                            <React.Fragment key={`fragment-${meeting.meeting_code}`}>
                                {index > 0 && <Divider />}
                                <ListItem
                                    key={`item-${meeting.meeting_code}`}
                                    secondaryAction={
                                        <IconButton 
                                            edge="end" 
                                            aria-label="delete"
                                            onClick={() => handleDeleteMeeting(meeting.meeting_code)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                    sx={{ py: 2 }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6">
                                                Meeting ID: {meeting.meeting_code}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(meeting.timestamp)}
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        mt: 1,
                                                        color: meeting.status === 'active' ? 'success.main' : 'text.secondary'
                                                    }}
                                                >
                                                    Status: {meeting.status === 'active' ? 'Active' : 'Ended'}
                                                </Typography>
                                                
                                                {/* Display video recording if available */}
                                                {meeting.videoUrl && (
                                                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                                        <VideoLibraryIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                        <Link 
                                                            href={meeting.videoUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            sx={{ textDecoration: 'none' }}
                                                        >
                                                            View Recording
                                                        </Link>
                                                    </Box>
                                                )}
                                                
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    sx={{ mt: 1 }}
                                                    onClick={() => handleJoinMeeting(meeting.meeting_code)}
                                                >
                                                    Join Again
                                                </Button>
                                            </>
                                        }
                                    />
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}
        </Container>
    );
};

export default MeetingHistory;