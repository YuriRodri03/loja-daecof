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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBlur = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/register`, formData); // Usa a URL do backend do .env
      alert('Usuário cadastrado com sucesso!');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('Email já registrado!');
      } else {
        console.error('Erro ao cadastrar usuário:', error);
      }
    }
  };

  return (
    <div className='Container'>
      <form>
        <img src={Logo} alt="Logo" className="logo" />
        <h1>Cadastro de Usuários</h1>
        {error && <p className="error">{error}</p>}
        <input placeholder='Nome' name='nome' type='text' onChange={handleChange} onBlur={handleBlur} />
        <input placeholder='Email' name='email' type='email' onChange={handleChange} onBlur={handleBlur} />
        <input placeholder='Telefone' name='telefone' type='number' onChange={handleChange} onBlur={handleBlur} />
        <select name='curso' onChange={handleChange} onBlur={handleBlur} className='input'>
          <option value=''>Selecione um curso</option>
          <option value='Economia'>Economia</option>
          <option value='Finanças'>Finanças</option>
        </select>
        <div className="password-container">
          <input
            placeholder='Senha'
            name='senha'
            type={showPassword ? 'text' : 'password'} // Alterna entre texto e senha
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)} // Alterna o estado
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Ícone de olho */}
          </button>
        </div>
        <button type='button' onClick={handleSubmit}>Cadastrar</button>
        <button type='button' onClick={() => navigate('/login')}>Já tenho login</button>
      </form>
    </div>
  );
}

export default Home;