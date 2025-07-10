import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext'
import Payment from './Payment';
import '../../styles/OrdersAndDetails.css'
import { useNavigate } from 'react-router-dom';


const OrdersAndDetails = () => {
    const token = localStorage.getItem("jwt_token");
    const { actions, store } = useContext(Context);
    const [newQuantity, setNewQuantity] = useState(1);
    const [showInput, setShowInput] = useState({});
    const navigate = useNavigate();
    const detailOrders = store.detailOrders;
    console.log("esto son los detalles de ordenes", detailOrders);

    useEffect(() => {
        if (!token) {
            navigate("/")
            return;
        }
    }, [navigate, token])


    const handleShowInput = (detail_id) => {
        setShowInput(prevState =>
        ({ ...prevState, [detail_id]: true }

        ))
    };


    const handleUpdateQuantity = async (detail_id) => {
        const quantity = parseInt(newQuantity[detail_id], 10)
        if (quantity > 0) {
            await actions.updateOrderDetail(detail_id, quantity)

        }
        setShowInput(prevState => ({
            ...prevState, [detail_id]: false
        }));
    }
    const handleProductDelete = async (detail_id) => {
        try {
            await actions.deleteOrderDetail(detail_id);
            console.log("detailOrder", detail_id);
        } catch (err) {
            console.error("Error deleting order or order detail:", err);
            alert("Error deleting order or order detail");
        }
    };
    //1)Inicializamos reduce con un obj vacio.
    /*2)Verificamos que cada detalle tenga una orden asociada(detail.order_id)
    sino la tiene la incializamos como un array vacio*/
    //3)Pusheamos el detalle con una order_id que coincida con una order_id de nuestro acc.
    //4)Retornamos nuestro acc.
    const groupedOrders = detailOrders.reduce((acc, detail) => {

        if (!acc[detail.order_id]) {
            acc[detail.order_id] = [];
        }
        acc[detail.order_id].push(detail);
        console.log("Objeto con details por order_id", acc);
        return acc;
    }, {});

    const handleCancelQuantity = (detail_id) => {
        setShowInput(
            prevState => ({
                ...prevState, [detail_id]: false
            }));
    };
    return (

        <div className='container ordersDetails'>
            {/* 1) Obtenemos un array de order_id del objeto groupedOrders */}
            {Object.keys(groupedOrders).map(orderId => (
                <div className="row byOrderId" key={orderId}>
                    <h5 className="orderId">Order ID: {orderId}</h5>
                    <hr />
                    {/* 2) Iteramos sobre los detalles asociados a ese order_id */}
                    {groupedOrders[orderId].map(detail => (
                        <div className='card ordersDetails' key={detail.id}>
                            <ul className="list-group list-group-flush">
                                <div className='nameStocktype'>
                                    <h5 className="card-title ordersDetails">Name: {detail.product_name}</h5>
                                    <p className="card-text ordersDetails">Type: {detail.product_stocktype}</p>
                                </div>
                                <div className="container-img ordersDetails">
                                    <img src={detail.product_image} className="card-img-top ordersDetails" alt={detail.product_name} />
                                </div>
                                <div className='card-body ordersDetails'>
                                    {showInput[detail.id] ? (
                                        <div className="card-text ordersDetails">
                                            <label htmlFor="newQuantity">New Quantity:</label>
                                            <input
                                                id={`newQuantity-${detail.id}`}
                                                type="number"
                                                className="form-control"
                                                value={newQuantity[detail.id] || ""}
                                                min="1"
                                                onChange={(e) => setNewQuantity({ ...newQuantity, [detail.id]: e.target.value })}
                                                placeholder="Enter new quantity"
                                            />
                                            <button
                                                className="btn ordersDetails"
                                                onClick={() => handleUpdateQuantity(detail.id)}><i className="fa-solid fa-check"></i>
                                            </button>
                                            <button
                                                className="btn ordersDetails"
                                                onClick={() => handleCancelQuantity(detail.id)}><i className="fa-solid fa-xmark"></i>
                                            </button>


                                        </div>

                                    ) : (
                                        <>
                                            <p className="card-text ordersDetails">Description: {detail.product_description}</p>
                                            <p className='card-text ordersDetails'>Quantity: {detail.quantity}</p>
                                        </>
                                    )}
                                    <p className="card-text ordersDetails">Price per unit: ${detail.product_price}</p>
                                    <p className="card-text ordersDetails">Final Price: ${detail.price}</p>
                                    {showInput[detail.id] ? (
                                        <Payment />
                                    ) : (
                                        <div className='quantityTrashPay'>
                                            <Payment />
                                            <div className='trashQuantity'>
                                                <button className="btn ordersDetails" onClick={() => handleShowInput(detail.id)}><p>Quantity</p> <i className="fa-solid fa-pen"></i></button>
                                                <button className="btn ordersDetails" onClick={() => handleProductDelete(detail.id)}><i className="fa-solid fa-trash"></i></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ul>
                        </div>
                    ))}
                </div>
            ))}
        </div>

    )
};

export default OrdersAndDetails;