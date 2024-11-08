import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Context } from '../store/appContext'


const Private = () => {
    const { actions } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => { //Para ejecutar la función private(fetch) cuando se monta el componente.
        const responsePrivate = async () => {
            try {
                const resp = await actions.private();
                if (!resp) { //Si hay algún error me devuelve a login.
                    navigate("/")
                }
            } catch (err) {
                console.error(err)

            }
        };
        responsePrivate() //Llamamos para asegurar que se ejecute cuando se monte.
    }, []); //Vacío por ahora.
    return (
        <div className='container d-flex flex-column align-items-center' style={{ margin: "10% auto" }}>
            <img src='https://pngimg.com/uploads/welcome/welcome_PNG32.png' style={{ width: "60%" }} />
        </div>
    )
}

export default Private