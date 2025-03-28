import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem('cart')) || [] // Carrega o carrinho do localStorage
  );

  const handleRemoveItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1); // Remove o item pelo índice
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart)); // Atualiza o localStorage

    const calculateTotal = () => {
      return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };
  };

  return (
    <div className='Container'>
      <h1>Carrinho</h1>
      {cart.length === 0 ? (
        <div className='EmptyCart'>
          <p>Seu carrinho está vazio. Adicione produtos na aba de produtos!</p>
          <button onClick={() => navigate('/products')}>Voltar para Produtos</button>
        </div>
      ) : (
        <>
          <div className='CartItems'>
            {cart.map((item, index) => (
              <div key={index} className='CartItem'>
                <img src={item.image} alt={item.name} className='CartItemImage' />
                <div className='CartItemDetails'>
                  <h2>{item.name}</h2>
                  <p><strong>Tamanho:</strong> {item.size}</p>
                  <p><strong>Gênero:</strong> {item.gender}</p>
                  <p><strong>Quantidade:</strong> {item.quantity}</p>
                </div>
                <button
                  className='RemoveButton'
                  onClick={() => handleRemoveItem(index)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
          <div className='CartActions'>
            <button className='AddMoreButton' onClick={() => navigate('/products')}>
              Adicionar Mais Itens
            </button>
            <button className='CheckoutButton' onClick={() => navigate('/payment')}>
              Ir para o Pagamento
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;