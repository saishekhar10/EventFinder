# Project Documentation

## 1. Functionality Overview

### Front-end functionality:

- Users are first greeted with a login page where accounts can be created.
- After logging in, the user is prompted to grant location access, crucial for the application's functionality.
- An external API (EDMTrain) is used to fetch event data, including latitude and longitude information about the venues.
- Events happening within a 100-mile radius of the user are fetched using coordinates.
- Information provided includes EventID, Venue, Location (City), performing artists, and event date.
- Users can upvote an event and see the number of people who have upvoted it.
- Button to view events upvoted by the current user.
- Filters available for date, venue, and artists.
- Button to show a list of users interested in a particular event.
- Privacy toggle button allowing users to set their preference for sharing their interested events.

### Back-end functionality:

#### Controllers:
1. Event Router methods:
   - Get all events
   - Upvote an event
   - Count interested users for an event
2. User Router methods:
   - Create a user
   - Get users' interested events
   - Toggle privacy
   - Get all users interested in a particular event

#### Models:
1. Interested Events: Schema containing eventID, performers (artists), location, venue, date, and referenced users.
2. Users: Schema containing username, name, passwordHash, referenced events, and isEventsPublic (privacy toggle).

#### Middleware:
- Error handler
- Token extractor
- User extractor
- Request logger

## 2. Missing Features

- Notifications for user actions (login, create user, upvote, etc.).
- Additional styling for the website.
- Console error when clicking "Show interested events" button.
- Reset filter functionality only resets the date filter and not venue and artist filters.
- Integration with an API to fetch venue ratings.

## 3. Technologies Used

- **IDE**: Webstorm
- **Front-end**:
  - Vite + React
  - Dependencies: axios, react prop types, react-dom
  - Dev dependencies: eslint
- **Back-end**:
  - Node
  - MongoDB
  - Dependencies: bcrypt, express, jsonwebtoken, mongoose, mongoose unique validator, dotenv, cross-env, cors
  - Dev dependencies: nodemon

## 4. Installation & Setup Instructions

### Setting up the project:

1. Clone the repo and open it in your preferred IDE.
2. Navigate to the backend folder in the terminal and install dependencies using `npm i`.
3. Similarly, navigate to the frontend folder and install dependencies using `npm i`.
4. Create a free MongoDB cloud database to store user information and interested events.
5. Obtain an API key from [EDMTrain](https://edmtrain.com/developer-api) for fetching event data.
6. Create a `.env` file in the root of the backend directory and store the MongoDB URI, port, and secret key.
7. Create another `.env` file in the root of the frontend folder and store the EDMTrain API key.

### Running the project:

1. In the backend folder, run `npm run dev` to start the backend server.
2. In the frontend folder, run `npm run dev` to start the frontend.
3. Access the website via the provided localhost link.
