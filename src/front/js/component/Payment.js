import React, {useContext} from 'react';
import { Context } from '../store/appContext';
import { loadStripe } from '@stripe/stripe-js';

const Payment = () => {
    const {actions, store} = useContext(Context);
    const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);
    

    const handleClick = async () => {
        const stripe = await stripePromise;
        const session = await actions.createCheckoutSession();
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
