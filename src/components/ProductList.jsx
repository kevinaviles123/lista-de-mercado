import React, { useState } from 'react';
import PropTypes from 'prop-types';
import EditModal from './EditModal';

const ProductList = ({ products, onDelete, onEdit }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (editedProduct) => {
    onEdit(selectedProduct.id, editedProduct);
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="product-list">
      {products.map((product) => (
        <div key={product.id} className="product-item">
          <div className="product-info">
            <span className="product-name">{product.name}</span>
            <span className="product-quantity">
              {product.quantity} {product.unit}
            </span>
          </div>
          <div className="product-actions">
            <button
              className="btn-edit"
              onClick={() => handleEditClick(product)}
            >
              Editar
            </button>
            <button
              className="btn-delete"
              onClick={() => onDelete(product.id)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleEditSave}
        product={selectedProduct}
      />
    </div>
  );
};

ProductList.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      unit: PropTypes.string.isRequired,
    })
  ).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default ProductList;