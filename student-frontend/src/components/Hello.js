import { Button } from '@mui/joy';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ExploreTech from './ExploreTech.js';
import './hello.css';

function Hello() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showLoading, setShowLoading] = useState(true);

    // Background image URL
    const backgroundImageUrl = "https://www.gkseries.com/blog/wp-content/uploads/2020/03/DRK-Institute-of-Science-and-Technology-Hyderabad.jpg";

    useEffect(() => {
        // Check if user is logged in when component mounts
        const user = localStorage.getItem('user');
        if (user) {
            setIsLoggedIn(true);
            const userData = JSON.parse(user);
            setUserName(userData.name);
        }

        // Preload the background image
        const img = new Image();
        img.src = backgroundImageUrl;
        
        img.onload = () => {
            setImageLoaded(true);
            // Hide loading indicator after a short delay
            setTimeout(() => {
                setShowLoading(false);
            }, 500);
        };

        img.onerror = () => {
            // Even if image fails to load, hide the loading indicator after a timeout
            setTimeout(() => {
                setShowLoading(false);
            }, 2000);
        };

        // Check if image is already in cache
        if (img.complete) {
            setImageLoaded(true);
            setShowLoading(false);
        }

        // Check if image takes too long to load
        const timeoutId = setTimeout(() => {
            if (!imageLoaded) {
                setShowLoading(false);
            }
        }, 5000);

        return () => clearTimeout(timeoutId);
    }, [imageLoaded]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserName('');
        navigate('/login');
    };

    const handleStudentPortal = () => {
        navigate('/student');
    };

    return (
        <>
          <div className={`background-container ${imageLoaded ? 'image-loaded' : ''}`}>
              {/* Hidden image preloader */}
              <img src={backgroundImageUrl} className="image-preloader" alt="" />
              
              {/* Loading indicator */}
              {showLoading && (
                  <div className="loading-indicator">
                      Loading...
                  </div>
              )}
              
              <h1>DRK STUDENT PORTAL{isLoggedIn ? `, ${userName}` : ''}</h1>
              <div className="navbar">
                  {isLoggedIn ? (
                      <div>
                      <Button onClick={handleLogout}>
                          Logout
                      </Button>
                        <Button sx={{ marginLeft: '20px' }} onClick={handleStudentPortal}>
                        Student portal
                    </Button>
                    </div>
                  ) : (
                      <>
                          <Button>
                              <Link to="/login">Login</Link>
                          </Button>
                          <Button>
                              <Link to="/register">Register</Link>
                          </Button>
                      </>
                  )}
              </div>

                            <nav className="hero-links">
                                <a href="/student" onClick={(e) => { e.preventDefault(); navigate('/student', { state: { openNotes: true } }); }}>NOTES</a>
                                <a href="#explore">EXPLORE TECH</a>
                                <a href="#contact">CONTACT</a>
                            </nav>
          </div>

          <main className="site-sections">
            

            {/* ExploreTech section rendered from component */}
            <ExploreTech />

            <section id="contact" className="section">
              <div className="section-inner">
                <h2>CONTACT</h2>
                <p>Telephone: 08418-242500 • FAX: 08418-242589 • E-Mail: principal@drkist.edu.in</p>
              </div>
            </section>

            <footer className="site-footer">
              developed by V . VAMSI KRISHNA (23N71A0558) CSE
            </footer>
          </main>
        </>
    );
}

export default Hello;