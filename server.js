const app = require('./app');
//config

const dotenv = require('dotenv');
const connect = require('./config/database');
const connectDatabase = require('./config/database');

//Handling uncaught exceptions
process.on('uncaughtException', err => {
    console.log("Error: " + err.message);
    console.log('Shutting down server due to uncaught Exception: ' + err.stack);
    server.close(() => {
        process.exit(1);
    });
});
dotenv.config({ path: './config/.env' });

connectDatabase();
const server = app.listen(process.env.PORT, () => {
    console.log(`your server is running on http://localhost:${process.env.PORT}`)
});

//unhandled promise rejection
process.on('unhandledRejection', err => {
    console.log("Error: " + err.message);
    console.log('Shutting down server due to unhandled rejection: ' + err.stack);
    server.close(() => {
        process.exit(1);
    });
});