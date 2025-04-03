import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]); // Estado para armazenar os produtos
  const [selectedOptions, setSelectedOptions] = useState({}); // Estado para armazenar as opções selecionadas

  // Função para buscar produtos do backend
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products`); // Usa a URL do backend do .env
      setProducts(response.data); // Define os produtos retornados pelo backend
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  // Chama fetchProducts quando o componente monta
  useEffect(() => {
    fetchProducts();
  }, []);

  // Função para lidar com a seleção de opções (tamanho, gênero, quantidade)
  const handleOptionChange = (productId, field, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleAddToCart = (product) => {
    const options = selectedOptions[product._id] || {};
    const { size, gender, quantity } = options;

    if (!size || !gender || !quantity) {
      alert('Por favor, selecione o tamanho, gênero e quantidade.');
      return;
    }

    const newItem = {
      id: product._id, // Usa o ID do MongoDB
      name: product.name,
      size,
      gender,
      quantity: parseInt(quantity, 10),
      price: product.price,
      image: product.image,
    };

    // Adiciona o item ao localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    existingCart.push(newItem);
    localStorage.setItem('cart', JSON.stringify(existingCart));

    alert(`Produto "${product.name}" adicionado ao carrinho!`);
  };

  return (
    <div className='products-container'>
      <div className='products-header'>
        <h1 className='products-title'>Produtos</h1>
        <button className='cart-btn' onClick={() => navigate('/cart')}>
          <span>Ir para o Carrinho</span>
        </button>
      </div>

      <div className='products-grid'>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className='product-card'>
              <div className='product-image-container'>
                <img
                  src={product.image.startsWith('data:image') ?
                    product.image :
                    `${import.meta.env.VITE_BACKEND_URL}${product.image}`}
                  alt={product.name}
                  className='product-image'
                />
              </div>

              <div className='product-info'>
                <h2 className='product-name'>{product.name}</h2>
                <p className='product-price'>R$ {product.price.toFixed(2)}</p>

                <div className='product-options'>
                  <div className='option-group'>
                    <label>Tamanho:</label>
                    <select
                      className='option-select'
                      value={selectedOptions[product._id]?.size || ''}
                      onChange={(e) => handleOptionChange(product._id, 'size', e.target.value)}
                    >
                      <option value=''>Selecione</option>
                      {product.sizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='option-group'>
                    <label>Gênero:</label>
                    <select
                      className='option-select'
                      value={selectedOptions[product._id]?.gender || ''}
                      onChange={(e) => handleOptionChange(product._id, 'gender', e.target.value)}
                    >
                      <option value=''>Selecione</option>
                      {product.gender.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='option-group'>
                    <label>Quantidade:</label>
                    <input
                      className='option-input'
                      type='number'
                      min='1'
                      placeholder='0'
                      value={selectedOptions[product._id]?.quantity || ''}
                      onChange={(e) => handleOptionChange(product._id, 'quantity', e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className='add-to-cart-btn'
                  onClick={() => handleAddToCart(product)}
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className='loading-message'>Carregando produtos...</p>
        )}
      </div>
    </div>
  );
}

export default Products;