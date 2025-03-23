import {useEffect, useState} from 'react'
import axios from "axios";
import loginService from "./services/login.js";
import eventService from "./services/events.js";
import userService from "./services/users.js"
import LoginForm from"./components/LoginForm.jsx"
import EventData from "./components/EventData.jsx";
import InterestedEvents from "./components/InterestedEvents.jsx";
import Notification from "./components/Notification.jsx";
import ErrorNotificaiton from "./components/ErrorNotificaiton.jsx";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';

const App =() => {

    const [eventData, setEventData] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [artistFilter, setArtistFilter] = useState('');
    const [venueFilter, setVenueFilter] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [privacy, setPrivacy] = useState(false);
    const [notification, setNotification] = useState('');
    const [errorNotification, setErrorNotification] = useState('');

    useEffect(() => {
        let timer;
        if (notification || errorNotification) {
            // Set a timer to clear the notification after 3 seconds
            timer = setTimeout(() => {
                setNotification('');
                setErrorNotification('');
            }, 3000);
        }
        return () => clearTimeout(timer); // Cleanup timer on component unmount or state change
    }, [notification,errorNotification]);

    // checks if user is already logged in
    useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem("loggedEventFinderAppUser");
        if(loggedUserJSON){
            const user = JSON.parse(loggedUserJSON);
            setUser(user);
            eventService.setToken(user.token);

            const getUserPrivacy = async () =>{
                const privacySetting = await userService.getUsersPrivacy(user.token);
                console.log(privacySetting);
                setPrivacy(privacySetting);
            }
            getUserPrivacy();
        }
    }, []); // Remove privacy from dependencies


    // Get coordinates of the user's location
    useEffect(() => {
        const getUserLocation = async ()=>{
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        setLatitude(position.coords.latitude);
                        setLongitude(position.coords.longitude);
                    },
                    error => {
                        console.error('Error getting user location:', error);
                    }
                );
            }
            else {
                console.log("Geolocation is not supported by your browser.");
            }
        };
        getUserLocation();
    }, []);

    // Finds events using the latitude and longitude
    useEffect(() => {
        console.log('Making API call...');
        const getData = async () => {
            if (latitude !== null && longitude !== null) {
                try {
                    const response = await axios.get(
                        `${baseUrl}events?latitude=${latitude}&longitude=${longitude}&state=California&client=${edmTrainKey}`
                    );

                    const eventData = response.data.data;
                    //finds distance within a 100-mile radius
                    const nearbyEvents = findNearbyEvents(latitude, longitude, eventData, 160).filter(event => event.artistList.length > 0).map(event => ({
                        eventID: event.id,
                        artists: event.artistList.map(artist => artist.name),
                        location: event.venue.location,
                        venue: event.venue.name,
                        date: event.date
                    }));

                    setLoading(false);
                    setEventData(nearbyEvents);
                    setFilteredData(nearbyEvents);
                    console.log(eventData);
                } catch (error) {
                    console.log(error);
                }
            } else {
                console.log("No location data yet ");
            }
        };

        getData();
    }, [latitude, longitude]);

    useEffect(() => {
        filterEvents();
    }, [selectedDate]);

    const edmTrainKey = import.meta.env.VITE_EDM_TRAIN_KEY;
    const baseUrl = "https://edmtrain.com/api/";

    //Finds distance between user and venues
    const  calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180; // Convert degrees to radians
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers
        return distance;
    };

    //finds events within 100-mile radius of user
    const findNearbyEvents = (userLatitude, userLongitude, events, radius) => {
        return events.filter(event => {
            const distance = calculateDistance(userLatitude, userLongitude, event.venue.latitude, event.venue.longitude);
            return distance <= radius;
        });
    };


    //when login button is clicked
    const handleLogin = async (event) =>{
        event.preventDefault();
        try {
            const user = await loginService.login({
                username, password
            });
            window.localStorage.setItem(
                "loggedEventFinderAppUser", JSON.stringify(user)
            );
            setPrivacy(user.isEventsPublic);
            console.log(privacy);
            eventService.setToken(user.token);
            setUser(user);
            setUsername('');
            setPassword('');
        } catch (error) {
            console.log(error);
        }
    }

    // When logout button is clicked
    const handleLogout = () => {
        window.localStorage.removeItem("loggedEventFinderAppUser");
        setUser(null);
        setPrivacy(false);
        setUsername('');
        setPassword('');
    }

    // When create user button is clicked
    const handleCreateUser = async (event) => {
        event.preventDefault();
        try{
            console.log(newUsername)
            console.log(newPassword)
             await userService.newUser({
                 username:newUsername,
                 password: newPassword
            });
            setNewUsername('');
            setNewPassword('');
            setNotification("Account created");
        } catch(error) {
            console.log(error);
            setErrorNotification("Account could not be created");
        }
    }

    const filterEvents = () => {
        // Filter by date
        let filtered = eventData;
        if (selectedDate) {
            filtered = filtered.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.toDateString() === selectedDate.toDateString();
            });
        }

        // Filter by venue
        if (venueFilter) {
            filtered = filtered.filter(event => event.venue.toLowerCase().includes(venueFilter.toLowerCase()));
        }

        // Filter by artists
        if (artistFilter) {
            filtered = filtered.filter(event => event.artists.some(artist => artist.toLowerCase().includes(artistFilter.toLowerCase())));
        }
        setFilteredData(filtered);
    };

    const resetFilter = () => {
        setSelectedDate(null);
        setArtistFilter('');
        setVenueFilter('');
        // Reset filtered data back to original event data
        setFilteredData(eventData);
    };

    // Event handler to update venue search input
    const handleVenueSearchChange = (event) => {
        setVenueFilter(event.target.value);
    };

    // Event handler to update artists search input
    const handleArtistsSearchChange = (event) => {
        setArtistFilter(event.target.value);
    };

    const handleTogglePrivacy = async (e) => {
        e.preventDefault(); // Prevent form submission
        try {
            const updatedUser = await userService.togglePrivacy(user.token);
            // Update localStorage with the new user data
            window.localStorage.setItem(
                "loggedEventFinderAppUser",
                JSON.stringify({ ...user, isEventsPublic: !privacy })
            );
            setUser({ ...user, isEventsPublic: !privacy }); // Update user state
            setPrivacy(!privacy);
        } catch (error) {
            console.error('Error toggling privacy:', error);
            setErrorNotification("Failed to update privacy settings");
        }
    };

    // Render different content based on authentication
    const loginView = () => (
        <div className="page-container">
            <Notification message={notification}/>
            <ErrorNotificaiton message={errorNotification}/>
            <div className="about-section">
                <h1>Event Finder</h1>
                <p>This is a website where you can find local concerts around your location, create an account to find events around and see what events other users are interested in! </p>
            </div>
            <LoginForm
                username={username}
                password={password}
                handleUsernameChange={({ target }) => setUsername(target.value)}
                handlePasswordChange={({ target }) => setPassword(target.value)}
                handleSubmit={handleLogin}
                newUsername={newUsername}
                newPassword={newPassword}
                handleNewUsernameChange={({ target }) => setNewUsername(target.value)}
                handleNewPasswordChange={({ target }) => setNewPassword(target.value)}
                handleCreateUser={handleCreateUser}
            />
        </div>
    );

    const eventsView = () => (
        <div className="page-container">
            {loading && (
                <p>Loading events around you...</p>
            )}

            {!loading && filteredData && (
                <div>
                    <div className="search-section">
                        <div className="filters">
                            <div className="search-input-group">
                                <label>Date</label>
                                <input 
                                    type="date" 
                                    value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''} 
                                    onChange={e => setSelectedDate(new Date(e.target.value))}
                                />
                            </div>
                            <div className="search-input-group">
                                <label>Search by Venue</label>
                                <input
                                    className="searchBox"
                                    type="text"
                                    placeholder="Enter venue name..."
                                    value={venueFilter}
                                    onChange={handleVenueSearchChange}
                                />
                            </div>
                            <div className="search-input-group">
                                <label>Search by Artist</label>
                                <input
                                    className="searchBox"
                                    type="text"
                                    placeholder="Enter artist name..."
                                    value={artistFilter}
                                    onChange={handleArtistsSearchChange}
                                />
                            </div>
                        </div>
                        <div className="filter-buttons">
                            <button onClick={filterEvents} className="button-34">Search</button>
                            <button onClick={resetFilter}>Reset Filter</button>
                        </div>
                    </div>
                    
                    <h2>Events around you</h2>
                    <div className="events-grid">
                        {filteredData.map(event => (
                            <EventData key={event.eventID} data={event} user={user}/>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const ProfileView = () => {
        const [isLoading, setIsLoading] = useState(true);
        const [profileEvents, setProfileEvents] = useState([]);
        const [error, setError] = useState(null);

        useEffect(() => {
            const loadProfileData = async () => {
                if (!user) {
                    setIsLoading(false);
                    return;
                }

                try {
                    console.log("Fetching profile events for user:", user.username);
                    const events = await userService.getEvents(user);
                    
                    // If the response is undefined or null, set empty array
                    if (!events) {
                        setProfileEvents([]);
                    } else {
                        setProfileEvents(events);
                    }
                } catch (error) {
                    console.error("Error loading profile data:", error);
                    // Don't set error state for new users with no events
                    if (error?.response?.status !== 500) {
                        setError("Failed to load interested events. Please try again later.");
                    }
                } finally {
                    setIsLoading(false);
                }
            };
            
            setIsLoading(true);
            setError(null);
            loadProfileData();
        }, [user, privacy]); // Add privacy to dependencies to reload when privacy changes

        if (isLoading) {
            return <div className="page-container">Loading profile data...</div>;
        }

        return (
            <div className="page-container">
                <div className="profile-container">
                    <div className="profile-header">
                        <h2>Profile</h2>
                        <div className="toggle-switch-container">
                            <span className="toggle-label">Event Privacy:</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={privacy}
                                    onChange={handleTogglePrivacy}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                            <span className="toggle-label">
                                {privacy ? 'Public' : 'Private'}
                            </span>
                        </div>
                    </div>
                    <div className="profile-section">
                        <h3>Your Interested Events</h3>
                        {error ? (
                            <div className="error-message">{error}</div>
                        ) : profileEvents.length === 0 ? (
                            <p>You have not marked any events as interested yet.</p>
                        ) : (
                            profileEvents.map(event => (
                                <InterestedEvents key={event.eventID} data={event}/>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const Navigation = () => {
        const location = useLocation();
        
        return (
            <nav className="navigation">
                <ul className="nav-links">
                    <li>
                        <Link 
                            to="/events" 
                            className={location.pathname === '/events' ? 'active' : ''}
                        >
                            Events
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/profile" 
                            className={location.pathname === '/profile' ? 'active' : ''}
                        >
                            Profile
                        </Link>
                    </li>
                </ul>
                <div className="user-nav-controls">
                    <span className="username-display">Welcome, {user.username}</span>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>
        );
    };

    return (
        <Router>
            <div className="app-container">
                {user && <Navigation />}
                <Routes>
                    <Route path="/" element={user ? <Navigate to="/events" /> : loginView()} />
                    <Route path="/events" element={user ? eventsView() : <Navigate to="/" />} />
                    <Route path="/profile" element={user ? <ProfileView /> : <Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App