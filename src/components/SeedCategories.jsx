import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const SeedCategories = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const categoriesData = [
    // Alimentos - Frescos y Perecederos
    { name: 'Frutas', type: 'alimento', group: 'Frescos y Perecederos', icon: 'fa-apple-alt' },
    { name: 'Verduras', type: 'alimento', group: 'Frescos y Perecederos', icon: 'fa-carrot' },
    { name: 'Carnes', type: 'alimento', group: 'Frescos y Perecederos', icon: 'fa-drumstick-bite' },
    { name: 'Pescados', type: 'alimento', group: 'Frescos y Perecederos', icon: 'fa-fish' },
    { name: 'Lácteos', type: 'alimento', group: 'Frescos y Perecederos', icon: 'fa-cheese' },
    
    // Alimentos - Procesados y Envasados
    { name: 'Conservas', type: 'alimento', group: 'Procesados y Envasados', icon: 'fa-jar' },
    { name: 'Embutidos', type: 'alimento', group: 'Procesados y Envasados', icon: 'fa-bacon' },
    { name: 'Comidas Preparadas', type: 'alimento', group: 'Procesados y Envasados', icon: 'fa-utensils' },
    { name: 'Sopas Instantáneas', type: 'alimento', group: 'Procesados y Envasados', icon: 'fa-bowl-food' },
    
    // Alimentos - Congelados
    { name: 'Vegetales Congelados', type: 'alimento', group: 'Congelados', icon: 'fa-snowflake' },
    { name: 'Comidas Congeladas', type: 'alimento', group: 'Congelados', icon: 'fa-snowflake' },
    { name: 'Mariscos Congelados', type: 'alimento', group: 'Congelados', icon: 'fa-snowflake' },
    { name: 'Postres Congelados', type: 'alimento', group: 'Congelados', icon: 'fa-ice-cream' },
    
    // Alimentos - Panadería y Repostería
    { name: 'Pan', type: 'alimento', group: 'Panadería y Repostería', icon: 'fa-bread-slice' },
    { name: 'Bollería', type: 'alimento', group: 'Panadería y Repostería', icon: 'fa-cookie' },
    { name: 'Pasteles', type: 'alimento', group: 'Panadería y Repostería', icon: 'fa-cake-candles' },
    { name: 'Galletas', type: 'alimento', group: 'Panadería y Repostería', icon: 'fa-cookie-bite' },
    
    // Alimentos - Cereales y Granos
    { name: 'Arroz', type: 'alimento', group: 'Cereales y Granos', icon: 'fa-wheat' },
    { name: 'Pastas', type: 'alimento', group: 'Cereales y Granos', icon: 'fa-wheat' },
    { name: 'Legumbres', type: 'alimento', group: 'Cereales y Granos', icon: 'fa-seedling' },
    { name: 'Cereales Desayuno', type: 'alimento', group: 'Cereales y Granos', icon: 'fa-wheat' },
    
    // Alimentos - Bebidas
    { name: 'Jugos', type: 'alimento', group: 'Bebidas', icon: 'fa-glass-water' },
    { name: 'Refrescos', type: 'alimento', group: 'Bebidas', icon: 'fa-bottle-water' },
    { name: 'Agua Embotellada', type: 'alimento', group: 'Bebidas', icon: 'fa-bottle-water' },
    { name: 'Bebidas Energéticas', type: 'alimento', group: 'Bebidas', icon: 'fa-bolt' },
    { name: 'Bebidas Alcohólicas', type: 'alimento', group: 'Bebidas', icon: 'fa-wine-bottle' },
    
    // Alimentos - Snacks y Dulces
    { name: 'Chocolates', type: 'alimento', group: 'Snacks y Dulces', icon: 'fa-candy-bar' },
    { name: 'Galletitas', type: 'alimento', group: 'Snacks y Dulces', icon: 'fa-cookie' },
    { name: 'Papas Fritas', type: 'alimento', group: 'Snacks y Dulces', icon: 'fa-french-fries' },
    { name: 'Aperitivos', type: 'alimento', group: 'Snacks y Dulces', icon: 'fa-pizza-slice' },
    
    // Productos de Aseo - Limpieza del Hogar
    { name: 'Detergentes', type: 'limpieza', group: 'Limpieza del Hogar', icon: 'fa-jug-detergent' },
    { name: 'Limpiadores Multiusos', type: 'limpieza', group: 'Limpieza del Hogar', icon: 'fa-spray-can-sparkles' },
    { name: 'Desinfectantes', type: 'limpieza', group: 'Limpieza del Hogar', icon: 'fa-spray-can' },
    { name: 'Productos para Pisos', type: 'limpieza', group: 'Limpieza del Hogar', icon: 'fa-broom' },
    { name: 'Productos para Baños', type: 'limpieza', group: 'Limpieza del Hogar', icon: 'fa-toilet' },
    
    // Productos de Aseo - Cuidado Personal
    { name: 'Jabones', type: 'limpieza', group: 'Cuidado Personal', icon: 'fa-soap' },
    { name: 'Champús', type: 'limpieza', group: 'Cuidado Personal', icon: 'fa-pump-soap' },
    { name: 'Acondicionadores', type: 'limpieza', group: 'Cuidado Personal', icon: 'fa-pump-soap' },
    { name: 'Cremas', type: 'limpieza', group: 'Cuidado Personal', icon: 'fa-jar' },
    { name: 'Desodorantes', type: 'limpieza', group: 'Cuidado Personal', icon: 'fa-spray-can' },
    { name: 'Pastas Dentales', type: 'limpieza', group: 'Cuidado Personal', icon: 'fa-tooth' },
    
    // Productos de Aseo - Productos Especializados
    { name: 'Limpiadores para Vidrios', type: 'limpieza', group: 'Productos Especializados', icon: 'fa-spray-can' },
    { name: 'Antiincrustantes', type: 'limpieza', group: 'Productos Especializados', icon: 'fa-brush' },
    { name: 'Esponjas', type: 'limpieza', group: 'Productos Especializados', icon: 'fa-sponge' },
    { name: 'Paños', type: 'limpieza', group: 'Productos Especializados', icon: 'fa-rag' },
    { name: 'Escobas', type: 'limpieza', group: 'Productos Especializados', icon: 'fa-broom' },
  ];

  const addCategories = async () => {
    setLoading(true);
    setStatus('Añadiendo categorías...');
    
    try {
      let added = 0;
      
      for (const category of categoriesData) {
        // Verificar si la categoría ya existe
        const q = query(collection(db, 'categories'), where('name', '==', category.name));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // Añadir solo si no existe
          await addDoc(collection(db, 'categories'), {
            ...category,
            createdAt: new Date()
          });
          added++;
        }
      }
      
      setStatus(`Proceso completado. Se añadieron ${added} categorías nuevas.`);
    } catch (error) {
      console.error('Error al añadir categorías:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4">Agregar Categorías Predefinidas</h2>
      
      <button 
        onClick={addCategories}
        disabled={loading}
        className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Procesando...' : 'Agregar Categorías Detalladas'}
      </button>
      
      {status && (
        <div className="mt-3 p-3 bg-blue-50 text-blue-700 rounded-md">
          {status}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Categorías Incluidas:</h3>
        
        <div className="mb-4">
          <h4 className="font-medium text-indigo-700">Alimentos</h4>
          <ul className="ml-5 list-disc">
            <li>Frescos y Perecederos: Frutas, verduras, carnes, pescados y lácteos.</li>
            <li>Procesados y Envasados: Conservas, embutidos, comidas preparadas y sopas instantáneas.</li>
            <li>Congelados: Vegetales, comidas preparadas, mariscos y postres congelados.</li>
            <li>Panadería y Repostería: Pan, bollería, pasteles y galletas.</li>
            <li>Cereales y Granos: Arroz, pastas, legumbres y cereales para desayuno.</li>
            <li>Bebidas: Jugos, refrescos, agua embotellada, bebidas energéticas y alcohólicas.</li>
            <li>Snacks y Dulces: Chocolates, galletitas, papas fritas y aperitivos.</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-green-700">Productos de Aseo</h4>
          <ul className="ml-5 list-disc">
            <li>Limpieza del Hogar: Detergentes, limpiadores multiusos, desinfectantes, productos para pisos y baños.</li>
            <li>Cuidado Personal: Jabones, champús, acondicionadores, cremas, desodorantes y pastas dentales.</li>
            <li>Productos Especializados: Limpiadores para vidrios, antiincrustantes y utensilios de limpieza.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SeedCategories; 