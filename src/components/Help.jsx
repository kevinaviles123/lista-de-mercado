import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Help() {
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm({
      ...contactForm,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      return alert("Por favor complete todos los campos");
    }
    
    try {
      await addDoc(collection(db, "support_requests"), {
        ...contactForm,
        createdAt: new Date(),
        status: "pending"
      });
      setSubmitted(true);
      setContactForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      alert("Hubo un error al enviar tu solicitud. Por favor intenta nuevamente.");
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h2 className="home-title">Centro de Ayuda</h2>
        <button 
          onClick={() => navigate("/home")} 
          className="btn btn-primary btn-icon"
          style={{ width: 'auto' }}
        >
          <i className="fas fa-arrow-left"></i>
          Volver al Inicio
        </button>
      </div>

      <div className="product-form">
        <h3 className="form-title">Preguntas Frecuentes</h3>
        
        <div className="faq-container">
          <div className="faq-item">
            <h4><i className="fas fa-question-circle"></i> ¿Cómo agrego un nuevo producto?</h4>
            <p>Ve a la página principal, completa el formulario con los detalles del producto y haz clic en "Agregar Producto".</p>
          </div>
          
          <div className="faq-item">
            <h4><i className="fas fa-question-circle"></i> ¿Cómo actualizo el precio de un producto?</h4>
            <p>En la lista de productos, haz clic en el botón "Actualizar" junto al producto que deseas modificar.</p>
          </div>
          
          <div className="faq-item">
            <h4><i className="fas fa-question-circle"></i> ¿Cómo puedo ver el historial de precios?</h4>
            <p>En la sección de análisis, selecciona el producto y podrás ver un gráfico con el historial de precios por mes.</p>
          </div>
          
          <div className="faq-item">
            <h4><i className="fas fa-question-circle"></i> ¿Cómo desactivo un producto?</h4>
            <p>En la lista de productos, usa el botón "Desactivar" para ocultar temporalmente un producto de la lista principal.</p>
          </div>
          
          <div className="faq-item">
            <h4><i className="fas fa-question-circle"></i> ¿Puedo exportar mi lista de compras?</h4>
            <p>Actualmente estamos trabajando en esta funcionalidad. Estará disponible en futuras actualizaciones.</p>
          </div>
        </div>
      </div>

      <div className="product-form">
        <h3 className="form-title">Contáctanos</h3>
        
        {submitted ? (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <p>¡Gracias por tu mensaje! Te responderemos a la brevedad.</p>
            <button 
              onClick={() => navigate("/home")} 
              className="btn btn-secondary btn-icon" 
              style={{ maxWidth: '250px', marginTop: '20px' }}
            >
              <i className="fas fa-home"></i>
              Volver a la Página Principal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group">
                <div className="input-with-icon">
                  <i className="fas fa-user"></i>
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Tu nombre" 
                    className="input-field"
                    value={contactForm.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="input-group">
                <div className="input-with-icon">
                  <i className="fas fa-envelope"></i>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Tu correo electrónico" 
                    className="input-field"
                    value={contactForm.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="input-group">
              <div className="input-with-icon">
                <i className="fas fa-comment"></i>
                <textarea 
                  name="message"
                  placeholder="¿Cómo podemos ayudarte?" 
                  className="input-field" 
                  rows="4"
                  value={contactForm.message}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="btn btn-secondary btn-icon" style={{ maxWidth: '200px' }}>
                <i className="fas fa-paper-plane"></i>
                Enviar Mensaje
              </button>
              
              <button 
                type="button"
                onClick={() => navigate("/home")} 
                className="btn btn-primary btn-icon" 
                style={{ maxWidth: '200px' }}
              >
                <i className="fas fa-arrow-left"></i>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Help;