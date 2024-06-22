const bcrypt = require("bcrypt");
const userRouter = require("express").Router();
const User = require("../models/user");
const middleware = require("../utils/middleware");
const {response} = require("express");
const Events = require("../models/interestedEvents");

// Creates a new user
userRouter.post("/", async (request,response)=>{
    const {username, password} = request.body;

    if(!username || !password ){
        return response.status(400).json({error: "Username and password are required"});
    }

    if(username.length < 3 || password.length < 3){
        return response.status(400).json({error: "Username and password must have a minimum length of 3"});
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password,saltRounds);

    const user = new User ({
        username,
        passwordHash
    });

    const savedUser = await user.save();
    response.status(201).json(savedUser);

});

// Gets a users interested events
userRouter.get("/interested-events",middleware.tokenExtractor, middleware.userExtractor, async (req, res) => {
    try {

        const user = await User.findById(req.user._id).populate("events", "-users -_id");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const interestedEvents = user.events;
        res.json(interestedEvents);
    } catch (error) {
        console.error("Error fetching interested events:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//Toggles users privacy
userRouter.put("/togglePrivacy",middleware.tokenExtractor,middleware.userExtractor, async (request,response) =>{
    try{
        const user = request.user;
        const currentPrivacy = user.isEventsPublic;
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {isEventsPublic: !currentPrivacy},
            {new: true}
        );
        response.json(updatedUser);
    } catch (error){
        console.log(error);
    }
});

// Gets a list of interested users
userRouter.get("/:eventId/interested-users", async (req, res) => {
    try {
        const eventId = req.params.eventId;

        // Find the interested event based on the provided event ID
        const interestedEvent = await Events.findOne({ eventId: eventId });

        if (!interestedEvent) {
            return res.status(404).json({ error: "Event not found" });
        }

        const userIds = interestedEvent.users;


        // Populate the corresponding user objects with their usernames
        const users = await User.find({ _id: { $in: userIds } }).select("username isEventsPublic");
        
        console.log(users);
        // Filter the list of users based on their privacy settings
        const publicUsers = users.filter(user => user.isEventsPublic);

        res.json(publicUsers);
    } catch (error) {
        console.error("Error fetching interested users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Fetches users privacy setting
userRouter.get("/privacy", middleware.tokenExtractor, middleware.userExtractor, async (req, res) => {
    try {
        // Extract user information from the request
        const user = req.user;

        // Respond with the user's privacy setting
        res.json({ isEventsPublic: user.isEventsPublic });
    } catch (error) {
        console.error("Error fetching user privacy setting:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = userRouter;