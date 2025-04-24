import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const EditModal = ({ isOpen, onClose, onSave, product }) => {
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    quantity: '',
    unit: ''
  });

  useEffect(() => {
    if (product) {
      setEditedProduct({
        name: product.name,
        quantity: product.quantity,
        unit: product.unit
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedProduct);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Editar Producto</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto
              </label>
              <input
                type="text"
                id="name"
                value={editedProduct.name}
                onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                id="quantity"
                value={editedProduct.quantity}
                onChange={(e) => setEditedProduct({ ...editedProduct, quantity: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
                min="1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                Unidad
              </label>
              <select
                id="unit"
                value={editedProduct.unit}
                onChange={(e) => setEditedProduct({ ...editedProduct, unit: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecciona una unidad</option>
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="g">Gramo</option>
                <option value="l">Litro</option>
                <option value="ml">Mililitro</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm-edit">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  product: PropTypes.shape({
    name: PropTypes.string,
    quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unit: PropTypes.string
  })
};

export default EditModal; 