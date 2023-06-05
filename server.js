const express = require('express');
const app = require('./app');
const cloudinary = require('cloudinary');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');
dotenv.config({ path: './config/.env' });

// Handling uncaught exceptions
process.on('uncaughtException', err => {
    console.log("Error: " + err.message);
    console.log('Shutting down server due to uncaught Exception: ' + err.stack);
    server.close(() => {
        process.exit(1);
    });
});

connectDatabase();

const server = app.listen(process.env.PORT, () => {
    console.log(`Your server is running on http://localhost:${process.env.PORT}`);
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Unhandled promise rejection
process.on('unhandledRejection', err => {
    console.log("Error: " + err.message);
    console.log('Shutting down server due to unhandled rejection: ' + err.stack);
    server.close(() => {
        process.exit(1);
    });
});