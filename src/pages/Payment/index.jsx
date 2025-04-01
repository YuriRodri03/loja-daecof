import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';

function Payment() {
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState({
    pixKey: '',
    name: '',
    institution: '',
    qrCode: '',
    links: []
  });
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    course: ''
  });
  const [proof, setProof] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar informações de pagamento
  const fetchPaymentInfo = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payment`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPaymentInfo(response.data || {
        pixKey: '',
        name: '',
        institution: '',
        qrCode: '',
        links: []
      });
    } catch (error) {
      console.error('Erro ao buscar informações de pagamento:', error);
    } finally {
      setIsLoading(false);
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
      setUserInfo({
        name: response.data?.name || '',
        email: response.data?.email || '',
        phone: response.data?.phone || '',
        course: response.data?.course || ''
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      alert('Erro ao autenticar. Faça login novamente.');
      navigate('/login');
    }
  };

  const handleFileChange = (event) => {
    setProof(event.target.files[0]);
  };

  useEffect(() => {
    fetchPaymentInfo();
    fetchUserInfo();

    // Carrega os itens do carrinho do localStorage
    try {
      const items = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(items);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      setCartItems([]);
    }
  }, []);

  const handlePayment = async () => {
    if (!proof) {
      alert('Por favor, anexe o comprovante de pagamento antes de finalizar.');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert('Seu carrinho está vazio. Adicione itens antes de finalizar.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('proof', proof);
      formData.append('userName', userInfo.name);
      formData.append('userEmail', userInfo.email);
      formData.append('userPhone', userInfo.phone);
      formData.append('userCourse', userInfo.course);
      formData.append('items', JSON.stringify(cartItems));

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
        localStorage.removeItem('cart');
        navigate('/order-confirmation', {
          state: {
            orderData: {
              items: cartItems,
              total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              orderDate: new Date().toLocaleString(),
              proofName: proof.name
            }
          }
        });
      }
    } catch (error) {
      console.error('Erro ao enviar comprovante:', error.response?.data || error.message);
      alert(`Erro ao processar pagamento: ${error.response?.data?.message || 'Tente novamente mais tarde.'}`);
    }
  };

  if (isLoading) {
    return <div className="Container">Carregando...</div>;
  }

  return (
    <div className="Container">
      <h1>Pagamento</h1>
      <div className="PaymentOptions">
        <div className="PixPayment">
          <h2>Pagamento via PIX</h2>
          <p>Chave PIX: <strong>{paymentInfo.pixKey || 'Não disponível'}</strong></p>
          <p>Nome: <strong>{paymentInfo.name || 'Não disponível'}</strong></p>
          <p>Banco: <strong>{paymentInfo.institution || 'Não disponível'}</strong></p>
          {paymentInfo.qrCode && <img src={paymentInfo.qrCode} alt="QR Code para pagamento" className="QRCode" />}
        </div>
        <div className="CardPayment">
          <h2>Pagamento com Cartão</h2>
          {paymentInfo.links && paymentInfo.links.length > 0 ? (
            paymentInfo.links.map((link, index) => (
              <p key={index}>
                <strong>{index + 1} unidade{index > 0 ? 's' : ''}:</strong>{' '}
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {link}
                </a>
              </p>
            ))
          ) : (
            <p>Nenhum link de pagamento disponível no momento.</p>
          )}
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
        {cartItems.length > 0 ? (
          <>
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
          </>
        ) : (
          <p>Nenhum item no carrinho</p>
        )}
      </div>
      <button 
        className="PaymentButton" 
        onClick={handlePayment}
        disabled={!proof || cartItems.length === 0}
      >
        Finalizar Compra
      </button>
    </div>
  );
}

export default Payment;