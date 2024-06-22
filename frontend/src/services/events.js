import axios from "axios";
const baseurl = "/api/events";

let token = null;

const setToken = newToken =>{
    token = `Bearer ${newToken}`;
};

const upVote = async (user,event) =>{
    try{
        const response = await axios.post(baseurl,{event}, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
    });
        return response.data;
    } catch(error) {
        console.error("Error up-voting event",error);
    }
}

const getLikes = async (eventID) =>{
    try{
        const response = await axios.get(`${baseurl}/interested-events/users-count?eventID=${eventID}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export default { setToken,upVote,getLikes,token};