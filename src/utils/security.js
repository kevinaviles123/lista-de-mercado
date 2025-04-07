// Función para sanitizar entradas de usuario
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    // Eliminar etiquetas HTML
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  };
  
  // Función para validar datos de formulario
  export const validateFormData = (data) => {
    const errors = {};
    
    // Validar email
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Email inválido';
    }
    
    // Validar campos vacíos
    for (const key in data) {
      if (data[key] === '') {
        errors[key] = `El campo ${key} es obligatorio`;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }; 
  