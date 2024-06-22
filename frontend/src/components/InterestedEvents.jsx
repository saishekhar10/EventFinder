const InterestedEvents = ({data}) =>{
    return(
        <div className="event-container">
            <p>Event ID: {data.eventId}</p>
            <p>Artists:</p>
            <ul>
                {data.performers.map((artist, index) => (
                    <li key={index}>{artist}</li>
                ))}
            </ul>

            <p>Location: {data.location}</p>
            <p>Venue: {data.venue}</p>
            <p>Date: {data.date}</p>
        </div>
    )
}
export default InterestedEvents;