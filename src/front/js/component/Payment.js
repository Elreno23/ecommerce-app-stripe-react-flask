import React, { useContext, useEffect } from 'react';
import { Context } from '../store/appContext';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';
import '../../styles/Payment.css'

const Payment = () => {
    const token = localStorage.getItem("jwt_token");
    const { actions, store } = useContext(Context);
    const navigate = useNavigate();
    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

    useEffect(() => {
        if (!token) {
            navigate("/")
            return;
        }
    }, [navigate, token])

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
        <button className='btn Pay' role="link" onClick={handleClick}><strong>Go to Pay</strong> <i className="fa-solid fa-bag-shopping"></i></button>
    );
};

export default Payment;
