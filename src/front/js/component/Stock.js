import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext';


const Stock = () => {
    const { store, actions } = useContext(Context);
    const [isLoading, setIsLoading] = useState(true);
    const products = store.stock
    const [cartQuantities, setCartQuantities] = useState({})

    useEffect(() => {
        if (products.length > 0) {
            setIsLoading(false)
        }
    }, [products])


    const handleItemUpdate = (e, product_id) => {
        e.stopPropagation();
        const newQuantity = parseInt(e.target.value, 10);//Transformamos quantity a un numero entero.
        if (!isNaN(newQuantity) && newQuantity > 0) { // Verificar que el valor sea un número válido y mayor que 0
            setCartQuantities(prevQuantities => ({
                ...prevQuantities, [product_id]: newQuantity
            }));
        };
    };
    const handleAddToCart = (product_id) => {
        const newQuantity = cartQuantities[product_id] || 1;
        const data = { product_id, quantity: newQuantity };
        console.log('Sending data:', data);
        actions.addItemCart(data);

        
    };

    return (
        <div className='container'>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                products.map((product, index) => (
                    <div className="card" style={{ width: '18rem', margin: '1rem' }} key={index}>
                        <img src={product.image} className="card-img-top" alt={product.name} />
                        <div className="card-body">
                            <h5 className="card-title">{product.name}</h5>
                            <p className="card-text">{product.description}</p>
                            <p className="card-text">{product.stock}</p>
                            <p className="card-text">{product.stocktype}</p>
                            <p className="card-text">{product.id}</p>
                            <a href="#" className="btn btn-primary">Ver Detalles</a>
                            <input
                                type='number'
                                name='quantity'
                                value={cartQuantities[product.id] || 1}
                                onChange={(e) => handleItemUpdate(e, product.id)}
                                min="1"
                                required
                            />
                            <button onClick={() => handleAddToCart(product.id)}>Add to Cart</button>
                        </div>
                    </div>
                ))
            )}
        </div >
    )

}
export default Stock;