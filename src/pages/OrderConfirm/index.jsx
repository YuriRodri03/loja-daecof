import React from 'react';
import { useLocation } from 'react-router-dom';
import './style.css';

function OrderConfirmation() {
  const { state } = useLocation();
  const orderData = state?.orderData || {};

  return (
    <div className="Container">
      <div className="ConfirmationBox">
        <h1>Compra Finalizada com Sucesso!</h1>
        <p>Seu pedido foi processado e estamos preparando para envio.</p>
        
        <div className="OrderDetails">
          <h2>Detalhes do Pedido</h2>
          <p><strong>Data:</strong> {orderData.orderDate || new Date().toLocaleString()}</p>
          <p><strong>Total:</strong> R$ {orderData.total?.toFixed(2) || '0.00'}</p>
          <p><strong>Comprovante:</strong> {orderData.proofName || 'Enviado'}</p>
          
          <h3>Itens:</h3>
          <ul className="OrderItemsList">
            {orderData.items?.map((item, index) => (
              <li key={index}>
                {item.name} - {item.quantity}x R$ {item.price.toFixed(2)}
                {item.size && ` (Tamanho: ${item.size})`}
              </li>
            ))}
          </ul>
        </div>

        <button 
          className="BackToProductsButton" 
          onClick={() => window.location.href = '/products'}
        >
          Voltar para Produtos
        </button>
      </div>
    </div>
  );
}

export default OrderConfirmation;