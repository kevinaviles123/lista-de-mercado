import "./App.css";  // ✅ Importa los estilos globales
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./firebaseConfig";
import Login from "./components/Login";
import Home from "./components/Home";
import Help from "./components/Help";
import Security from "./components/Security";
import Soporte from "./components/Soporte";
import Navbar from "./components/Navbar";
import SeedCategories from "./components/SeedCategories";
import PrivateRoute from "./components/PrivateRoute";

function NavbarWrapper({ user }) {
  const location = useLocation();
  // No mostrar la barra de navegación en las rutas donde ya existe navegación
  const hideNavbar = ['/home', '/help', '/security'].includes(location.pathname);
  
  return user && !hideNavbar ? <Navbar /> : null;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="loader-container">
      <div className="loader"></div>
    </div>
  );

  return (
    <Router>
      <NavbarWrapper user={user} />
      <div className="container mx-auto mt-4">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/home" /> : <Login />} />
          <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
          <Route path="/help" element={user ? <Help /> : <Navigate to="/" />} />
          <Route path="/security" element={user ? <Security /> : <Navigate to="/" />} />
          <Route path="/soporte" element={user ? <Soporte /> : <Navigate to="/" />} />
          <Route path="/categorias" element={user ? <SeedCategories /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
