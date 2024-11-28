import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../store/appContext';
import { useNavigate, useParams } from 'react-router-dom';

const StockAdminUpdate = () => {
    const token = localStorage.getItem("jwt_token");
    const url = process.env.BACKEND_URL;
    const { actions, store } = useContext(Context);
    const { product_id } = useParams();
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
        } else if (store.userProfile && store.userProfile.usertype !== "admin") {
            navigate("/");
        }
    }, [store.userProfile, actions, navigate]);

    const handleUpdate = async (e, product_id) => {
        e.preventDefault();
        try {
            if (!token) {
                return null
            }
            const resp = await fetch(`${url}modify_product/${product_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });
            if (!resp.ok) {
                throw new Error("Error deleting data!");
            }
            alert("Product Successfully updated");
            navigate("/stock-admin");
            window.location.reload();
        } catch (err) {
            console.error("There was a problem with the fetch operation:", err);
            alert("Product not updated!")
        }
    };
    const handleChange = (e) => {
        setProductData({
            ...productData, [e.target.name]: e.target.value //Propiedades computadas para actualizar propiedades de manera dinamica.
        });
    };
    return (
        <div className='container'>
            <form onSubmit={(e) => handleUpdate(e, product_id)}>
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
                    <input type="number" id="stock" name="stock" value={productData.stock} onChange={handleChange} min="1" required />
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
                <button className="btn btn-primary" type="submit">Update Product</button>
            </form>
        </div>
    )
}

export default StockAdminUpdate