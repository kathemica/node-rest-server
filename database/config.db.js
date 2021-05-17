import mongoose from 'mongoose';
import colors from 'colors';

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.ATLAS_MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify:false
        });

        console.log(`Connected to db`.blue);
    } catch (error) {
        throw new Error(`Error loading db, details:${error}`);
    }
}

export{
    dbConnection
}