import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';

function Payment() {
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState({});
  const [userInfo, setUserInfo] = useState({}); // Estado para armazenar os dados do usuário
  const [proof, setProof] = useState(null);
  const [cartItems, setCartItems] = useState();

  // Função para buscar informações de pagamento
  const fetchPaymentInfo = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payment`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Envia o token JWT
        },
      });
      setPaymentInfo(response.data || {});
    } catch (error) {
      console.error('Erro ao buscar informações de pagamento:', error);
    }
  };

  // Função para buscar os dados do usuário logado
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Garante que os campos terão valor mesmo se vierem undefined do backend
      setUserInfo({
        name: response.data?.name || '',
        email: response.data?.email || '',
        phone: response.data?.phone || '',
        course: response.data?.course || ''
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      alert('Erro ao autenticar. Faça login novamente.');
      navigate('/login'); // Redireciona para o login em caso de erro
    }
  };

  useEffect(() => {
    fetchPaymentInfo();
    fetchUserInfo();

    // 🚀 Pegue os itens do carrinho do localStorage
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(items);
  }, []);

  const handleFileChange = (event) => {
    setProof(event.target.files[0]);
  };

  const handlePayment = async () => {
    if (!proof) {
      alert('Por favor, anexe o comprovante de pagamento antes de finalizar.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('proof', proof);
      formData.append('userName', userInfo.name); // Preenche com os dados do usuário logado
      formData.append('userEmail', userInfo.email); // Preenche com os dados do usuário logado
      formData.append('userPhone', userInfo.phone);
      formData.append('userCourse', userInfo.course);
      formData.append('items', JSON.stringify(cartItems)); // Itens do pedido

      // Enviar para o servidor
      fetch('/payment/proof', {
        method: 'POST',
        body: formData
      });

      // Log para verificar os dados enviados
      console.log('Dados sendo enviados:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/payment/proof`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.status === 200) {
        alert('Pagamento realizado com sucesso! Seu pedido foi registrado.');
        localStorage.removeItem('cart'); // Limpa o carrinho após sucesso
        navigate('/products'); // Redireciona para página de confirmação
      }
    } catch (error) {
      console.error('Erro ao enviar comprovante:', error.response?.data || error.message);
      alert(`Erro ao processar pagamento: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="Container">
      <h1>Pagamento</h1>
      <div className="PaymentOptions">
        <div className="PixPayment">
          <h2>Pagamento via PIX</h2>
          <p>Chave PIX: <strong>{paymentInfo.pixKey}</strong></p>
          <p>Nome: <strong>{paymentInfo.name}</strong></p>
          <p>Banco: <strong>{paymentInfo.institution}</strong></p>
          {paymentInfo.qrCode && <img src={paymentInfo.qrCode} alt="QR Code para pagamento" className="QRCode" />}
        </div>
        <div className="CardPayment">
          <h2>Pagamento com Cartão</h2>
          {paymentInfo.links?.map((link, index) => (
            <p key={index}>
              <strong>{index + 1} unidade{index > 0 ? 's' : ''}:</strong>{' '}
              <a href={link} target="_blank" rel="noopener noreferrer">
                {link}
              </a>
            </p>
          ))}
        </div>
      </div>
      <div className="ProofUpload">
        <h2>Anexar Comprovante</h2>
        <input 
          type="file" 
          accept="image/*,application/pdf" 
          onChange={handleFileChange} 
          required
        />
        <p className="file-info">
          {proof ? `Arquivo selecionado: ${proof.name}` : 'Nenhum arquivo selecionado'}
        </p>
      </div>
      <div className="OrderSummary">
        <h3>Resumo do Pedido</h3>
        <ul>
          {cartItems.map((item, index) => (
            <li key={index}>
              {item.name} - {item.quantity}x R$ {item.price.toFixed(2)}
            </li>
          ))}
        </ul>
        <p className="total">
          Total: R$ {cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
        </p>
      </div>
      <button className="PaymentButton" onClick={handlePayment}>
        Finalizar Compra
      </button>
    </div>
  );
}

export default Payment;