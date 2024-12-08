import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext';
import { useNavigate, Link } from 'react-router-dom';

const StockAdmin = () => {
    const token = localStorage.getItem("jwt_token");
    const url = process.env.BACKEND_URL;
    const { actions, store } = useContext(Context);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const products = store.stock;
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

    }, [store.userProfile, actions, navigate, products]);

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (!token) {
                return null
            }
            const resp = await fetch(`${url}create_product`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(productData)//Almacenar datos en un estado en el componente.
            });
            if (!resp.ok) {
                throw new Error("Error receiving data!")
            }
            const result = await resp.json();
            alert('Product created successfully!')
            window.location.reload();
            return { status: resp.status, data: result.data };
        } catch (err) {
            console.error("There was a problem with the fetch operation:", err);
            alert("Product not created!");

        }
    };
    const handleDeleted = async (id) => {
        try {
            if (!token) {
                return null
            }
            const resp = await fetch(`${url}delete_product/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!resp.ok) {
                throw new Error("Error deleting data!");
            }
            alert("Product Successfully Removed");
            window.location.reload();
        } catch (err) {
            console.error("There was a problem with the fetch operation:", err);
            alert("Product not removed!")
        }
    };

    const handleChange = (e) => {
        setProductData({
            ...productData, [e.target.name]: e.target.value //Propiedades computadas para actualizar propiedades de manera dinamica.
        });
    };

    useEffect(() => {
        if (products.length > 0) {
            setIsLoading(false)
        }
    }, [products])

    return (
        <div className='container'>
            <h1>Add Product to Stock</h1>
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
                <button className="btn btn-primary" type="submit">Add Product</button>
            </form>
            <hr></hr>
            <h1>Modify or Delete the product</h1>
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
                            <p className="card-text">{product.price}</p>
                            <Link to={`/stock-admin-update/${product.id}`}>
                                <button className="btn btn-warning">¡UPDATE!</button> {/*HAY QUE IMPLEMENTAR*/}
                            </Link>
                            <button className="btn btn-danger" onClick={() => handleDeleted(product.id)}>¡DELETE!</button>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
} //HAY QUE MOSTRAR EL STOCK.


export default StockAdmin