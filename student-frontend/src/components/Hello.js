import { Button } from '@mui/joy';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './hello.css';

function Hello() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Check if user is logged in when component mounts
        const user = localStorage.getItem('user');
        if (user) {
            setIsLoggedIn(true);
            const userData = JSON.parse(user);
            setUserName(userData.name);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserName('');
        navigate('/login');
    };

    return (
        <div className="background-container">
            <h1>Hello{isLoggedIn ? `, ${userName}` : ''}</h1>
            <div className="navbar">
                {isLoggedIn ? (
                    <Button onClick={handleLogout}>
                        Logout
                    </Button>
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
        </div>
    );
}

export default Hello;
