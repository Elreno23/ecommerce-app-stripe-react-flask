import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext';
import { useNavigate, useParams } from 'react-router-dom';
import "../../styles/Details.css";

const Details = () => {
    const { actions, store } = useContext(Context);
    const [cartQuantities] = useState({});
    const [productIsInCart, setProductIsInCart] = useState(false);
    const { product_id } = useParams();
    const navigate = useNavigate();
    const cart = store.cart;
    console.log("carrito de compras", cart);

    const [product, setProduct] = useState(null);
    console.log(product);


    useEffect(() => {
        const getProductDetails = async () => {
            try {
                const foundProduct = await actions.getOneProduct(parseInt(product_id, 10))
                setProduct(foundProduct);
            } catch (err) {
                console.error('Error finding the product', err)
            }
        };
        const checkIfInCart = () => {
            if (cart && Array.isArray(cart)) {
                console.log("antes de buscar el producto",productIsInCart);
                
                const isInCart = cart.some((product) => product.product_id === parseInt(product_id, 10))
                setProductIsInCart(isInCart);
                console.log("despues de buscar el producto",productIsInCart);
                
            } else {
                console.error('Cart is undefined or not an array');
                setProductIsInCart(false);
                console.log("si hay algun error", productIsInCart);
                
            };
        }

        checkIfInCart();
        getProductDetails();
    }, [actions, product_id, cart]);

    const handleAddToCart = (product_id) => {
        const newQuantity = cartQuantities[product_id] || 1;
        const data = { product_id, quantity: newQuantity };
        actions.addItemCart(data);
        navigate("/stock");
        window.location.reload()

    };


    return (
        <div className="container details">
            {product ? (
                <div className="card" style={{ width: '18rem' }}>
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">Type: {product.stocktype}</p>
                    <div className='container-img'>
                        <img src={product.image} className="card-img-top" alt={product.name} />
                    </div>
                    <div className="card-body details">
                        <p className="card-text">stock: {product.stock}</p>
                        <p className="card-text">{product.description}</p>
                        <p className="card-text">Price: ${product.price}</p>
                        {!productIsInCart ? (
                            <>
                            {console.log("Es true o NO?",productIsInCart)}
                            
                            <button onClick={() => handleAddToCart(product.id)} className="btn add"><i className="fa-solid fa-cart-plus"></i>
                                Add to cart</button>
                                </>
                        ) : (
                        <strong className='productoEnCarrito'>El producto ya está en el carrito!</strong>
                        )}
                    </div>
                </div>
            ) : (
                <p>Product not found</p>
            )}
        </div>
    )
}

export default Details;