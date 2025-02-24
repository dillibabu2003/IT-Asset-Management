const app = require('./app');
const connectToDB = require('../config/db');
const cleanedEnv = require('../utils/cleanedEnv');
const redisClient = require('../config/redis');
const PORT = cleanedEnv.PORT;

(async ()=>{
    try {
        await connectToDB;
        await redisClient.connect();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }catch(err){
        console.error(err);
    }
})()