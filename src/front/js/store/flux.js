import { Navigate } from "react-router-dom";

const getState = ({ getStore, getActions, setStore }) => {
	const token = localStorage.getItem("jwt_token");
	const url = process.env.BACKEND_URL
	return {
		store: {
			message: null,
			user: null,
			stock: [],
			register: [],
			users: []
		},
		actions: {
			/*private: async () => { //Función que ejecuta el fetch private(Estado global).
				if (!token) { //Si no hay token paramos la ejecución.
					return null
				}
				try {
					const resp = await fetch(`https://curly-space-robot-x59wwq4wq47r3wwq-3001.app.github.dev/private`, {
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}` //Recibimos el token.
						}
					});
					if (!resp.ok) {
						throw new Error("Application failed!")
					}
					const data = await resp.json(); //Esperamos la data.
					return data //la retornamos por si la queremos usar.
				} catch (err) {
					console.log(err);
					alert("Error http!");

				}
			},*/
			register: async (usersData) => {
				try {
					const resp = await fetch(`${url}signup`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(usersData)
					});
					if (!resp.ok) {
						throw new Error("Error receiving data!")
					}
					const result = await resp.json();
					setStore(prevStore => ({
						users: [...prevStore.users, result.data]  // Agrego el nuevo usuario al array
					}));
					return { status: resp.status, data: result.data }; // Devolvemos el resultado para usarlo en el componente.
				} catch (err) {
					console.error('There was a problem with the fetch operation:', err);
					alert('Unregistered user, please try again');

				}
			},
			getUserInfo: async () => {
				if (!token) {
					return null
				}
				try {
					const resp = await fetch(`${url}profile`, {
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						}
					});
					if (!resp.ok) {
						throw new Error("Error receiving data!")
					}
					const result = await resp.json();
					setStore({ user: result })
				} catch (err) {
					console.error('There was a problem with the fetch operation:', err);
					alert('Error obtaining user information.');
				}
			},
			getStock: async () => {
				if (!token) {
					return null
				}
				try {
					const resp = await fetch(`${url}obtain_all_products`, {
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						}
					});
					if (!resp.ok) {
						throw new Error("Error receiving data!")
					}
					const result = await resp.json();
					setStore(prevStore => ({ ...prevStore, stock: [...prevStore.stock, result.data] }))
				} catch (err) {
					console.error('There was a problem with the fetch operation:', err);
					alert('An error occurred while fetching data. Please try again later.');

				}
			},
			addProduct: async (productData) => {
				if (!token) {
					return null
				}
				try {
					console.log(productData);
					console.log(token);


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
					setStore(prevStock => ({
						stock: [...prevStock, result.data]
					}));
					return { status: resp.status, data: result.data };
				} catch (err) {
					console.error('There was a problem with the fetch operation:', err);
					alert('An error occurred while fetching data. Please try again later.');

				}
			},
		}
	};
};

export default getState;
