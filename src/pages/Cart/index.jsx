import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem('cart')) || [] // Carrega o carrinho do localStorage
  );

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
                  <p><strong>Preço:</strong> R$ {item.price.toFixed(2)}</p>
                </div>
                <button className='RemoveButton' onClick={() => handleRemoveItem(index)}>
                  Remover
                </button>
              </div>
            ))}
          </div>
          <div className='CartSummary'>
            <h2>Total: R$ {total.toFixed(2)}</h2>
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
