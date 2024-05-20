import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import ItemList from './components/ItemList';
import Cart from './components/Cart';
import './App.css';

const App = () => {
  return (
    <div className="container">
      <nav className="nav">
        <Link className="link" to="/">Products</Link>
        <Link className="link" to="/cart">Cart</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ItemList />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </div>
  );
};

export default App;
