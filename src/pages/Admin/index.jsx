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
    const formData = new FormData();
    formData.append('name', updatedProduct.name);
    formData.append('sizes', updatedProduct.sizes.join(','));
    formData.append('gender', updatedProduct.gender.join(','));
    formData.append('price', updatedProduct.price);
    if (updatedProduct.image) {
      formData.append('image', updatedProduct.image); // Adiciona o arquivo de imagem, se enviado
    }
    formData.append('isAdmin', true);

    try {
      await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'is-admin': true, // Adiciona a flag de administrador nos cabeçalhos
        },
      });
      alert('Produto atualizado com sucesso!');
      fetchProducts(); // Atualiza a lista de produtos após a edição
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
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
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/export`, {
          params: { start: startDate, end: endDate },
          responseType: 'blob', // Para lidar com o arquivo Excel
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
    <div className="AdminContainer">
      <h1>Administração</h1>

      {/* Seção para adicionar produtos */}
      <h2>Adicionar Produto</h2>
      <div className="AddProduct">
        <input
          type="text"
          placeholder="Nome do Produto"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Tamanhos (separados por vírgula)"
          value={newProduct.sizes}
          onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
        />
        <input
          type="text"
          placeholder="Gêneros (separados por vírgula)"
          value={newProduct.gender}
          onChange={(e) => setNewProduct({ ...newProduct, gender: e.target.value })}
        />
        <input
          type="file"
          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
        />
        <input
          type="number"
          placeholder="Preço"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        />
        <button onClick={addProduct}>Adicionar Produto</button>
      </div>

      {/* Seção para editar produtos */}
      <h2>Editar Produtos</h2>
      {products.length > 0 ? (
        products.map((product) => (
          <div key={product._id} className="ProductEdit">
            <input
              type="text"
              defaultValue={product.name}
              onBlur={(e) => updateProduct(product._id, { ...product, name: e.target.value })}
            />
            <input
              type="number"
              defaultValue={product.price}
              onBlur={(e) => updateProduct(product._id, { ...product, price: parseFloat(e.target.value) })}
            />
            <input
              type="file"
              onChange={(e) => updateProduct(product._id, { ...product, image: e.target.files[0] })}
            />
            <button onClick={() => deleteProduct(product._id)} className="DeleteButton">
              Deletar Produto
            </button>
          </div>
        ))
      ) : (
        <p>Nenhum produto encontrado.</p>
      )}

      {/* Seção para editar informações de pagamento */}
      <h2>Editar Informações de Pagamento</h2>
      <div className="EditPaymentInfo">
        <input
          type="text"
          placeholder="Chave PIX"
          value={paymentInfo.pixKey || ''}
          onChange={(e) => setPaymentInfo({ ...paymentInfo, pixKey: e.target.value })}
        />
        <input
          type="text"
          placeholder="Nome do Recebedor"
          value={paymentInfo.name || ''}
          onChange={(e) => setPaymentInfo({ ...paymentInfo, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Instituição"
          value={paymentInfo.institution || ''}
          onChange={(e) => setPaymentInfo({ ...paymentInfo, institution: e.target.value })}
        />
        <input
          type="file"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (file) {
              const base64Image = await convertToBase64(file);
              setPaymentInfo({ ...paymentInfo, qrCode: base64Image });
            }
          }}
        />
        <h3>Links de Pagamento</h3>
        <ul>
          {paymentInfo.links?.map((link, index) => (
            <li key={index}>
              {link}{' '}
              <button onClick={() => handleRemoveLink(index)}>Remover</button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="Adicionar novo link"
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
        />
        <button onClick={handleAddLink}>Adicionar Link</button>
        <button onClick={updatePaymentInfo}>Salvar Informações de Pagamento</button>
      </div>
      {/* Seção para exportar pedidos */}
      <h2>Exportar Pedidos</h2>
      <div className="ExportOrders">
        <label>
          Data de Início:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          Data de Fim:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={exportOrders}>Exportar para Excel</button>
      </div>
    </div>
  );
}

export default Admin;