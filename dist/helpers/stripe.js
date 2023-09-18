"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-08-16",
});
exports.default = {
    createAppointment: (doctorName, patientName, appointmentId, charges) => __awaiter(void 0, void 0, void 0, function* () {
        const appointment = yield stripe.products.create({
            name: doctorName,
            id: appointmentId,
            description: "Doctor charges",
            type: "service",
            metadata: {
                patientName,
            },
        });
        const price = yield stripe.prices.create({
            unit_amount: charges * 300,
            currency: "pkr",
            product: appointment.id,
        });
        return price;
    }),
    createPaymentLink: (price) => __awaiter(void 0, void 0, void 0, function* () {
        const session = yield stripe.checkout.sessions.create({
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
    }),
};
//# sourceMappingURL=stripe.js.map