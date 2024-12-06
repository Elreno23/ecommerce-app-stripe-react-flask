import React, { useContext, useState } from 'react'
import { Context } from '../store/appContext'
import Payment from './Payment';


const OrdersAndDetails = () => {
    // const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);
    const { actions, store } = useContext(Context);
    const [newQuantity, setNewQuantity] = useState(1);
    const [showInput, setShowInput] = useState(false);


    const detailOrders = store.detailOrders;

    const handleShowInput = () => {
        setShowInput(true)
    };

    /*const handlePay = async () => {
        const stripe = await stripePromise;
        const session = await actions.createCheckoutSession()
        if (session) {
            const result = await stripe.redirectToCheckout({
                sessionId: session.sessionId,
            });
            if (result.error) {
                console.error(result.error.message);
            }
        }
    }*/

    const handleUpdateQuantity = async (detail_id) => {
        const quantity = parseInt(newQuantity, 10)
        if (quantity > 0) {
            await actions.updateOrderDetail(detail_id, quantity)

        }
    }


    return (
        <div className='container'>
            {detailOrders.map(detail => (
                <div key={detail.id}>
                    <p>User: {detail.user_name}</p>
                    <p>Email:{detail.user_email}</p>
                    <h2>Order ID: {detail.order_id}</h2>
                    <h3>Order Details</h3>
                    <ul>
                        <li>
                            <p>Product Name:{detail.product_name}</p>
                        </li>
                        <li>
                            {showInput ? (
                                <>
                                    <p>New Quantity:</p>
                                    <input
                                        type="number"
                                        value={newQuantity}
                                        min="1"
                                        onChange={(e) => setNewQuantity(e.target.value)}
                                        placeholder="Enter new quantity" />

                                    <button onClick={() => handleUpdateQuantity(detail.id)}>Update</button>
                                </>
                            ) : (
                                <p>
                                    Quantity:{detail.quantity}
                                </p>
                            )}
                        </li>
                        <li>
                            <p>Product price:{detail.product_price}</p>
                        </li>
                        <li>
                            <p>Final price:{detail.price}</p>
                        </li>
                        <li>
                            <p>Product Type:{detail.product_stocktype}</p>
                        </li>
                        <li>
                            <p>Product Description:{detail.product_description}</p>
                        </li>
                        <li>
                            <img src={detail.product_image} />
                        </li>
                    </ul>
                    {showInput ? (
                        <Payment />
                    ) : (
                        <>
                            <Payment />
                            <button onClick={handleShowInput}>Wrong quantity?</button>
                        </>
                    )}
                </div>
            ))}
        </div>
    )
}

export default OrdersAndDetails;