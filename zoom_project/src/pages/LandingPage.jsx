import React, { useContext,useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.styling.css";
import { TypeAnimation } from 'react-type-animation';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function LandingPage() {
    const { userData } = useContext(AuthContext);
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem("token");

    const handleStartMeeting = () => {
        const meetingId = Math.random().toString(36).substring(7);
        navigate(`/meeting/${meetingId}`);
    };

    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    return (
        <>
            <video autoPlay muted loop id="myVideo">
                <source src="/bg-video3.mp4" type="video/mp4" />
            </video>
            <div className="LandingContainer">
                <div className="nav" data-aos="fade-down">
                    <div className="logo">
                        <a href="/"><img src="../public/logo.png" alt="logo" /></a>
                    </div>
                    <div className="navlist">
                        {!isLoggedIn ? (
                            <>
                                <li><button onClick={() => navigate('/auth')}>Register</button></li>
                                <li><button><a href="/auth">Login</a></button></li>
                            </>
                        ) : (
                            <>
                                <li><button onClick={handleStartMeeting}>Start Meeting</button></li>
                                <li><button onClick={() => navigate('/dashboard')}>Dashboard</button></li>
                                <li><button onClick={() => {
                                    localStorage.removeItem("token");
                                    window.location.reload();
                                }}>Logout</button></li>
                            </>
                        )}
                    </div>
                </div>

                <div className="landingmaincontain">
                    <div className="landingmain1" data-aos="fade-left">
                        <div className="description">
                            <div className="typing-container">
                                <TypeAnimation
                                    sequence={[
                                        'Bringing People Together When We\'re Family',
                                        1000,
                                        'Bringing People Together When We\'re Friends',
                                        1000,
                                        'Bringing People Together When We\'re Colleagues',
                                        1000,
                                        'Bringing People Together When We\'re Team',
                                        1000,
                                        'Bringing People Together When We\'re Partners',
                                        1000,
                                        'Bringing People Together When We\'re Connected',
                                        1000,
                                    ]}
                                    wrapper="span"
                                    speed={50}
                                    className="typed-text"
                                    repeat={Infinity}
                                />
                            </div>
                            <h1>
                                Connect With Your Loved Ones
                            </h1>
                            <p>
                                cover a distance by apna video call
                            </p>
                            <div>
                                {!isLoggedIn ? (
                                    <button><a href="/auth">Get Started</a></button>
                                ) : (
                                    <button><a href="/dashbord">Starting Meeting</a></button>
                                )}
                            </div>
                        </div>
                        {/* <div className="mobilegroups">
                            <img src="../public/mobile.png" alt="moblepng" />
                        </div> */}
                    </div>
                    <div className="landingmain2">
                        <div className="cards">
                            <div className="card" data-aos="fade-up">
                                <div className="cardimg ">
                                    <img src="./img-card-1.jpg" alt="card1" />
                                </div>
                                <div className="carddesc">
                                    <h1>
                                        Secure Video calling
                                    </h1>
                                    <p>Secure video calling ensures your conversations are private and protected through advanced encryption techniques. With end-to-end encryption, only you and your conversation partner can access the content, preventing unauthorized access from third parties, including hackers or service providers. This means that whether you're discussing sensitive business matters, catching up with loved ones, or collaborating on a project, your communication remains confidential. Secure video calling platforms are designed to keep your data safe, offering peace of mind during online meetings. By prioritizing security, these services provide a trusted and reliable environment for personal and professional interactions.</p>
                                </div>
                            </div>
                            <div className="card bottom-right bottom " data-aos="fade-up">
                                <div className="carddesc">
                                    <h1>
                                        Secure Video calling
                                    </h1>
                                    <p>Secure video calling ensures your conversations are private and protected through advanced encryption techniques. With end-to-end encryption, only you and your conversation partner can access the content, preventing unauthorized access from third parties, including hackers or service providers. This means that whether you're discussing sensitive business matters, catching up with loved ones, or collaborating on a project, your communication remains confidential. Secure video calling platforms are designed to keep your data safe, offering peace of mind during online meetings. By prioritizing security, these services provide a trusted and reliable environment for personal and professional interactions.</p>
                                </div>
                                <div className="cardimg">
                                    <img src="./img-card-2.jpg" alt="card1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}