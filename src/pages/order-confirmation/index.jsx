import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import './style.css';

function OrderConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const orderData = state?.orderData || {};

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-card">
        <h1 className="confirmation-title">Compra Finalizada com Sucesso!</h1>
        <p className="confirmation-message">Seu pedido foi processado e está sendo preparado.</p>
        
        <div className="order-details">
          <h2 className="order-details-title">Detalhes do Pedido</h2>
          
          <div className="detail-row">
            <span className="detail-label">Data:</span>
            <span className="detail-value">
              {orderData.orderDate || new Date().toLocaleString('pt-BR')}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Total:</span>
            <span className="detail-value">
              R$ {orderData.total?.toFixed(2) || '0.00'}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Comprovante:</span>
            <span className="detail-value">
              {orderData.proofName || 'Enviado com sucesso'}
            </span>
          </div>
          
          <h3 className="order-items-title">Itens do Pedido</h3>
          <ul className="order-items-list">
            {orderData.items?.map((item, index) => (
              <li key={index} className="order-item">
                <span className="item-name">
                  {item.name}
                  {item.size && <span className="item-size">Tamanho: {item.size}</span>}
                </span>
                <span className="item-quantity">{item.quantity}x</span>
                <span className="item-price">R$ {item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
  
        <button 
          className="continue-shopping-btn" 
          onClick={() => navigate('/products')}
        >
          Continuar Comprando
        </button>
      </div>
    </div>
  );
}

export default OrderConfirmation;