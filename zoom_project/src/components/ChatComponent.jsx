import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, TextField, Button, IconButton, Divider, List, ListItem, ListItemText, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';

const ChatComponent = ({ socketRef, username, isChatOpen, setIsChatOpen }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessageCount, setNewMessageCount] = useState(0);
    const messagesEndRef = useRef(null);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Reset new message count when chat is opened
        if (isChatOpen) {
            setNewMessageCount(0);
        }
    }, [isChatOpen]);

    useEffect(() => {
        if (socketRef && socketRef.current) {
            // Listen for incoming chat messages
            socketRef.current.on('chat-message', (data, sender, socketId) => {
                const newMessage = {
                    content: data,
                    sender: sender,
                    socketId: socketId,
                    isOwnMessage: socketRef.current.id === socketId,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                
                setMessages(prevMessages => [...prevMessages, newMessage]);
                
                // Increment new message count if chat is closed
                if (!isChatOpen) {
                    setNewMessageCount(prev => prev + 1);
                }
            });
        }

        // Cleanup listener on unmount
        return () => {
            if (socketRef && socketRef.current) {
                socketRef.current.off('chat-message');
            }
        };
    }, [socketRef, isChatOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && socketRef && socketRef.current) {
            // Send message to server
            socketRef.current.emit('chat-message', message, username);
            setMessage('');
        }
    };

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
        if (!isChatOpen) {
            setNewMessageCount(0);
        }
    };

    return (
        <>
            {/* Chat toggle button */}
            <IconButton 
                onClick={toggleChat}
                sx={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    width:'50px',
                    height:'50px',
                    borderRadius: '50%',    
                    
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    },
                    zIndex: 1000
                }}
            >
                <ChatIcon style={{filter: 'invert(100%)'}}/>
                {newMessageCount > 0 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'red',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '12px',
                        }}
                    >
                        {newMessageCount}
                    </Box>
                )}
            </IconButton>

            {/* Chat panel */}
            {isChatOpen && (
                <Paper
                    elevation={3}
                    sx={{
                        position: 'fixed',
                        right: '20px',
                        bottom: '80px',
                        width: '300px',
                        height: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 1000,
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}
                >
                    {/* Chat header */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 15px',
                            backgroundColor: '#3f51b5',
                            color: 'white'
                        }}
                    >
                        <Typography variant="h6">Meeting Chat</Typography>
                        <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Divider />

                    {/* Messages area */}
                    <List
                        sx={{
                            flex: 1,
                            overflow: 'auto',
                            padding: '10px',
                            backgroundColor: '#f5f5f5'
                        }}
                    >
                        {messages.length === 0 ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    color: 'text.secondary'
                                }}
                            >
                                <Typography variant="body2">No messages yet</Typography>
                            </Box>
                        ) : (
                            messages.map((msg, index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        textAlign: msg.isOwnMessage ? 'right' : 'left',
                                        padding: '2px 0'
                                    }}
                                    alignItems="flex-start"
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: msg.isOwnMessage ? 'row-reverse' : 'row',
                                            alignItems: 'flex-start',
                                            width: '100%'
                                        }}
                                    >
                                        {!msg.isOwnMessage && (
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    mr: 1,
                                                    bgcolor: msg.isOwnMessage ? '#3f51b5' : '#f50057',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {msg.sender.charAt(0).toUpperCase()}
                                            </Avatar>
                                        )}
                                        <Box
                                            sx={{
                                                maxWidth: '80%',
                                                ml: msg.isOwnMessage ? 0 : 1,
                                                mr: msg.isOwnMessage ? 1 : 0
                                            }}
                                        >
                                            {!msg.isOwnMessage && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{ fontWeight: 'bold', display: 'block' }}
                                                >
                                                    {msg.sender}
                                                </Typography>
                                            )}
                                            <Paper
                                                elevation={1}
                                                sx={{
                                                    padding: '8px 12px',
                                                    backgroundColor: msg.isOwnMessage ? '#e3f2fd' : 'white',
                                                    borderRadius: '12px',
                                                    display: 'inline-block',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                <Typography variant="body2">{msg.content}</Typography>
                                            </Paper>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'block',
                                                    mt: 0.5,
                                                    color: 'text.secondary',
                                                    fontSize: '10px'
                                                }}
                                            >
                                                {msg.timestamp}
                                            </Typography>
                                        </Box>
                                        {msg.isOwnMessage && (
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    ml: 1,
                                                    bgcolor: '#3f51b5',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {msg.sender.charAt(0).toUpperCase()}
                                            </Avatar>
                                        )}
                                    </Box>
                                </ListItem>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </List>

                    {/* Message input */}
                    <Box
                        component="form"
                        onSubmit={handleSendMessage}
                        sx={{
                            display: 'flex',
                            padding: '10px',
                            backgroundColor: 'white',
                            borderTop: '1px solid #e0e0e0'
                        }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Type a message..."
                            variant="outlined"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            sx={{ mr: 1 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<SendIcon />}
                            type="submit"
                            disabled={!message.trim()}
                        >
                            Send
                        </Button>
                    </Box>
                </Paper>
            )}
        </>
    );
};

export default ChatComponent;