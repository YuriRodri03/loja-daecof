import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

function Admin() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sizes: '',
    gender: '',
    image: '',
    price: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    pixKey: '',
    name: '',
    institution: '',
    qrCode: '',
    links: [],
  });

  const [newLink, setNewLink] = useState('');

  const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL, // URL do backend definida no .env
  });

  // Função para buscar produtos
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  // Função para buscar informações de pagamento
  const fetchPaymentInfo = async () => {
    try {
      const response = await api.get('/payment');
      setPaymentInfo(response.data || {});
    } catch (error) {
      console.error('Erro ao buscar informações de pagamento:', error);
    }
  };

  // Chama fetchProducts e fetchPaymentInfo quando o componente monta
  useEffect(() => {
    fetchProducts();
    fetchPaymentInfo();
  }, []);

  const addProduct = async () => {
    try {
      const base64Image = await convertToBase64(newProduct.image);

      const productData = {
        name: newProduct.name,
        sizes: newProduct.sizes,
        gender: newProduct.gender,
        price: newProduct.price,
        image: base64Image, // Envia a imagem como Base64
        isAdmin: true,
      };

      await api.post('/products', productData);
      alert('Produto adicionado com sucesso!');
      setNewProduct({ name: '', sizes: '', gender: '', image: '', price: '' });
      fetchProducts(); // Atualiza a lista de produtos
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto. Verifique os dados e tente novamente.');
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const updateProduct = async (id, updatedProduct) => {
    try {
      let base64Image = updatedProduct.image;
      
      // Se for um File object, converte para Base64
      if (updatedProduct.image instanceof File) {
        base64Image = await convertToBase64(updatedProduct.image);
      }
  
      const response = await api.put(`/products/${id}`, {
        ...updatedProduct,
        image: base64Image,
        isAdmin: true
      }, {
        headers: {
          'Content-Type': 'application/json',
          'is-admin': true
        }
      });
  
      // Atualiza o estado para mostrar a nova imagem
      setProducts(products.map(p => 
        p._id === id ? { ...p, ...response.data.product, image: base64Image || p.image } : p
      ));
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro detalhado:', error.response?.data || error.message);
      alert(`Erro ao atualizar produto: ${error.response?.data?.message || error.message}`);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`, {
        headers: {
          'is-admin': true, // Adiciona a flag de administrador nos cabeçalhos
        },
      });
      alert('Produto deletado com sucesso!');
      fetchProducts(); // Atualiza a lista de produtos após a exclusão
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      alert('Erro ao deletar produto. Tente novamente.');
    }
  };

  const updatePaymentInfo = async () => {
    try {
      await api.put('/payment', paymentInfo, {
        headers: {
          'is-admin': true,
        },
      });
      alert('Informações de pagamento atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar informações de pagamento:', error);
      alert('Erro ao atualizar informações de pagamento. Tente novamente.');
    }
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      setPaymentInfo((prev) => ({
        ...prev,
        links: [...(prev.links || []), newLink.trim()],
      }));
      setNewLink('');
    }
  };

  const handleRemoveLink = (index) => {
    setPaymentInfo((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const exportOrders = async () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione o período de tempo.');
      return;
    }

    try {
      // Formate as datas para o padrão ISO (YYYY-MM-DD)
      const formattedStart = new Date(startDate).toISOString();
      const formattedEnd = new Date(endDate).toISOString();

      console.log('Enviando datas:', formattedStart, formattedEnd); // DEBUG

      const response = await api.get('/orders/export', {
        params: {
          start: formattedStart,
          end: formattedEnd
        },
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'is-admin': true
        }
      });

      // Cria um link para download do arquivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pedidos.xlsx'); // Nome do arquivo
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao exportar pedidos:', error);
      alert('Erro ao exportar pedidos. Tente novamente.');
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Administração</h1>

      {/* Seção para adicionar produtos */}
      <section className="admin-section">
        <h2 className="section-title">Adicionar Produto</h2>
        <form className="admin-form">
          <div className="form-group">
            <label className="form-label">Nome do Produto</label>
            <input
              type="text"
              className="form-input"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tamanhos (separados por vírgula)</label>
            <input
              type="text"
              className="form-input"
              value={newProduct.sizes}
              onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gêneros (separados por vírgula)</label>
            <input
              type="text"
              className="form-input"
              value={newProduct.gender}
              onChange={(e) => setNewProduct({ ...newProduct, gender: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Preço</label>
            <input
              type="number"
              className="form-input"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Imagem do Produto</label>
            <label htmlFor="productImage" className="form-file-label">
              {newProduct.image ? newProduct.image.name : 'Selecione uma imagem'}
            </label>
            <input
              id="productImage"
              type="file"
              className="form-file-input"
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={addProduct}
          >
            Adicionar Produto
          </button>
        </form>
      </section>

      {/* Seção para editar produtos */}
      <section className="admin-section">
        <h2 className="section-title">Editar Produtos</h2>
        {products.length > 0 ? (
          <div className="products-list">
            {products.map((product) => (
              <div key={product._id} className="product-item">
                <input
                  type="text"
                  className="form-input"
                  defaultValue={product.name}
                  onBlur={(e) => updateProduct(product._id, { ...product, name: e.target.value })}
                />
                <input
                  type="number"
                  className="form-input"
                  defaultValue={product.price}
                  onBlur={(e) => updateProduct(product._id, { ...product, price: parseFloat(e.target.value) })}
                />
                <input
                  type="file"
                  id={`image-${product._id}`}
                  className="form-file-input"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      updateProduct(product._id, { ...product, image: e.target.files[0] });
                    }
                  }}
                />
                <label htmlFor={`image-${product._id}`} className="btn btn-secondary">
                  Alterar Imagem
                </label>
                <button
                  onClick={() => deleteProduct(product._id)}
                  className="btn btn-danger"
                >
                  Deletar
                </button>
                {product.image && (
                  <img
                    src={product.image.startsWith('data:image') ?
                      product.image :
                      `${import.meta.env.VITE_BACKEND_URL}${product.image}`}
                    alt="Preview"
                    className="product-image-preview"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">Nenhum produto encontrado.</p>
        )}
      </section>

      {/* Seção para editar informações de pagamento */}
      <section className="admin-section">
        <h2 className="section-title">Informações de Pagamento</h2>
        <form className="admin-form">
          <div className="form-group">
            <label className="form-label">Chave PIX</label>
            <input
              type="text"
              className="form-input"
              value={paymentInfo.pixKey || ''}
              onChange={(e) => setPaymentInfo({ ...paymentInfo, pixKey: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nome do Recebedor</label>
            <input
              type="text"
              className="form-input"
              value={paymentInfo.name || ''}
              onChange={(e) => setPaymentInfo({ ...paymentInfo, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instituição</label>
            <input
              type="text"
              className="form-input"
              value={paymentInfo.institution || ''}
              onChange={(e) => setPaymentInfo({ ...paymentInfo, institution: e.target.value })}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">QR Code PIX</label>
            <label htmlFor="qrCode" className="form-file-label">
              {paymentInfo.qrCode ? 'Imagem selecionada' : 'Selecione uma imagem'}
            </label>
            <input
              id="qrCode"
              type="file"
              className="form-file-input"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const base64Image = await convertToBase64(file);
                  setPaymentInfo({ ...paymentInfo, qrCode: base64Image });
                }
              }}
            />
          </div>

          <div className="form-group full-width">
            <h3 className="section-title" style={{ fontSize: '1.2rem' }}>Links de Pagamento</h3>
            <ul className="payment-links-list">
              {paymentInfo.links?.map((link, index) => (
                <li key={index} className="payment-link-item">
                  <span className="payment-link-text">{link}</span>
                  <button
                    onClick={() => handleRemoveLink(index)}
                    className="btn btn-danger"
                    style={{ padding: '0.25rem 0.5rem' }}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Novo link de pagamento"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddLink}
              >
                Adicionar
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary full-width"
            onClick={updatePaymentInfo}
          >
            Salvar Informações
          </button>
        </form>
      </section>

      {/* Seção para exportar pedidos */}
      <section className="admin-section">
        <h2 className="section-title">Exportar Pedidos</h2>
        <form className="export-form">
          <div className="form-group">
            <label className="form-label">Data de Início</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Data de Fim</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={exportOrders}
          >
            Exportar para Excel
          </button>
        </form>
      </section>
    </div>
  );
}

export default Admin;