import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/Cart.css'

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

  const handleItemDelete = async (e, item_id) => {
    e.stopPropagation(); //No funciona!
    await actions.deleteItemCart(item_id)
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
        window.location.reload();
      } else {
        console.error("Order response is invalid");
      }
    } catch (err) {
      console.error("error calling order and detailsOrders");
    }
  };
  const handleDetails = (product_id) => {
    navigate(`/details/${product_id}`)
  };
  const logout = () => {
    localStorage.removeItem("jwt_token");
    navigate("/");
    alert("You are logged out.")
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
                  <div className='title'>
                    <p>{item.product_name}</p>
                  </div>
                  <div className='quantity'>
                    <label htmlFor="quantity">Quantity:</label>
                    <input
                      id='quantity'
                      type="number"
                      className="dropdown-item"
                      value={quantities[item.id] || item.quantity}/*propiedades computadas*/
                      onChange={(e) => handleQuantityChange(e, item.id)}
                      min="1"
                    />
                  </div>
                  <div className="image-container">
                    <img className="card-img" src={item.product_image} alt={item.product_name} />
                  </div>
                  <div className='buttons'>
                    <div className='infoAndDeatilsButtons'>
                      <button className="btn icon-button" onClick={() => handleDetails(item.product_id)}><i className="fa-solid fa-info"></i></button>
                      <button className="btn icon-button" onClick={() => handleQuantityUpdate(item.id)}><i className="fa-solid fa-pen"></i></button>
                    </div>
                    <div className='trashButton'>
                      <button className="btn icon-button" onClick={(e) => handleItemDelete(e, item.id)}><i className="fa-solid fa-trash" ></i></button>
                    </div>
                  </div>
                  <hr></hr>
                </li>
              ))}
              <div className='goToOrderButton'>
                <button className='btn btn-dark ' onClick={handleGoToPay}><p>Go to Order</p> <i className="fa-solid fa-bag-shopping"></i></button>
              </div>
              <hr></hr>
            </>
          )}
          {userData ? (
            <p className='seeYouUser'>See you later... <strong>{userData.username}</strong></p>
          ) : (
            <p>Loading user info...</p>
          )}
          <div className='logoutButton'>
            <button className='btn logout' onClick={logout}><p>Logout</p><i className="fa-solid fa-right-from-bracket"></i></button>
          </div>
        </ul>
      </div>
    </div>
  )
}

export default Cart;