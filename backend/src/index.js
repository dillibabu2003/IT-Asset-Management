const app = require('./app');
const connectToDB = require('../config/db');
const cleanedEnv = require('../utils/cleanedEnv');
const PORT = cleanedEnv.PORT;
try {
    connectToDB.then(
       ()=>{
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        })
       }
    );
}catch(err){
    console.error(err);
}