import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/StockAdmin.css'

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
        if (!token) {
            navigate("/")
            return;
        }
        if (!store.userProfile) {
            actions.getUserInfo();
        } else if (store.userProfile && store.userProfile.usertype !== "admin") {
            navigate("/");
        }

    }, [store.userProfile, actions, navigate, products, token]);


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {


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
        <div className='container addProduct'>
            <form className="formAddProducts" onSubmit={handleSubmit}>
                <h1>Add Product to Stock</h1>
                <div className="inputAndLabelNameAddProduct">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={productData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="inputAndLabelDescriptionAddProduct">
                    <label htmlFor="description">Description</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={productData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="inputAndLabelStockAddProduct">
                    <label htmlFor="stock">Stock</label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={productData.stock}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>
                <div className="inputAndLabelPriceAddProduct">
                    <label htmlFor="price">Price</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={productData.price}
                        step="0.01"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="inputAndLabelImageAddProduct">
                    <label htmlFor="image">Image-URL</label>
                    <input
                        type="text"
                        id="image"
                        name="image"
                        value={productData.image}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="inputAndLabelStocktypeAddProduct">
                    <label htmlFor="stocktype">StockType</label>
                    <select
                        id="stocktype"
                        name="stocktype"
                        value={productData.stocktype}
                        onChange={handleChange}
                        required>
                        <option value="">Select a product type</option>
                        <option value="monitor">Monitor</option>
                        <option value="keyboard">Keyboard</option>
                        <option value="cable">Cable</option>
                        <option value="mouse">Mouse</option>
                        <option value="camera">Camera</option>
                    </select>
                </div>
                <div className="addButton">
                    <button className="btn btn-dark addProduct" type="submit">
                        <p>Add</p>
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>
            </form>
            <hr></hr>
            <h1>Modify or Delete the product</h1>
            <div className='container adminCard'>
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    products.map(product => (
                        <div className="card admin" key={product.id}>
                            <div className='nameType'>
                                <h5 className="card-title admin">Name: {product.name}</h5>
                                <p className="card-text admin">Type: {product.stocktype}</p>
                            </div>
                            <div className='container-img admin'>
                                <img src={product.image} className="card-img-top admin" alt={product.name} />
                            </div>
                            <div className="card-body admin">
                                <p className="card-text admin">Description: {product.description}</p>
                                <p className="card-text admin">Stock: {product.stock}</p>
                                <p className="card-text admin">Price: {product.price}</p>
                                <div className='modifyTrash'>
                                    <Link to={`/stock-admin-update/${product.id}`}>
                                        <button className="btn admin"><i className="fa-solid fa-pen"></i></button>
                                    </Link>
                                    <button className="btn admin" onClick={() => handleDeleted(product.id)}><i className="fa-solid fa-trash" ></i></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
} //HAY QUE MOSTRAR EL STOCK.


export default StockAdmin