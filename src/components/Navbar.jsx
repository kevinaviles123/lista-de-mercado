import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 mb-4">
      <div className="container mx-auto px-4 py-2 flex flex-wrap justify-between items-center">
        <Link to="/home" className="text-indigo-600 text-xl font-bold">MercadoApp</Link>
        
        <div className="hidden md:flex space-x-4 items-center">
          <Link to="/home" className="text-gray-700 hover:text-indigo-600 px-2 py-1">
            Inicio
          </Link>
          <Link to="/security" className="text-gray-700 hover:text-indigo-600 px-2 py-1">
            Seguridad
          </Link>
          <Link to="/help" className="text-gray-700 hover:text-indigo-600 px-2 py-1">
            Ayuda
          </Link>
          <Link to="/soporte" className="text-gray-700 hover:text-indigo-600 px-2 py-1">
            Soporte Técnico
          </Link>
          <Link to="/categorias" className="text-gray-700 hover:text-indigo-600 px-2 py-1">
            Administrar Categorías
          </Link>
          <button 
            onClick={handleLogout}
            className="ml-2 text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
        
        <div className="block md:hidden">
          <button 
            onClick={handleLogout}
            className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 