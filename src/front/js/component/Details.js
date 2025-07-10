import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext';
import { useNavigate, useParams } from 'react-router-dom';
import "../../styles/Details.css";

const Details = () => {
    const token = localStorage.getItem("jwt_token");
    const { actions, store } = useContext(Context);
    const [cartQuantities] = useState({});
    const [productIsInCart, setProductIsInCart] = useState(false);
    const { product_id } = useParams();
    const navigate = useNavigate();
    const cart = store.cart;
    console.log("carrito de compras", cart);

    const [product, setProduct] = useState(null);
    


    useEffect(() => {
        if(!token){
            navigate("/")
            return;
        }
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
                console.log("antes de buscar el producto", productIsInCart);

                const isInCart = cart.some((product) => product.product_id === parseInt(product_id, 10))
                setProductIsInCart(isInCart);
                console.log("despues de buscar el producto", productIsInCart);

            } else {
                console.error('Cart is undefined or not an array');
                setProductIsInCart(false);
                console.log("si hay algun error", productIsInCart);

            };
        }

        checkIfInCart();
        getProductDetails();
    }, [actions, product_id, cart, navigate, token]);

    const handleAddToCart = async (product_id) => {
        const newQuantity = cartQuantities[product_id] || 1;
        const data = { product_id, quantity: newQuantity };
        await actions.addItemCart(data);
        navigate("/stock");

    };


    return (
        <div className="container details">
            {product ? (
                <div className="card details">
                    <h5 className="card-title details">{product.name}</h5>
                    <p className="card-text details">Type: {product.stocktype}</p>
                    <div className='container-img details'>
                        <img src={product.image} className="card-img-top details" alt={product.name} />
                    </div>
                    <div className="card-body details">
                        <p className="card-text details">stock: {product.stock}</p>
                        <p className="card-text details">{product.description}</p>
                        <p className="card-text details">Price: ${product.price}</p>
                        {!productIsInCart ? (
                            <>
                                {console.log("Es true o NO?", productIsInCart)}

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