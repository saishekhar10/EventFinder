const mongoose = require("mongoose");

const interestedEventsSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true,
        unique: true
    },
    performers:[{
        type: String
    }],
    location: {
        type: String
    },
    venue: {
        type: String
    },
    date: {
        type: Date
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
});

interestedEventsSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        if (document._id) {
            returnedObject.id = document._id.toString();
            delete returnedObject._id;
        }
        delete returnedObject.__v;
    }
});

const InterestedEvent = mongoose.model("InterestedEvents", interestedEventsSchema);

module.exports = InterestedEvent;
