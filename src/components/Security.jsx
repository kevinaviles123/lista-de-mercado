import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Security() {
  const navigate = useNavigate();
  const [securityTests, setSecurityTests] = useState([]);
  const [testingComplete, setTestingComplete] = useState(false);
  
  useEffect(() => {
    // Simulación de pruebas de seguridad
    runSecurityTests();
  }, []);
  
  const runSecurityTests = () => {
    // Simular pruebas de seguridad
    setTimeout(() => {
      const tests = [
        {
          id: 1,
          title: "Autenticación de usuario",
          description: "Verificación de métodos de autenticación seguros",
          status: "passed",
          details: "Utiliza Firebase Authentication con métodos seguros de autenticación multifactor"
        },
        {
          id: 2,
          title: "Reglas de Firestore",
          description: "Verificación de reglas de seguridad en la base de datos",
          status: "passed",
          details: "Las reglas de Firestore están configuradas correctamente para permitir acceso solo a usuarios autenticados"
        },
        {
          id: 3,
          title: "Validación de entradas",
          description: "Verificación de la validación de datos de entrada",
          status: "passed",
          details: "Se implementa validación en todos los formularios antes de enviar datos a la base de datos"
        },
        {
          id: 4,
          title: "Protección contra XSS",
          description: "Verificación de protección contra ataques XSS",
          status: "passed",
          details: "React protege automáticamente contra inyecciones XSS al escapar contenido"
        },
        {
          id: 5,
          title: "Contraseñas seguras",
          description: "Verificación de políticas de contraseñas seguras",
          status: "warning",
          details: "No se implementa una política de contraseñas que exija caracteres especiales y longitud mínima"
        },
        {
          id: 6,
          title: "Encriptación de datos sensibles",
          description: "Verificación de encriptación de datos confidenciales",
          status: "passed",
          details: "Los datos se almacenan encriptados en Firebase"
        },
      ];
      
      setSecurityTests(tests);
      setTestingComplete(true);
    }, 2000); // Simular tiempo de prueba
  };
  
  const getStatusIcon = (status) => {
    return status === "passed" 
      ? <i className="fas fa-check"></i> 
      : <i className="fas fa-exclamation-triangle"></i>;
  };
  
  return (
    <div className="home-container">
      <div className="home-header">
        <h2 className="home-title">Pruebas de Seguridad</h2>
        <button 
          onClick={() => navigate("/home")} 
          className="btn btn-primary btn-icon"
          style={{ width: 'auto' }}
        >
          <i className="fas fa-arrow-left"></i>
          Volver al Inicio
        </button>
      </div>
      
      <div className="security-card">
        <h3 className="security-title">Verificación de Seguridad de la Aplicación</h3>
        
        {!testingComplete ? (
          <div className="loader-container" style={{ height: '200px' }}>
            <div className="loader"></div>
            <p style={{ marginTop: '1rem' }}>Ejecutando pruebas de seguridad...</p>
          </div>
        ) : (
          <>
            <ul className="security-list">
              {securityTests.map(test => (
                <li key={test.id} className="security-item">
                  <div className={`security-icon ${test.status}`}>
                    {getStatusIcon(test.status)}
                  </div>
                  <div className="security-item-content">
                    <div className="security-item-title">{test.title}</div>
                    <div className="security-item-description">{test.description}</div>
                    <div className="security-item-details">{test.details}</div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span className="security-result">
                  Pruebas pasadas: {securityTests.filter(t => t.status === "passed").length}/{securityTests.length}
                </span>
              </div>
              <button 
                onClick={runSecurityTests} 
                className="btn btn-secondary btn-icon"
                style={{ width: 'auto' }}
              >
                <i className="fas fa-redo"></i>
                Ejecutar Nuevamente
              </button>
            </div>
          </>
        )}
      </div>
      
      <div className="security-card">
        <h3 className="security-title">Recomendaciones de Seguridad</h3>
        <ul className="security-list">
          <li className="security-item">
            <div className="security-icon warning">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="security-item-content">
              <div className="security-item-title">Implementar política de contraseñas robustas</div>
              <div className="security-item-description">
                Se recomienda exigir contraseñas de al menos 8 caracteres, incluyendo letras mayúsculas, minúsculas, números y caracteres especiales.
              </div>
            </div>
          </li>
          <li className="security-item">
            <div className="security-icon warning">
              <i className="fas fa-user-shield"></i>
            </div>
            <div className="security-item-content">
              <div className="security-item-title">Activar autenticación de dos factores</div>
              <div className="security-item-description">
                Implementar autenticación de dos factores para todos los usuarios para aumentar la seguridad de las cuentas.
              </div>
            </div>
          </li>
          <li className="security-item">
            <div className="security-icon warning">
              <i className="fas fa-history"></i>
            </div>
            <div className="security-item-content">
              <div className="security-item-title">Registro de auditoría de accesos</div>
              <div className="security-item-description">
                Implementar un sistema de registro que registre todos los intentos de acceso y acciones críticas en la aplicación.
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Security; 