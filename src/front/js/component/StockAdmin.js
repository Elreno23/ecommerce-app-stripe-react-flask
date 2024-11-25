import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';

const StockAdmin = () => {
    const { actions, store } = useContext(Context);
    const navigate = useNavigate();
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        stock: "",
        price: "",
        image: "",
        stocktype: ""
    });
    useEffect(() => {//Traemos la info del user para saber si es admin o no!
        if (!store.userProfile) {
            actions.getUserInfo();
        }
    }, [store.userProfile, actions]);

    useEffect(() => { //Verificamos si el usuario es admin!
        if (store.userProfile && store.userProfile.usertype !== "admin") {
            navigate("/");
        }
    }, [store.userProfile, navigate]);

    const handleChange = (e) => {
        setProductData({
            ...productData, [e.target.name]: e.target.value //Propiedades computadas para actualizar propiedades de manera dinamica.
        });
    };
    const handleSubmit = async (e) => {
        console.log("Submitting productData:", productData);
        e.preventDefault();
        await actions.addProduct(productData)
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={productData.name} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="description">Description</label>
                <input type="text" id="description" name="description" value={productData.description} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="stock">Stock</label>
                <input type="number" id="stock" name="stock" value={productData.stock} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="price">Price</label>
                <input type="number" id="price" name="price" value={productData.price} step="0.01" onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="image">Image-URL</label>
                <input type="text" id="image" name="image" value={productData.image} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="stocktype">StockType</label>
                <select id="stocktype" name="stocktype" value={productData.stocktype} onChange={handleChange} required>
                    <option value="">Select a product type</option>
                    <option value="monitor">Monitor</option>
                    <option value="keyboard">Keyboard</option>
                    <option value="cable">Cable</option>
                    <option value="mouse">Mouse</option>
                    <option value="camera">Camera</option>
                </select>
            </div>
            <button className="btn btn-primary" type="submit">Add Product</button>
        </form>
    )
}

export default StockAdmin