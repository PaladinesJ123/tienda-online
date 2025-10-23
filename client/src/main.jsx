import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AuthProvider, { useAuth } from "./context/AuthContext.jsx";
import CartProvider from "./context/CartContext.jsx";
import Home from "./pages/Home.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Orders from "./pages/Orders.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import AdminCoupons from "./pages/AdminCoupons.jsx";
import Checkout from "./pages/Checkout.jsx";
import Thanks from "./pages/Thanks.jsx";
import RequireRole from "./components/RequireRole.jsx";
import AddressBook from "./pages/AddressBook.jsx";
import "./styles.css";

function Layout() {
  const { user, logout } = useAuth();
  const isAdmin = user && (user.role==="admin" || user.role==="superadmin");

  return (
    <div className="container">
      <nav className="nav">
        <Link to="/">Tienda</Link>
        <div>
          {isAdmin && (
            <>
              <Link to="/admin/products">Admin Productos</Link>{" | "}
              <Link to="/admin/orders">Admin Pedidos</Link>{" | "}
              <Link to="/admin/coupons">Admin Cupones</Link>{" | "}
            </>
          )}
          <Link to="/orders">Mis pedidos</Link>{" | "}
          <Link to="/addresses">Mis direcciones</Link>{" | "}
          <Link to="/cart">Carrito</Link>{" | "}
          {!user ? (
            <>
              <Link to="/login">Entrar</Link>{" | "}
              <Link to="/signup">Crear cuenta</Link>
            </>
          ) : (
            <>
              <span>Hola, {user.name}</span>{" | "}
              <button onClick={logout}>Salir</button>
            </>
          )}
        </div>
      </nav>

      <Routes>
        {/* públicas */}
        <Route path="/" element={<Home/>}/>
        <Route path="/product/:id" element={<ProductDetails/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/orders" element={<Orders/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/checkout/:orderId" element={<Checkout/>}/>
        <Route path="/order/:orderId/thanks" element={<Thanks/>}/>
        <Route path="/addresses" element={<AddressBook/>}/>
        
        {/* admin */}
        <Route path="/admin/products" element={
          <RequireRole><AdminProducts/></RequireRole>
        }/>
        <Route path="/admin/orders" element={
          <RequireRole><AdminOrders/></RequireRole>
        }/>
        <Route path="/admin/coupons" element={
          <RequireRole><AdminCoupons/></RequireRole>}/>
      </Routes>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout/>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);