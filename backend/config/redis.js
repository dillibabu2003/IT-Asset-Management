const {createClient} = require('redis');
const cleanedEnv = require('../utils/cleanedEnv');
const redisClient = createClient({
    url: cleanedEnv.REDIS_URI
});
module.exports=redisClient;