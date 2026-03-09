import stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

// Plan pricing in cents
const PRICING = {
  super: 500, // $5.00
  premium: 1000, // $10.00
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { plan, duration } = req.body;
    const userId = req.userId;

    if (!plan || !duration) {
      return res.status(400).json({ message: "Plan and duration required" });
    }

    if (!PRICING[plan]) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create Stripe checkout session
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      client_reference_id: userId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `TestNova ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan (${duration})`,
              description: `Annual subscription to TestNova ${plan} plan`,
            },
            unit_amount: PRICING[plan],
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      metadata: {
        plan,
        duration,
        userId,
      },
    });

    // Create pending transaction
    const transaction = await Transaction.create({
      userId,
      plan,
      amount: PRICING[plan] / 100,
      currency: "usd",
      status: "pending",
      sessionId: session.id,
      subscriptionDuration: duration,
      description: `${plan} plan for ${duration}`,
    });

    res.json({
      sessionId: session.id,
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
};

export const handlePaymentSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.userId;

    // Get session from Stripe
    const session = await stripeClient.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // Update transaction
    const transaction = await Transaction.findOneAndUpdate(
      { sessionId },
      {
        status: "completed",
        stripeId: session.payment_intent,
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Calculate expiration date (1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Update user subscription
    const user = await User.findByIdAndUpdate(
      userId,
      {
        plan: transaction.plan,
        subscriptionId: session.subscription,
        expiresAt,
      },
      { new: true }
    );

    res.json({
      message: "Payment successful",
      plan: transaction.plan,
      expiresAt,
      transaction,
    });
  } catch (error) {
    console.error("Error handling payment success:", error);
    res.status(500).json({ message: "Failed to process payment success" });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      transactions,
      total: transactions.length,
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).json({ message: "Failed to fetch transaction history" });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripeClient.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        await Transaction.findOneAndUpdate(
          { sessionId: session.id },
          { status: "completed", stripeId: session.payment_intent }
        );
        break;

      case "charge.refunded":
        const charge = event.data.object;
        await Transaction.findOneAndUpdate(
          { stripeId: charge.payment_intent },
          { status: "refunded" }
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ message: "Webhook error" });
  }
};
