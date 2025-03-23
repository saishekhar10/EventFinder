import axios from "axios";
const baseUrl = "/api/users";

const newUser = async credentials =>{
    const response = await axios.post(baseUrl,credentials);
    return response.data;
}


const getEvents = async (user) =>{
    try{
        const response = await axios.get(`${baseUrl}/interested-events`,{
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        });
        return response.data;
    } catch(error) {
        console.error("Error fetching interested events:", error);
        throw error; // Propagate the error so we can handle it in the component
    }
}
const togglePrivacy = async (token) => {
    try {
        const response = await axios.put(`${baseUrl}/togglePrivacy`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(response.data);
        return response.data;// Return the updated user object
    } catch (error) {
        throw new Error('Error toggling privacy:', error);
    }
};

const getUsersPrivacy = async (token) => {
    try{
        const response = await axios.get(`${baseUrl}/privacy`,{
            headers: { Authorization: `Bearer ${token}` }
        });
        const { isEventsPublic } = response.data;

        return isEventsPublic;
    } catch (error) {
        console.error('Error fetching user privacy setting:', error);
        throw new Error('Failed to fetch user privacy setting');
    }
}

const getInterestedUsers = async (eventID) =>{
    try{
        const response = await axios.get(`${baseUrl}/${eventID}/interested-users`);
        return response.data;
    } catch(error){
        console.error("Error fetching interested users",error);
    }
}

export default  {newUser,getEvents,togglePrivacy,getUsersPrivacy,getInterestedUsers};