import React from 'react';
import { BrowserRouter as BrowserRouterRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import Login from './components/login'; // Create Login.js component
import Register from './components/register'; // Create Register.js component
import Logout from './components/logout';

const App = () => {

  

  return (

    
    <BrowserRouterRouter>
      <div className="App">


        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />      
        </Routes>
      </div>
    </BrowserRouterRouter>
  );
};

export default App;
