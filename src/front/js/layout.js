import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";

import Home from "./pages/home";
import Signup from "./component/Signup";
import Stock from "./component/Stock";
import StockAdmin from "./component/StockAdmin";
import StockAdminUpdate from "./component/StockAdminUpdate";
import Cart from "./component/Cart";
import Payment from "./component/Payment";
import OrdersAndDetails from "./component/OrdersAndDetails";
import Details from "./component/Details";

import injectContext from "./store/appContext";

import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";


//create your first component
const Layout = () => {
    //the basename is used when your project is published in a subdirectory and not in the root of the domain
    // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
    const basename = process.env.BASENAME || "";

    if(!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL/ >;

    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <Routes>
                        <Route element={<Home />} path="/" />
                        <Route element={<Signup />} path="/signup" />
                        <Route element={<Stock />} path="/stock" />
                        <Route element={<Cart />} path="/cart" />
                        <Route element={<Payment />} path="/payment" />
                        <Route element={<StockAdmin />} path="/stock-admin" />
                        <Route element={<OrdersAndDetails />} path="/orders-details" />
                        <Route element={<StockAdminUpdate />} path="/stock-admin-update/:product_id" />
                        <Route element={<Details />} path="/details/:product_id" />

                        <Route element={<h1>Not found!</h1>} />
                    </Routes>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
