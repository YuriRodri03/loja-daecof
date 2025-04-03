import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Biblioteca de ícones
import { jwtDecode } from 'jwt-decode';
import Logo from '../../assets/logoda.png';
import axios from 'axios';
import './style.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para alternar a visualização da senha

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, { email, senha }); // Usa a URL do backend do .env
      const { token } = response.data; // a const era isAdmin.

      // Salva o token JWT no localStorage
      localStorage.setItem('token', token);

      // Decodifica o token para verificar se o usuário é admin
      const decodedToken = jwtDecode(token);
      const isAdmin = decodedToken.isAdmin;

      // Redireciona com base no tipo de usuário
      if (isAdmin) {
        navigate('/admin'); // Redireciona para a página de admin
      } else {
        navigate('/products'); // Redireciona para a página de produtos
      }
    } catch (error) {
      alert('Email ou senha inválidos!');
      console.error('Erro ao fazer login:', error);
    }
  };

  return (
    <div className='login-container'>
      <div className='login-card'>
        <img src={Logo} alt="Logo" className="logo" />
        <h1>Login</h1>
        
        <div className="form-group">
          <input
            className="form-input"
            placeholder='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <div className="password-container">
            <input
              className="form-input"
              placeholder='Senha'
              type={showPassword ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
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
          
          <div className="forgot-password">
            <a href="#" onClick={(e) => { e.preventDefault(); /* Adicionar lógica de recuperação */ }}>
              Esqueci minha senha
            </a>
          </div>
        </div>
        
        <button className='btn btn-primary' type='button' onClick={handleLogin}>
          Entrar
        </button>
      </div>
    </div>
  );
}

export default Login;