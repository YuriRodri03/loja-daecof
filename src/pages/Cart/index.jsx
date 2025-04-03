import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem('cart')) || [] // Carrega o carrinho do localStorage
  );

  // Carrega o carrinho do localStorage quando o componente monta
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, []);

  // Função para remover item do carrinho
  const handleRemoveItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index); // Remove o item pelo índice
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart)); // Atualiza o localStorage
  };

  // Calcula o total dinamicamente sempre que o carrinho for atualizado
  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  return (
    <div className='cart-container'>
      <h1 className='cart-title'>Carrinho</h1>
      {cart.length === 0 ? (
        <div className='empty-cart'>
          <p>Seu carrinho está vazio. Adicione produtos na aba de produtos!</p>
          <button onClick={() => navigate('/products')}>Voltar para Produtos</button>
        </div>
      ) : (
        <>
          <div className='cart-items'>
            {cart.map((item, index) => (
              <div key={index} className='cart-item'>
                <div className='cart-item-image-container'>
                  <img src={item.image} alt={item.name} className='cart-item-image' />
                </div>
                <div className='cart-item-details'>
                  <h2 className='cart-item-name'>{item.name}</h2>
                  <div className='cart-item-info'>
                    <p><strong>Tamanho:</strong> {item.size}</p>
                    <p><strong>Gênero:</strong> {item.gender}</p>
                    <p><strong>Quantidade:</strong> {item.quantity}</p>
                  </div>
                  <p className='cart-item-price'>R$ {item.price.toFixed(2)}</p>
                </div>
                <button 
                  className='remove-item-btn'
                  onClick={() => handleRemoveItem(index)}
                  aria-label="Remover item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className='cart-summary'>
            <h2 className='cart-total'>
              Total: <span className='cart-total-amount'>R$ {total.toFixed(2)}</span>
            </h2>
          </div>
          
          <div className='cart-actions'>
            <button 
              className='cart-action-btn continue-shopping-btn'
              onClick={() => navigate('/products')}
            >
              Adicionar Mais Itens
            </button>
            <button 
              className='cart-action-btn checkout-btn'
              onClick={() => navigate('/payment')}
            >
              Ir para o Pagamento
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
