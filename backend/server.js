import express from 'express';
import dotenv from 'dotenv';
import paypal from '@paypal/checkout-server-sdk';
import path from 'path';

dotenv.config();
const app = express();
app.use(express.json());

app.use(express.static('public'));

const environment = new paypal.core.LiveEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

const client = new paypal.core.PayPalHttpClient(environment);

app.post('/create-donation', async (req, res) => {
  const { amount } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");

  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amount
        },
        description: "Donation"
      }
    ]
  });

  const order = await client.execute(request);
  res.json({ id: order.result.id });
});

app.post('/capture-donation', async (req, res) => {
  const { orderID } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  const capture = await client.execute(request);
  res.json(capture.result);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));