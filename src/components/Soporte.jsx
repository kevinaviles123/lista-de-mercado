import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { validateFormData, sanitizeInput } from '../utils/security';

const Soporte = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar datos
    const { isValid, errors } = validateFormData(formData);
    if (!isValid) {
      setError(Object.values(errors)[0]);
      return;
    }

    // Sanitizar datos antes de enviar
    const sanitizedData = {
      nombre: sanitizeInput(formData.nombre),
      email: sanitizeInput(formData.email),
      asunto: sanitizeInput(formData.asunto),
      mensaje: sanitizeInput(formData.mensaje)
    };

    try {
      await addDoc(collection(db, 'soporte'), {
        ...sanitizedData,
        fecha: new Date(),
        estado: 'pendiente'
      });
      setSuccess('Tu mensaje ha sido enviado. Nos pondremos en contacto contigo pronto.');
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
    } catch {
      setError('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Soporte Técnico</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Asunto</label>
          <input
            type="text"
            value={formData.asunto}
            onChange={(e) => setFormData({...formData, asunto: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Mensaje</label>
          <textarea
            value={formData.mensaje}
            onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="4"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Enviar Mensaje
        </button>
      </form>
    </div>
  );
};

export default Soporte; 