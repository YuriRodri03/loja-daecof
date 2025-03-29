import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';

function Payment() {
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState({});
  const [userInfo, setUserInfo] = useState({}); // Estado para armazenar os dados do usuário
  const [proof, setProof] = useState(null);

  // Função para buscar informações de pagamento
  const fetchPaymentInfo = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payment`);
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
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Envia o token de autenticação
        },
      });
      setUserInfo(response.data || {});
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  useEffect(() => {
    fetchPaymentInfo();
    fetchUserInfo(); // Busca os dados do usuário ao carregar a página
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
      formData.append('userEmail', userInfo.email); // Preenche com os dados do usuário logado
      formData.append('userPhone', userInfo.phone);
      formData.append('userCourse', userInfo.course);
      formData.append('items', JSON.stringify(paymentInfo.items)); // Itens do pedido

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payment/proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Envia o token de autenticação
        },
      });

      alert('Pagamento realizado com sucesso! Seu pedido foi registrado.');
      navigate('/products');
    } catch (error) {
      console.error('Erro ao enviar comprovante de pagamento:', error);
      alert('Erro ao processar o pagamento. Tente novamente.');
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
        <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
      </div>
      <button className="PaymentButton" onClick={handlePayment}>
        Finalizar Compra
      </button>
    </div>
  );
}

export default Payment;