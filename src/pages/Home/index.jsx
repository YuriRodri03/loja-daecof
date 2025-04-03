import './style.css';
import Logo from '../../assets/logoda.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    curso: '',
    senha: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    nome: false,
    email: false,
    telefone: false,
    curso: false,
    senha: false
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Remove o erro quando o usuário começa a digitar
    setValidationErrors({
      ...validationErrors,
      [e.target.name]: false
    });
  };

  const handleBlur = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const errors = {
      nome: !formData.nome.trim(),
      email: !formData.email.trim(),
      telefone: !formData.telefone.trim(),
      curso: !formData.curso.trim(),
      senha: !formData.senha.trim()
    };

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };


  const handleSubmit = async () => {
    // Valida o formulário antes de enviar
    if (!validateForm()) {
      setError('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/register`, formData); // Usa a URL do backend do .env
      alert('Usuário cadastrado com sucesso!');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('Email já registrado!');
      } else {
        console.error('Erro ao cadastrar usuário:', error);
        setError('Erro ao cadastrar usuário. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <div className='home-container'>
      <div className='registration-card'>
        <img src={Logo} alt="Logo do Diretório Acadêmico" className="logo" />
        <h1>Cadastro de Usuários</h1>
        {error && <p className="error-message">{error}</p>}
        
        <div className="form-group">
          <input 
            className={`form-input ${validationErrors.nome ? 'input-error' : ''}`}
            placeholder='Nome Completo' 
            name='nome' 
            type='text' 
            value={formData.nome}
            onChange={handleChange} 
            onBlur={handleBlur}
            required
          />
          {validationErrors.nome && <span className="error-hint">Nome é obrigatório</span>}
          
          <input 
            className={`form-input ${validationErrors.email ? 'input-error' : ''}`}
            placeholder='Email' 
            name='email' 
            type='email' 
            value={formData.email}
            onChange={handleChange} 
            onBlur={handleBlur}
            required
          />
          {validationErrors.email && (
            <span className="error-hint">
              {!formData.email.trim() ? 'Email é obrigatório' : 'Email inválido'}
            </span>
          )}
          
          <input 
            className={`form-input ${validationErrors.telefone ? 'input-error' : ''}`}
            placeholder='Telefone (com DDD)' 
            name='telefone' 
            type='tel' 
            value={formData.telefone}
            onChange={handleChange} 
            onBlur={handleBlur}
            required
          />
          {validationErrors.telefone && <span className="error-hint">Telefone é obrigatório</span>}
          
          <select
            className={`form-input form-select ${validationErrors.curso ? 'input-error' : ''}`}
            name='curso'
            value={formData.curso}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          >
            <option value="">Selecione seu curso</option>
            <option value="Economia">Economia</option>
            <option value="Finanças">Finanças</option>
            <option value="Administração">Administração</option>
            <option value="Contabilidade">Contabilidade</option>
          </select>
          {validationErrors.curso && <span className="error-hint">Selecione um curso</span>}
          
          <div className="password-container">
            <input
              className={`form-input ${validationErrors.senha ? 'input-error' : ''}`}
              placeholder='Senha (mínimo 6 caracteres)'
              name='senha'
              type={showPassword ? 'text' : 'password'}
              value={formData.senha}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              minLength="6"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {validationErrors.senha && (
            <span className="error-hint">
              {!formData.senha.trim() ? 'Senha é obrigatória' : 'Mínimo 6 caracteres'}
            </span>
          )}
        </div>
        
        <button 
          className='btn btn-primary' 
          type='button' 
          onClick={handleSubmit}
          disabled={Object.values(validationErrors).some(error => error)}
        >
          Cadastrar
        </button>
        
        <div className="login-redirect">
          <p>Já possui uma conta?</p>
          <button 
            className='btn btn-secondary' 
            type='button' 
            onClick={() => navigate('/login')}
          >
            Faça login aqui
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;