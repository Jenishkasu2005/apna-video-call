import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  IconButton
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LogoutIcon from '@mui/icons-material/Logout';

const Dashboard = () => {
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');

  // Generate a random meeting ID
  const handleStartMeeting = () => {
    const meetingId = Math.random().toString(36).substring(7);
    navigate(`/meeting/${meetingId}`);
  };

  // Join an existing meeting
  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      navigate(`/meeting/${meetingCode}`);
    }
  };

  // Navigate to meeting history
  const handleViewHistory = () => {
    navigate('/history');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with user info */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgb(79, 3, 112), white 180%)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: '#fff',
              color: '#3f51b5',
              mr: 2
            }}
          >
            <PersonIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              Welcome to Your Dashboard
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              {userData?.name || 'User'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleLogout}
          sx={{
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
          title="Logout"
        >
          <LogoutIcon />
        </IconButton>
      </Paper>

      {/* Main content */}
      <Grid container spacing={4}>
        {/* Start a new meeting card */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={3}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)' }
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
              <VideoCallIcon sx={{ fontSize: 60, color: '#3f51b5', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Start a New Meeting
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Create a new meeting and invite others to join using the meeting code.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleStartMeeting}
                startIcon={<VideoCallIcon />}
                sx={{
                  px: 4,
                  bgcolor: 'rgb(79, 3, 112)'
                }}
              >
                Start Meeting
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Join existing meeting card */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={3}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)' }
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
              <MeetingRoomIcon sx={{ fontSize: 60, color: '#3f51b5', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Join a Meeting
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Enter a meeting code to join an existing meeting.
              </Typography>
              <Box component="form" onSubmit={handleJoinMeeting} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Meeting Code"
                  variant="outlined"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  size="large"
                  disabled={!meetingCode.trim()}
                  startIcon={<MeetingRoomIcon />}
                  sx={{
                    px: 4,
                    bgcolor: 'rgb(79, 3, 112)',
                    color: 'white',
                  }}
                >
                  Join Meeting
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Meeting history card */}
        <Grid item xs={12}>
          <Card
            elevation={3}
            sx={{
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.01)' }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon sx={{ fontSize: 40, color: '#3f51b5', mr: 2 }} />
                <Typography variant="h5" component="h2">
                  Your Meeting History
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="body1" paragraph>
                View your past meetings and quickly rejoin recent conversations.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 3, pt: 0 }}>
              <Button
                variant="outlined"
                onClick={handleViewHistory}
                startIcon={<HistoryIcon />}
              >
                View History
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;