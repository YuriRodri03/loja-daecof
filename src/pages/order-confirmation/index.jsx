import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './style.css';

function OrderConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const orderData = state?.orderData || {};

  // Função para formatar a data no padrão brasileiro
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleString('pt-BR');
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return new Date().toLocaleString('pt-BR');
    }
  };

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <h1 className="confirmation-title">Compra Finalizada com Sucesso!</h1>
          <div className="confirmation-icon">✓</div>
        </div>
        
        <p className="confirmation-message">Seu pedido foi processado e está sendo preparado.</p>
        
        <div className="order-details">
          <h2 className="order-details-title">
            <span className="order-icon">📋</span> Detalhes do Pedido
          </h2>
          
          <div className="detail-row">
            <span className="detail-label">Data:</span>
            <span className="detail-value">
              {formatDate(orderData.orderDate)}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Total:</span>
            <span className="detail-value">
              R$ {orderData.total?.toFixed(2).replace('.', ',') || '0,00'}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Comprovante:</span>
            <span className="detail-value">
              {orderData.proofName || 'Enviado com sucesso'}
            </span>
          </div>
          
          <h3 className="order-items-title">
            <span className="order-icon">🛍️</span> Itens do Pedido
          </h3>
          
          <div className="order-items-container">
            {orderData.items?.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  {item.size && <span className="item-size">Tamanho: {item.size}</span>}
                </div>
                <div className="item-values">
                  <span className="item-quantity">{item.quantity}x</span>
                  <span className="item-price">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          className="continue-shopping-btn" 
          onClick={() => navigate('/products')}
        >
          <span>Continuar Comprando</span>
          <span className="btn-arrow">→</span>
        </button>
      </div>
    </div>
  );
}

export default OrderConfirmation;