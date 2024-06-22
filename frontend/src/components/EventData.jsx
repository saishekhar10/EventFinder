import eventService from "../services/events.js";
import {useState} from "react";
import userService from "../services/users.js";


const EventData = ({ data,user }) => {

    const [interestedUsers, setInterestedUsers] = useState([]);
    const [interestedUsersVisible, setInterestedUsersVisible] = useState(false); // toggle for button
    const [likesVisible, setLikesVisible] = useState(false);
    const [likes, setLikes] = useState(null);


        // Handles upvote button: increments likes for an event and shows how many users are interested in the event
        const handleUpvote = async (e) => {
            e.preventDefault();
            try{
                await eventService.upVote(user,data);
                const likes = await eventService.getLikes(data.eventID);
                setLikesVisible(true);
                setLikes(likes);
                console.log(`${user.username} has upvoted ${data.eventID}`);
            } catch(error){
                console.log(error);
            }
        }

        //
        const showInterestedUsers = async () =>{

                let likes = await eventService.getLikes(data.eventID);
                setLikes(likes);
                console.log("button clicked");
                if(!interestedUsersVisible){
                    try {
                        const users = await userService.getInterestedUsers(data.eventID);
                        setInterestedUsers(users);
                        setInterestedUsersVisible(true);
                        console.log("button clicked 2");

                    } catch (error) {
                        console.log(error);
                    }
                }
                else{
                    setInterestedUsersVisible(false);
                }
        }

        return (
            <div className="event-container">
                <p>Event ID: {data.eventID}
                    <button className={"button-34"} onClick={handleUpvote}>upvote</button>
                    {likesVisible ? `${likes.usersCount} user(s) are interested in this event` : ''}
                </p>
                <p>Artists:</p>
                <ul>
                    {data.artists.map((artist, index) => (
                        <li key={index}>{artist}</li>
                    ))}
                </ul>

                <p>Location: {data.location}</p>
                <p>Venue: {data.venue}</p>
                <p>Date: {data.date}</p> <br/>
                <button onClick={showInterestedUsers}>
                    {interestedUsersVisible ? 'Hide interested users' : 'Show who are interested in this event'}
                </button>
                {interestedUsersVisible && likes &&  (
                    <div>
                        <p>Interested Users:</p>
                        <ul>
                            {interestedUsers.map((user, index) => (
                                <li key={index}>{user.username}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {interestedUsersVisible && !likes && (
                    <div>
                        <p> Nobody has upvoted this event</p>
                    </div>
                )}
            </div>
        );
};

export default EventData;