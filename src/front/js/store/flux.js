const getState = ({ getStore, getActions, setStore }) => {
	const token = localStorage.getItem("jwt_token");
	const url = process.env.BACKEND_URL
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
			],
			userProfile: null,
			stock: [],
			cart: [],
			orders: [],
			detailOrders: []

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
					return { status: resp.status, msg: result.msg }
				} catch (err) {
					console.error('There was a problem with the fetch operation:', err);
					alert('Unregistered user, please try again');

				}
			},

			login: async (loginData) => {
				try { //Captura errores, bloquea la ejecución y envia el error a catch.
					const resp = await fetch(`${url}login`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(loginData)
					});
					if (!resp.ok) {
						throw new Error(`Error receiving data${resp}`)
					}
					const result = await resp.json();
					console.log(result.jwt_token);
					return result
				} catch (err) {//Manejamos errores.
					console.error('There was a problem with the fetch operation:', err);
					alert("Incorrect email or password")

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
					setStore({ userProfile: result })
					console.log(getStore().userProfile);

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
					setStore({ stock: result.data })
				} catch (err) {
					console.error('There was a problem with the fetch operation:', err);
					alert('An error occurred while fetching data. Please try again later.');

				}
			},
			addItemCart: async (data) => {
				try {
					if (!token) {
						return null
					}
					const resp = await fetch(`${url}add_item_cart`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						},
						body: JSON.stringify(data)
					});

					if (!resp.ok) {
						throw new Error("Error receiving data!")
					}

					const result = await resp.json();
					console.log(result.data);
					alert(`Product ${result.data.name} successfully added to cart`)
					return ({ status: resp.status, msg: result.msg, data: result.data })
				} catch (err) {
					console.error('There was a problem with the fetch operation:', err);
					alert("Unable to add the product to the cart, please try again");

				}
			},
			getItemCart: async () => {
				try {
					if (!token) {
						return null
					}
					const resp = await fetch(`${url}view_cart`, {
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						}
					});
					if (!resp.ok) {
						throw new Error("Error receiving data!")
					}
					const result = await resp.json();
					setStore({ cart: result.data })

				} catch (err) {
					console.error("There was a problem with the fetch operation:", err);
					alert("The cart is empty");
				}
			},
			deleteItemCart: async (item_id) => {
				try {
					if (!token) {
						return null
					}
					const resp = await fetch(`${url}delete_item_cart/${item_id}`, {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						}
					});
					if (!resp.ok) {
						throw new Error("Error receiving data!")
					};
					const result = await resp.json();
					alert("item successfully deleted");
					return ({ msg: result.msg });

				} catch (err) {
					console.error("There was a problem with the fetch operation:", err);
					alert("item not deleted");

				}
			},
			updateItemCart: async (data) => {
				try {
					if (!token) {
						return null
					}
					const resp = await fetch(`${url}update_item_cart`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						},
						body: JSON.stringify(data)

					});
					console.log(resp);
					if (!resp.ok) {
						throw new Error("Error receiving data!")
					};
					const result = await resp.json();
					console.log(result);
					alert("Quantity updated!")
					return ({ msg: result.msg });
				} catch (err) {
					console.error("There was a problem with the fetch operation:", err);
					alert("Quantity not updated")

				}
			},
			newOrder: async () => {
				try {
					if (!token) {
						return null
					}
					const resp = await fetch(`${url}new_order`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						}
					});
					if (!resp.ok) {
						throw new Error("Error receiving data!")
					}
					const result = await resp.json();
					alert("Order successfully created");
					return ({ msg: result.msg, data: result.data });

				} catch (err) {
					console.error("There was a problem with the fetch operation:", err)
					alert("Order not created")
				}
			},
			getOrders: async () => {
				try {
					if (!token) {
						return null
					}
					const resp = await fetch(`${url}get_orders`, {
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						}
					});
					if (!resp.ok) {
						throw new Error("Error receiving data!")
					}
					const result = await resp.json();
					setStore({ orders: result })

				} catch (err) {
					console.error("There was a problem with the fetch operation:", err);
					alert("Order not obtained")

				}
			},
			newOrderDetail: async (order_id) => {
				try {
					if (!token) {
						return null
					}
					const resp = await fetch(`${url}new_order_detail`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						},
						body: JSON.stringify({ order_id })
					});
					console.log(resp);
					console.log(token);


					if (!resp.ok) {
						throw new Error("Error receiving data!");
					}
					const result = await resp.json();
					console.log(result);

					alert("Order details successfully created");
					return ({ msg: result.msg, data: result.data });
				} catch (err) {
					console.error("There was a problem with the fetch operation:", err);
					alert("Order Details Not Created");
				}

			},
			getOrderDetails: async () => {
				try {
					if (!token) {
						return null
					}
					const resp = await fetch(`${url}get_detail_orders`, {
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						}
					});
					if (!resp.ok) {
						throw new Error("Error receiving data!")
					}
					const result = await resp.json();
					setStore({ detailOrders: result.data })
				} catch (err) {
					console.error("There was a problem with the fetch operation:", err);
					alert("Order Details Not Obtained");

				}
			}


		}


	}
};


export default getState;
