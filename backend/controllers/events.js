const eventRouter = require("express").Router();
const Events = require("../models/interestedEvents");
const middleware = require("../utils/middleware");

eventRouter.get("/", async (request, response)=>{
    const events = await Events
        .find({})
        .populate({path:"users",
            select: "-events"
        });
    response.json(events);
});

eventRouter.post("/",middleware.tokenExtractor,middleware.userExtractor, async (request,response) =>{
    const body = request.body;
    console.log(request.user);
    const user = request.user;

    if(!body.event.eventID){
        response.status(400).end();
    }


    let existingEvent = await Events.findOne({eventId: body.event.eventID});

    if(existingEvent){
        if (!existingEvent.users.includes(user._id)) {
            existingEvent.users.push(user._id);
            await existingEvent.save();
            user.events = user.events.concat(existingEvent._id);
            await user.save();
            return response.status(200).json(existingEvent);
        } else {
            // User is already in the users array
            return response.status(400).json({ error: "User already up-voted this event." });
        }
    }

    else {
        try {

            const event = new Events({
                eventId: body.event.eventID,
                performers: body.event.artists,
                location: body.event.location,
                venue: body.event.venue,
                date: body.event.date,
                users: user._id
            });

            console.log(event);

            const savedEvent = await event.save();
            // Update the 'events' array in the user document
            user.events = user.events.concat(savedEvent._id);
            await user.save();
            response.status(201).json(savedEvent);
        } catch (error) {
            console.error("Error creating event:", error);
            response.status(500).json({ error: "Internal server error" });
        }
    }
});

eventRouter.get("/interested-events/users-count", async (req,res)=>{
    const eventID = req.query.eventID;
    console.log(eventID);
    try{
        const event = await Events.findOne({eventId: eventID });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        const usersCount = event.users.length;
        res.json({ usersCount });
    } catch(error) {
        console.log("Error fetching user count",error);
    }
});


module.exports = eventRouter;