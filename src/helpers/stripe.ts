import Stripe from "stripe";
import logger from "../startup/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
});

export default {
  createDoctor: (
    doctorName: string,
    doctorId: string,
    image: string,
    charges: number,
    charges_type: string
  ) => {
    stripe.products
      .create({
        name: doctorName,
        id: doctorId,
        description: "Doctor charges",
        type: "service",
        images: [image],
        metadata: {
          appointment_type: charges_type,
        },
      })
      .then((doctor) => {
        stripe.prices
          .create({
            unit_amount: charges * 100,
            currency: "pkr",
            product: doctor.id,
          })
          .then((price) => {
            logger.info(`Doctor ${doctorName} created successfully in stripe`);
          });
      })
      .catch((error) => {
        logger.error(`Error creating doctor ${doctorName} in stripe` + error);
      });
  },
};
