import Stripe from "stripe";
import logger from "../startup/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
});

export default {
  createAppointment: async (
    doctorName: string,
    patientName: string,
    appointmentId: string,
    charges: number
  ) => {
    const appointment = await stripe.products.create({
      name: doctorName,
      id: appointmentId,
      description: "Doctor charges",
      type: "service",
      metadata: {
        patientName,
      },
    });

    const price = await stripe.prices.create({
      unit_amount: charges * 300,
      currency: "pkr",
      product: appointment.id,
    });

    return price;
  },
  createPaymentLink: async (price: Stripe.Price) => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });
    return session;
  },
};
