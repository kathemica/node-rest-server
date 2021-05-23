import {OAuth2Client} from 'google-auth-library';
import logger from "../config/logger.js";
import {google_config } from "../config/config.app.js";

const client = new OAuth2Client(google_config.GOOGLE_CLIENT_ID);

const googleVerify = async (idToken = '') => {
    try {        
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: google_config.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        // const payload = ticket.getPayload();
        // const userid = payload['sub'];
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        const {given_name: firstName, family_name: lastName, email, picture: image} = ticket.getPayload();

        return {firstName, lastName, email, image};        
    } catch (error) {
        logger.error('Error on googleVerify: '+ error);
        throw new Error('Error on googleVerify: '+ error);        
    }
}

export default googleVerify;