import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';

function Payment() {
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState({});
  const [proof, setProof] = useState(null);

  // Função para buscar informações de pagamento
  const fetchPaymentInfo = async () => {
    try {
      const response = await axios.get('http://localhost:5001/payment');
      setPaymentInfo(response.data || {});
    } catch (error) {
      console.error('Erro ao buscar informações de pagamento:', error);
    }
  };

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

  const handleFileChange = (event) => {
    setProof(event.target.files[0]);
  };

  const handlePayment = () => {
    if (!proof) {
      alert('Por favor, anexe o comprovante de pagamento antes de finalizar.');
      return;
    }

    alert('Pagamento realizado com sucesso! Seu pedido foi registrado.');
    navigate('/Products');
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