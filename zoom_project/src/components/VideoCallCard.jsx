import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/VideoCallCard.styling.css';

const VideoCallCard = ({ title, description, imageUrl }) => {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);1

    return (
        <div className="video-call-card" data-aos="fade-right">
            <div className="card-image">
                <img src={imageUrl} alt={title} />
            </div>
            <div className="card-content">
                <h2 className="card-title">{title}</h2>
                <p className="card-description">{description}</p>
                <div className="video-call-details">
                    <p><strong>Time:</strong> 2:30 PM</p>
                    <p><strong>Duration:</strong> 45 minutes</p>
                    <p><strong>Platform:</strong> Zoom</p>
                </div>
            </div>
        </div>
    );
};

export default VideoCallCard;
