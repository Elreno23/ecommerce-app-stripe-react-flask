import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext';

const Stock = () => {
    const { store, actions } = useContext(Context);
    const [isLoading, setIsLoading] = useState(true);
    const products = store.stock

    useEffect(() => {
       if(products.length > 0){
        setIsLoading(false)
       }
    }, [products])


    return (
        <div className='container'>
            ESTE ES EL STOCK Y CONTENDRÁ TODOS LOS ARTICULOS
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                products.map((product, index) => (
                    < div className="card" style={{ width: '18rem', margin: '1rem' }} key={index}>
                        <img src={product.image} className="card-img-top" alt={product.name} />
                        <div className="card-body">
                            <h5 className="card-title">{product.name}</h5>
                            <p className="card-text">{product.description}</p>
                            <p className="card-text">{product.stock}</p>
                            <p className="card-text">{product.stocktype}</p>
                           <a href="#" className="btn btn-primary">Ver Detalles</a>
                        </div>
                    </div>
                ))
            )}
        </div >
    )
}

export default Stock;