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
    const [interestedEvents, setInterestedEvents] = useState([]);
    const [showUsersEvents, setShowUsersEvents] = useState(false);
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
    }, [privacy]);


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

    const handleToggleEventsClick = async () =>{
        if(!showUsersEvents){
            try{
                setLoading(true);
                setShowUsersEvents(true);
                const events = await userService.getEvents(user);
                console.log(events)
                setInterestedEvents(events);
                setLoading(false);
            } catch (error){
                console.log("Error fetching interested events",error);
                setLoading(false);
            }
        } else {
            setInterestedEvents([]);
            setShowUsersEvents(false);
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

    const resetFilter = () =>{
        setSelectedDate(null);
        setArtistFilter('');
        setVenueFilter('');

    }

    // Event handler to update venue search input
    const handleVenueSearchChange = (event) => {
        setVenueFilter(event.target.value);
    };

    // Event handler to update artists search input
    const handleArtistsSearchChange = (event) => {
        setArtistFilter(event.target.value);
    };

    const handleTogglePrivacy = async () => {
        try {
            const updatedUser = await userService.togglePrivacy(user.token);
            setUser(updatedUser); // Update the user state with the updated user object
            setPrivacy(!privacy);
        } catch (error) {
            console.error('Error toggling privacy:', error);
        }
    };

    const loginForm = () =>{
        return(
            <div>
                <Notification message = {notification}/>
                <ErrorNotificaiton message={errorNotification}/>
                <div className="about-section">
                <h1> Event Finder</h1>
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
        )
    }

    const afterLogin = () =>{
        return (
            <div>
                <h1>Event Finder</h1>
                <p>{user.username} has logged in</p>
                <button onClick={handleLogout}>logout</button>
                <br/>
                <br/>
                <button
                    onClick={handleToggleEventsClick}>{showUsersEvents ? 'Show events around' : 'Show interested events'}</button>

                <button onClick={handleTogglePrivacy}>
                    {privacy ? 'Make Events Private' : 'Make Events Public'}
                </button>
                {loading &&
                    <p> {showUsersEvents ? 'Loading interested events' : 'Loading events around you...'}</p>
                }
                <br/>
                {!loading && filteredData && (
                    <>
                        {showUsersEvents ? (
                            <div>
                                <p>Your Interested Events</p>
                                {interestedEvents.map(event => (
                                    <InterestedEvents key={event.eventID} data={event}/>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <br/>
                                Date Filter: <br/>
                                <input type="date" value={selectedDate}
                                       onChange={e => setSelectedDate(new Date(e.target.value))}/>
                                <br/>
                                <div>
                                    <input className="searchBox"
                                           type="text"
                                           placeholder="Search by venue"
                                           value={venueFilter}
                                           onChange={handleVenueSearchChange}
                                    />
                                    <input className="searchBox"
                                           type="text"
                                           placeholder="Search by artist"
                                           value={artistFilter}
                                           onChange={handleArtistsSearchChange}
                                    />
                                    <button onClick={filterEvents} className="button-34">Search</button>
                                </div>
                                <br/>
                                <button onClick={resetFilter}>Reset Filter</button>
                                <p>Events around you</p>
                                {filteredData.map(event => (
                                    <EventData key={event.eventID} data={event} user={user}/>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <div>
            {user === null ? loginForm() : afterLogin()}
        </div>
    )
}

export default App