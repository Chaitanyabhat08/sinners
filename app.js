const express = require('express');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/error');
const app = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
dotenv.config({ path: '../config/.env' });
const cors = require('cors');

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors());
//route imports
const product = require('./routes/productRoute');
const user = require('./routes/userRoute');
const order = require('./routes/orderRoute');

app.use("/api/v1/", product);
app.use("/api/v1/", user);
app.use("/api/v1/", order);

//middleware for error
app.use(errorMiddleware);

module.exports = app;