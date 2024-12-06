import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';
import Payment from './Payment';

const Cart = () => {
  const { actions, store } = useContext(Context);
  const [isLoading, setIsLoading] = useState(true);
  const [quantities, setQuantities] = useState({})
  const navigate = useNavigate();
  const cartItems = store.cart;
  const userData = store.userProfile;



  useEffect(() => {
    if (cartItems.length > 0) {
      setIsLoading(false)
    }
  }, [cartItems])

  const handleItemDelete = (e, item_id) => {
    e.stopPropagation(); //No funciona!
    actions.deleteItemCart(item_id)
  }
  const handleQuantityChange = (e, item_id) => {
    e.stopPropagation();
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      setQuantities(prevQuantities => ({
        ...prevQuantities, [item_id]: newQuantity
      }));
    };
  }
  const handleQuantityUpdate = (item_id) => {
    const newQuantity = quantities[item_id] || 1;
    const data = { item_id, quantity: newQuantity }
    actions.updateItemCart(data);
  }

  const handleGoToPay = async () => {
    try {
      const orderResponse = await actions.newOrder();
      if (orderResponse && orderResponse.data) {
        const order_id = orderResponse.data.id;
        await actions.newOrderDetail(order_id)
        navigate("/orders-details")
      } else {
        console.error("Order response is invalid");
      }
    } catch (err) {
      console.error("error calling order and detailsOrders");
    }
  }
 
  return (
    <div>
      <div className="dropdown">
        <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          Carrito y extras
        </button>
        <ul className="dropdown-menu">
          {isLoading ? (
            <div>No products</div>
          ) : (
            <>
              {cartItems.map((item, index) => (
                <li key={index}>
                  <button className="dropdown-item" onClick={(e) => handleItemDelete(e, item.id)}>
                    <i className="fa-solid fa-trash" ></i>
                  </button>
                  <a className="dropdown-item" href="#">{item.product_name}</a>
                  <input
                    type="number"
                    className="dropdown-item"
                    value={quantities[item.id] || item.quantity}/*propiedades computadas*/
                    onChange={(e) => handleQuantityChange(e, item.id)}
                    min="1"
                  />
                  <button onClick={() => handleQuantityUpdate(item.id)}>UPDATE!</button>
                  <img className="dropdown-item" src={item.product_image} alt={item.product_name} />
                </li>
              ))}
              <button onClick={handleGoToPay}>Go to Order <i className="fa-solid fa-bag-shopping"></i></button>
            </>
          )}
          {userData ? (
            <p>{userData.username}</p>
          ) : (
            <p>Loading user info...</p>)}
        </ul>
      </div>
    </div>
  )
}

export default Cart;