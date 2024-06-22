const express = require('express');
const bodyParser = require('body-parser');
const { Cashfree } = require('cashfree-pg');
const Cors = require('cors');
const app = express();
const port = 5000;

app.use(Cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Cashfree SDK with your credentials and environment for production
Cashfree.XClientId = "704574427dcfe9140b0ed50016475407"; // Production Client ID
Cashfree.XClientSecret = "cfsk_ma_prod_0f839fa28421fe634bcd3dd34c04440c_ef3f80d7"; // Production Client Secret
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION; // Set to PRODUCTION for live environment

// Single API endpoint for creating an order and displaying the payment interface
app.post('/initiate_payment', async (req, res) => {
  try {
    const request = {
      order_amount: req.body.order_amount,
      order_currency: "INR",
      order_id: req.body.order_id,
      customer_details: {
        customer_id: req.body.customer_id,
        customer_phone: req.body.customer_phone,
        customer_email: req.body.customer_email // Assuming email is also provided
      },
      order_meta: {
        return_url: `http://localhost:3000/payment_success?order_id=${req.body.order_id}` // Local URL for testing
      }
    };

    // Create order
    const response = await Cashfree.PGCreateOrder("2022-09-01", request);
    console.log('Order Created successfully:', response.data);

    res.json({
      payment_session_id: response.data.payment_session_id, // Return session ID for frontend
      payment_url: `http://localhost:3000/payment_page?payment_session_id=${response.data.payment_session_id}` // Local frontend payment page URL
    });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data.message : error.message);
    res.status(500).json({ error: 'Failed to create order', details: error.response ? error.response.data.message : error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
