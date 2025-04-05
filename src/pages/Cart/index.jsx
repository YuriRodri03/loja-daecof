import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [productsData, setProductsData] = useState([]);

  // Carrega os produtos e o carrinho
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products`);
        setProductsData(response.data);
        
        // Carrega o carrinho do localStorage após ter os produtos atualizados
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(savedCart);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };

    fetchProducts();
  }, []);

  // Atualiza as informações do carrinho com os dados mais recentes dos produtos
  const updatedCart = useMemo(() => {
    return cart.map(item => {
      const product = productsData.find(p => p._id === item.id);
      return product ? {
        ...item,
        name: product.name,
        price: product.price,
        image: product.image.startsWith('data:image') ? 
               product.image : 
               `${import.meta.env.VITE_BACKEND_URL}${product.image}`
      } : item;
    });
  }, [cart, productsData]);

  // Função para remover item do carrinho
  const handleRemoveItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Calcula o total
  const total = useMemo(() => {
    return updatedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [updatedCart]);

  return (
    <div className='cart-container'>
      <h1 className='cart-title'>Carrinho</h1>
      {updatedCart.length === 0 ? (
        <div className='empty-cart'>
          <p>Seu carrinho está vazio. Adicione produtos na aba de produtos!</p>
          <button onClick={() => navigate('/products')}>Voltar para Produtos</button>
        </div>
      ) : (
        <>
          <div className='cart-items'>
            {updatedCart.map((item, index) => (
              <div key={index} className='cart-item'>
                <div className='cart-item-image-container'>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className='cart-item-image' 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg'; // Imagem de fallback
                    }}
                  />
                </div>
                <div className='cart-item-details'>
                  <h2 className='cart-item-name'>{item.name}</h2>
                  <div className='cart-item-info'>
                    <p><strong>Tamanho:</strong> {item.size}</p>
                    <p><strong>Gênero:</strong> {item.gender}</p>
                    <p><strong>Quantidade:</strong> {item.quantity}</p>
                    <p><strong>Cor:</strong> {item.color}</p>
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