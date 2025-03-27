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
      const response = await axios.get('http://localhost:5001/products');
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
    <div className='Container'>
      <button className='GoToCartButton' onClick={() => navigate('/cart')}>
        Ir para o Carrinho
      </button>
      <h1>Produtos</h1>
      <div className='Products'>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className='Product'>
              <img src={product.image} alt={product.name} className='ProductImage' />
              <h2>{product.name}</h2>
              <p><strong>Preço:</strong> R$ {product.price.toFixed(2)}</p>
              <div className='ProductOptions'>
                <div>
                  <strong>Tamanho:</strong>
                  <select
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
                <div>
                  <strong>Gênero:</strong>
                  <select
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
                <div>
                  <strong>Quantidade:</strong>
                  <input
                    type='number'
                    min='1'
                    placeholder='1'
                    value={selectedOptions[product._id]?.quantity || ''}
                    onChange={(e) => handleOptionChange(product._id, 'quantity', e.target.value)}
                  />
                </div>
              </div>
              <button onClick={() => handleAddToCart(product)}>
                Adicionar ao Carrinho
              </button>
            </div>
          ))
        ) : (
          <p>Carregando produtos...</p>
        )}
      </div>
    </div>
  );
}

export default Products;