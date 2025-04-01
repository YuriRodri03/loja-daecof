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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para buscar informações de pagamento
  const fetchPaymentInfo = async () => {
    try {
      setIsLoading(true);
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
      alert('Erro ao carregar informações de pagamento. Tente recarregar a página.');
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
      
      // Debug: verificar estrutura dos dados recebidos
      console.log('Dados do usuário recebidos:', response.data);
      
      setUserInfo({
        name: response.data?.name || response.data?.nome || '',
        email: response.data?.email || '',
        phone: response.data?.phone || response.data?.telefone || '',
        course: response.data?.course || response.data?.curso || ''
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      alert('Erro ao carregar dados do usuário. Faça login novamente.');
      navigate('/login');
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Validação básica do tipo de arquivo
      if (!file.type.match('image.*') && !file.type.match('application/pdf')) {
        alert('Por favor, selecione uma imagem ou PDF.');
        return;
      }
      setProof(file);
    }
  };

  useEffect(() => {
    fetchPaymentInfo();
    fetchUserInfo();

    // Carrega os itens do carrinho do localStorage
    try {
      const items = JSON.parse(localStorage.getItem('cart')) || [];
      console.log('Itens do carrinho carregados:', items);
      setCartItems(items);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      alert('Erro ao carregar itens do carrinho. Tente novamente.');
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

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('proof', proof, proof.name); // Adicione o filename
      
      // Use os nomes de campos que o backend espera
      formData.append('nome', userInfo.name || '');
      formData.append('email', userInfo.email || '');
      formData.append('telefone', userInfo.phone || '');
      formData.append('curso', userInfo.course || '');
      
      // Envie apenas o array de itens diretamente
      formData.append('items', JSON.stringify(cartItems));
  
      // DEBUG: Verifique o FormData antes de enviar
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
      console.error('Erro ao enviar pedido:', {
        error: error.response?.data || error.message,
        config: error.config
      });
      
      let errorMessage = 'Erro ao processar pagamento. Tente novamente mais tarde.';
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Dados inválidos. Verifique as informações.';
        } else if (error.response.status === 401) {
          errorMessage = 'Sessão expirada. Faça login novamente.';
          navigate('/login');
        }
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Tempo de conexão esgotado. Verifique sua internet.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="Container">
        <div className="LoadingSpinner">
          <div className="spinner"></div>
          <p>Carregando informações de pagamento...</p>
        </div>
      </div>
    );
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
          {paymentInfo.qrCode && (
            <div className="QRCodeContainer">
              <img src={paymentInfo.qrCode} alt="QR Code para pagamento" className="QRCode" />
              <p className="QRCodeHint">Escaneie o QR Code com seu app de pagamentos</p>
            </div>
          )}
        </div>
        
        <div className="CardPayment">
          <h2>Pagamento com Cartão</h2>
          {paymentInfo.links && paymentInfo.links.length > 0 ? (
            <>
              <p className="PaymentInstructions">Selecione a quantidade de itens que deseja comprar:</p>
              {paymentInfo.links.map((link, index) => (
                <div key={index} className="PaymentLink">
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="PaymentLinkButton"
                  >
                    Pagamento para {index + 1} unidade{index > 0 ? 's' : ''}
                  </a>
                </div>
              ))}
            </>
          ) : (
            <p className="NoPaymentLinks">Nenhum link de pagamento disponível no momento.</p>
          )}
        </div>
      </div>
      
      <div className="ProofUpload">
        <h2>Anexar Comprovante</h2>
        <div className="FileUploadContainer">
          <label htmlFor="proofUpload" className="FileUploadLabel">
            {proof ? proof.name : 'Selecione o comprovante'}
          </label>
          <input
            id="proofUpload"
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            required
            className="FileUploadInput"
          />
          <p className="FileUploadHint">
            Formatos aceitos: JPG, PNG, PDF (tamanho máximo: 10MB)
          </p>
        </div>
      </div>
      
      <div className="OrderSummary">
        <h3>Resumo do Pedido</h3>
        {cartItems.length > 0 ? (
          <>
            <ul className="OrderItems">
              {cartItems.map((item, index) => (
                <li key={index} className="OrderItem">
                  <span className="ItemName">{item.name}</span>
                  <span className="ItemDetails">
                    {item.quantity}x R$ {item.price.toFixed(2)}
                  </span>
                  {item.size && <span className="ItemSize">Tamanho: {item.size}</span>}
                </li>
              ))}
            </ul>
            <div className="OrderTotal">
              <span>Total:</span>
              <span className="TotalAmount">
                R$ {cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
              </span>
            </div>
          </>
        ) : (
          <p className="EmptyCartMessage">Nenhum item no carrinho</p>
        )}
      </div>
      
      <button 
        className={`PaymentButton ${isSubmitting ? 'Submitting' : ''}`}
        onClick={handlePayment}
        disabled={!proof || cartItems.length === 0 || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="Spinner"></span>
            Processando...
          </>
        ) : (
          'Finalizar Compra'
        )}
      </button>
    </div>
  );
}

export default Payment;