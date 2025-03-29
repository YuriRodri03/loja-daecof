const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Configuração do CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://loja-daecof.onrender.com/',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Configuração do body-parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Configuração do multer para salvar arquivos na pasta "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Criação da pasta "uploads" se não existir
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Schemas e modelos do MongoDB
const UserSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  telefone: String,
  curso: String,
  senha: String,
  isAdmin: { type: Boolean, default: false },
});
const User = mongoose.model('User', UserSchema);

const OrderSchema = new mongoose.Schema({
  items: [
    {
      name: String,
      size: String,
      gender: String,
      quantity: Number,
      price: Number,
    },
  ],
  userEmail: String,
  userPhone: String,
  userCourse: String,
  proofOfPayment: String,
  date: String,
});
const Order = mongoose.model('Order', OrderSchema);

const ProductSchema = new mongoose.Schema({
  name: String,
  sizes: [String],
  gender: [String],
  image: String,
  price: Number,
});
const Product = mongoose.model('Product', ProductSchema);

const PaymentInfoSchema = new mongoose.Schema({
  pixKey: String,
  name: String,
  institution: String,
  qrCode: String,
  links: [String],
});
const PaymentInfo = mongoose.model('PaymentInfo', PaymentInfoSchema);

// Middleware para autenticação
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send({ message: 'Token não fornecido.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).send({ message: 'Token inválido.' });
  }
};

// Middleware para verificar se o usuário é administrador
const isAdmin = (req, res, next) => {
  const isAdmin = req.body.isAdmin || req.headers['is-admin'];
  if (!isAdmin) {
    return res.status(403).send({ message: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
  }
  next();
};

// Rotas de usuários
app.post('/register', async (req, res) => {
  const { nome, email, telefone, curso, senha } = req.body;
  try {
    const isAdmin = email === process.env.ADMIN_EMAIL && senha === process.env.ADMIN_PASSWORD;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email já registrado!' });
    }
    const user = new User({ nome, email, telefone, curso, senha, isAdmin });
    await user.save();
    res.send({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).send({ message: 'Erro ao cadastrar usuário', error });
  }
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await User.findOne({ email, senha });
    if (user) {
      res.send({ isAdmin: user.isAdmin, message: 'Login bem-sucedido!' });
    } else {
      res.status(401).send({ message: 'Email ou senha inválidos!' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Erro ao fazer login', error });
  }
});

app.get('/user/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: 'Usuário não encontrado.' });
    }
    res.status(200).send({
      name: user.nome,
      email: user.email,
      phone: user.telefone,
      course: user.curso,
    });
  } catch (error) {
    res.status(500).send({ message: 'Erro ao buscar dados do usuário.', error });
  }
});

// Endpoint para receber o comprovante de pagamento
app.post('/payment/proof', upload.single('proof'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send({ message: 'Nenhum arquivo enviado.' });
    }
    const { userEmail, userPhone, userCourse, items } = req.body;
    if (!userEmail || !userPhone || !userCourse || !items) {
      return res.status(400).send({ message: 'Dados incompletos. Verifique as informações enviadas.' });
    }
    const newOrder = new Order({
      proofOfPayment: file.filename,
      date: new Date().toISOString(),
      userEmail,
      userPhone,
      userCourse,
      items: JSON.parse(items),
    });
    await newOrder.save();
    res.status(200).send({ message: 'Comprovante enviado com sucesso!', file });
  } catch (error) {
    res.status(500).send({ message: 'Erro ao processar o comprovante.', error });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});