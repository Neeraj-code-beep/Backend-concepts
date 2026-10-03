import productModel from '../models/product.model.js';
import paymentModel from '../models/payment.model.js';
import { validatePaymentVerification } from '../../node_modules/razorpay/dist/utils/razorpay-utils.js';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createOrder(req, res) {
  try {
    const product = await productModel.findOne();

    const options = {
      amount: product.price.amount,
      currency: product.price.currency,
    };

    const order = await razorpay.orders.create(options);

    await paymentModel.create({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: 'PENDING',
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error(error);

    return res.status(500).send('Error creating order');
  }
}

async function verifyPayment(req, res) {
  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  try {
    const result = validatePaymentVerification(
      { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
      signature,
      secret,
    );
    if (result) {
      const payment = await paymentModel.findOne({ orderId: razorpayOrderId });
      payment.paymentId = razorpayPaymentId;
      payment.signature = signature;
      payment.status = 'COMPLETED';
      await payment.save();
      res.json({ status: 'success' });
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Error verifying payment');
  }
}

export default { createOrder, verifyPayment };
