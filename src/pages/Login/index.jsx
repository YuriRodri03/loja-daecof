import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Biblioteca de ícones
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
      const { isAdmin } = response.data;

      // Salva o estado de admin no localStorage
      localStorage.setItem('isAdmin', isAdmin);

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
    <div className='Container'>
      <form>
        <img src={Logo} alt="Logo" className="logo" />
        <h1>Login</h1>
        <input
          placeholder='Email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="password-container">
          <input
            placeholder='Senha'
            type={showPassword ? 'text' : 'password'} // Alterna entre texto e senha
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)} // Alterna o estado
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Ícone de olho */}
          </button>
        </div>
        <button type='button' onClick={handleLogin}>
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;