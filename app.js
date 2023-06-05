const express = require('express');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/error');
const app = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
dotenv.config({ path: '../config/.env' });
const cors = require('cors');
const Razorpay = require('razorpay');
const shortid = require('shortid');
const path = require('path');

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

const razorpay = new Razorpay({
  key_id: "rzp_test_wBU9x1cN57zN3f",
  key_secret: "uci7KIIDxHSlSJ62MlNaB1GB",
});

app.get('/logo.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'logo.jpg'));
});

app.post('/razorpay', async (req, res) => {
  const payment_capture = 1;
  const currency = 'INR';
  const options = {
    amount: req.body.totalPrice * 100,
    currency: currency,
    receipt: shortid.generate(),
    payment_capture
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log('ress', response);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.log(error);
  }
});
//middleware for error
app.use(errorMiddleware);

module.exports = app;