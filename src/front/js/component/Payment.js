import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const Payment = () => {
    const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);
    const token = localStorage.getItem("jwt_token");
    const url = process.env.BACKEND_URL;

    const createCheckoutSession = async () => {
        try {
            if (!token) {
                return null;
            }
            const resp = await fetch(`${url}create_checkout_session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            console.log(resp);
            console.log(token);
            
            if (!resp.ok) {
                throw new Error("Error receiving data!");
            }
            const session = await resp.json();
            alert("Checkout session successfully created");
            return { sessionId: session.id };
        } catch (err) {
            console.error("There was a problem with the fetch operation:", err);
            alert("Checkout session not created");
        }
    };

    const handleClick = async () => {
        const stripe = await stripePromise;
        const session = await createCheckoutSession();
        if (session) {
            const result = await stripe.redirectToCheckout({
                sessionId: session.sessionId,
            });
            if (result.error) {
                console.error(result.error.message);
            }
        }
    };

    return (
        <button role="link" onClick={handleClick}>Go to Pay <i className="fa-solid fa-bag-shopping"></i></button>
    );
};

export default Payment;
