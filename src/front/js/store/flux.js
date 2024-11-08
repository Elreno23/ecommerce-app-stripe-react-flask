import { Navigate } from "react-router-dom";

const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			]
		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			getMessage: async () => {
				try {
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error)
				}
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			},
			private: async () => { //Función que ejecuta el fetch private(Estado global).
				const token = localStorage.getItem("jwt_token"); //Obtengo el token almacenado en localStorage.
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
			}
		}
	};
};

export default getState;
