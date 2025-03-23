import eventService from "../services/events.js";
import {useState} from "react";
import userService from "../services/users.js";

const EventData = ({ data, user }) => {
    const [interestedUsers, setInterestedUsers] = useState([]);
    const [interestedUsersVisible, setInterestedUsersVisible] = useState(false);
    const [likes, setLikes] = useState(null);
    const [likesVisible, setLikesVisible] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    const handleUpvote = async () => {
        try {
            await eventService.upVote(user, data);
            let likes = await eventService.getLikes(data.eventID);
            setLikes(likes);
            setLikesVisible(true);
            setIsLiked(!isLiked);
            console.log(`${user.username} has upvoted ${data.eventID}`);
        } catch (error) {
            console.log(error);
        }
    };

    const showInterestedUsers = async () => {
        if (!interestedUsersVisible) {
            try {
                const users = await userService.getInterestedUsers(data.eventID);
                setInterestedUsers(users);
                setInterestedUsersVisible(true);
                console.log("button clicked 2");
            } catch (error) {
                console.log(error);
            }
        } else {
            setInterestedUsersVisible(false);
        }
    };

    return (
        <div className="event-container">
            <div className="event-header">
                <p>
                    <strong>Event ID:</strong>
                    <span>{data.eventID}</span>
                </p>
                <button className={`heart-button ${isLiked ? 'active' : ''}`} onClick={handleUpvote}>
                    <span className={`heart-icon ${isLiked ? 'active' : ''}`}>♥</span>
                </button>
            </div>
            {likesVisible && (
                <p className="likes-count">{likes.usersCount} user(s) are interested in this event</p>
            )}
            <p><strong>Artists:</strong></p>
            <ul>
                {data.artists.map((artist, index) => (
                    <li key={index}>{artist}</li>
                ))}
            </ul>
            <p className="location-info">
                <strong>Location:</strong>
                <span>{data.location}</span>
            </p>
            <p className="venue-info">
                <strong>Venue:</strong>
                <span>{data.venue}</span>
            </p>
            <p>Date: {data.date}</p>
            <button onClick={showInterestedUsers}>
                {interestedUsersVisible ? 'Hide interested users' : 'Show who are interested in this event'}
            </button>
            {interestedUsersVisible && (
                <div>
                    <p>Interested Users:</p>
                    {interestedUsers && interestedUsers.length > 0 ? (
                        <ul>
                            {interestedUsers.map((user, index) => (
                                <li key={index}>{user.username}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No users have shown interest in this event yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventData;