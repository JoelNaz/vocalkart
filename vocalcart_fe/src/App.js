import React, {Suspense} from 'react';
import { BrowserRouter as BrowserRouterRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import Login from './components/login'; // Create Login.js component
import Register from './components/register'; // Create Register.js component
import Logout from './components/logout';
import Cart from './components/Cart';
import { Toaster } from 'react-hot-toast';
import SpinnerCircular from "./components/ui/SpinnerCircular";
import SelectChoice from './components/selectChoice';
import PaymentComponent from './components/PaymentComponent';


const App = () => {

  return (
    
    <Suspense fallback={<SpinnerCircular/>}>
    <BrowserRouterRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />      
          <Route path="/cart" element={<Cart />} />
          <Route path="/choice" element={<SelectChoice />} />
          <Route path="/payment" element={<PaymentComponent/>}/>
        </Routes>
    </BrowserRouterRouter>
    <Toaster />
    </Suspense>
  );
};

export default App;
