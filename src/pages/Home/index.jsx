import './style.css';
import Logo from '../../assets/logoda.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

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
      await axios.post('http://localhost:5001/register', formData);
      alert('Usuário cadastrado com sucesso!');
      navigate('/products');
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
        <input placeholder='Senha' name='senha' type='password' onChange={handleChange} onBlur={handleBlur} />
        <button type='button' onClick={handleSubmit}>Cadastrar</button>
        <button type='button' onClick={() => navigate('/login')}>Já tenho login</button>
      </form>
    </div>
  );
}

export default Home;