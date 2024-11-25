import React, { useContext, useEffect } from 'react'
import { Context } from '../store/appContext';

const Stock = () => {
    const { store, actions } = useContext(Context);
    const products = store.stock

    useEffect(() => {
        actions.getStock();
    }, []);

    return (
        <div className='container'>
            ESTE ES EL STOCK Y CONTENDRÁ TODOS LOS ARTICULOS
            {products.map((product, index) => {
                return (
                    <Card key={index} style={{ width: '18rem', margin: '1rem' }} className="shadow-sm">
                        <Card.Img variant="top" src={product.image} alt={product.name} />
                        <Card.Body>
                            <Card.Title>{product.name}</Card.Title>
                            <Card.Text> {product.description} </Card.Text>
                            <Card.Text> {product.stock} </Card.Text>
                            <Card.Text> {product.stocktype} </Card.Text>
                            <Button variant="primary">Ver Detalles</Button>
                        </Card.Body>
                    </Card>
                )
            })}
        </div>
    )
}

export default Stock