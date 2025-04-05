const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://loja-daecof.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Permite envio de cookies, se necessário
}));

// Configura o body-parser para aceitar tamanhos maiores
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Configuração do multer para salvar imagens na pasta "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pasta onde as imagens serão salvas
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nome único para cada arquivo
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Schema e modelo do usuário
const UserSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  telefone: String,
  curso: String,
  senha: String,
  isAdmin: { type: Boolean, default: false }, // Define se o usuário é admin
});

const User = mongoose.model('User', UserSchema);

// Schema e modelo para pedidos
const OrderSchema = new mongoose.Schema({
  items: {
    type: [{
      name: { type: String, required: true },
      size: String,
      gender: String,
      color: String,
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 }
    }],
    required: true,
    validate: [array => array.length > 0, 'O pedido deve conter pelo menos um item']
  },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true, match: /.+\@.+\..+/ },
  userPhone: String,
  userCourse: String,
  proofOfPayment: { type: String, required: true },
  date: { type: Date, default: Date.now },
  total: { type: Number, required: true, min: 0 }
});

const Order = mongoose.model('Order', OrderSchema);

// Schema e modelo para produtos
const ProductSchema = new mongoose.Schema({
  name: String,
  sizes: [String],
  gender: [String],
  colors: [String],
  image: String,
  price: Number,
});

const Product = mongoose.model('Product', ProductSchema);

// Schema e modelo para informações de pagamento
const PaymentInfoSchema = new mongoose.Schema({
  pixKey: String,
  name: String,
  institution: String,
  qrCode: String, // URL ou caminho para a imagem do QR Code
  links: [String], // Links de pagamento
});

const PaymentInfo = mongoose.model('PaymentInfo', PaymentInfoSchema);

// Middleware para verificar se o usuário é administrador
const isAdmin = (req, res, next) => {
  const isAdmin = req.body.isAdmin || req.headers['is-admin']; // Verifica no corpo ou no cabeçalho
  if (!isAdmin) {
    return res.status(403).send({ message: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
  }
  next();
};

// Rota para registrar usuários
app.post('/register', async (req, res) => {
  const { nome, email, telefone, curso, senha } = req.body;

  try {
    // Verifica se o email e a senha correspondem ao admin
    const isAdmin = email === process.env.ADMIN_EMAIL && senha === process.env.ADMIN_PASSWORD;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email já registrado!' });
    }

    // Criptografa a senha antes de salvar no banco de dados
    const hashedPassword = bcrypt.hashSync(senha, 10);

    const user = new User({ nome, email, telefone, curso, senha: hashedPassword, isAdmin });
    await user.save();
    res.send({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).send({ message: 'Erro ao cadastrar usuário', error });
  }
});

// Rota para login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    console.log('Tentando encontrar o usuário com email:', email);
    const user = await User.findOne({ email });

    if (!user) {
      console.log('Usuário não encontrado.');
      return res.status(401).send({ message: 'Email ou senha inválidos!' });
    }

    console.log('Usuário encontrado:', user);

    if (!bcrypt.compareSync(senha, user.senha)) {
      console.log('Senha inválida.');
      return res.status(401).send({ message: 'Email ou senha inválidos!' });
    }

    console.log('Senha válida. Gerando token...');

    // Gera o token JWT
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Token gerado com sucesso.');
    res.send({ isAdmin: user.isAdmin, token, message: 'Login bem-sucedido!' });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).send({ message: 'Erro ao fazer login', error });
  }
});

// Rota para obter todos os usuários
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: 'Erro ao obter usuários', error });
  }
});

// Middleware de autenticação
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extrai o token do cabeçalho Authorization
  if (!token) {
    return res.status(401).send({ message: 'Token não fornecido.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica o token
    req.userId = decoded.id; // Adiciona o userId ao req
    next();
  } catch (error) {
    res.status(401).send({ message: 'Token inválido.' });
  }
};

// Endpoint para obter os dados do usuário logado
app.get('/user/profile', authenticate, async (req, res) => {
  const { email } = req.query; // O email é enviado como um parâmetro de consulta
  try {
    const user = await User.findById(req.userId); // Busca o usuário pelo ID extraído do token

    if (!user) {
      return res.status(404).send({ message: 'Usuário não encontrado.' });
    }

    res.status(200).send({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      curso: user.curso,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).send({ message: 'Erro ao buscar dados do usuário.' });
  }
});

// Rota para salvar pedidos
app.post('/create-order', async (req, res) => {
  const { items, proofOfPayment, date, userName, userEmail, userPhone, userCourse } = req.body;

  try {
    const newOrder = new Order({
      ...req.body,
      date: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        userName,
        userEmail,
        userPhone,
        userCourse,
        items,
        proofOfPayment,
      }),
    });

    await newOrder.save();
    res.status(201).send({ message: 'Pedido salvo com sucesso!' });
  } catch (error) {
    res.status(500).send({ message: 'Erro ao salvar pedido', error });
  }
});

// Rota para obter um produto pelo ID
app.get('/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id); // Busca o produto pelo ID
    if (!product) {
      return res.status(404).send({ message: 'Produto não encontrado!' });
    }
    res.send(product);
  } catch (error) {
    res.status(500).send({ message: 'Erro ao obter produto', error });
  }
});

// Rota para adicionar um produto (apenas para administradores)
app.post('/products', isAdmin, async (req, res) => {
  const { name, sizes, gender, price, image } = req.body;

  try {
    const newProduct = new Product({
      name,
      sizes: sizes.split(',').map(s => s.trim()), // Converte a string de tamanhos em um array
      gender: gender.split(',').map(g => g.trim()), // Converte a string de gêneros em um array
      colors: colors.split(',').map(c => c.trim()),
      image, // Salva a imagem como Base64
      price,
    });
    await newProduct.save();
    res.status(201).send({ message: 'Produto criado com sucesso!', product: newProduct });
  } catch (error) {
    res.status(500).send({ message: 'Erro ao criar produto', error });
  }
});

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Rota para obter todos os produtos
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (error) {
    res.status(500).send({ message: 'Erro ao obter produtos', error });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota para atualizar um produto (apenas para administradores)
app.put('/products/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, sizes, gender, colors, price, image } = req.body;

  try {
    // Validação do ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'ID do produto inválido' });
    }

    const updateData = {
      name,
      sizes: typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()) : sizes,
      gender: typeof gender === 'string' ? gender.split(',').map(g => g.trim()) : gender,
      colors: typeof colors === 'string' ? colors.split(',').map(c => c.trim()) : colors,
      price,
    };

    if (image && (image.startsWith('data:image') || image.startsWith('http'))) {
      updateData.image = image;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).send({ message: 'Produto não encontrado' });
    }

    res.send({
      message: 'Produto atualizado com sucesso',
      product
    });
  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).send({
      message: 'Erro ao atualizar produto',
      error: error.message
    });
  }
});

// Rota para atualizar informações de pagamento
app.put('/payment', isAdmin, async (req, res) => {
  const paymentInfo = req.body;

  try {
    await PaymentInfo.findOneAndUpdate({}, paymentInfo, { upsert: true });
    res.send({ message: 'Informações de pagamento atualizadas com sucesso!' });
  } catch (error) {
    res.status(500).send({ message: 'Erro ao atualizar informações de pagamento', error });
  }
});

// Rota para obter informações de pagamento
app.get('/payment', async (req, res) => {
  try {
    const paymentInfo = await PaymentInfo.findOne();
    res.send(paymentInfo);
  } catch (error) {
    res.status(500).send({ message: 'Erro ao obter informações de pagamento', error });
  }
});

// Rota para exportar pedidos para Excel
app.get('/orders/export', authenticate, async (req, res) => {
  try {
    const { start, end } = req.query;

    console.log('Datas recebidas:', start, end); // DEBUG

    // Validação das datas
    if (!start || !end) {
      return res.status(400).send({ message: 'Datas de início e fim são obrigatórias' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Ajusta para incluir todo o dia final
    endDate.setHours(23, 59, 59, 999);

    console.log('Consultando pedidos entre:', startDate, 'e', endDate); // DEBUG

    const orders = await Order.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).lean();

    console.log(`Pedidos encontrados: ${orders.length}`); // DEBUG

    if (orders.length === 0) {
      // Verificação adicional para ver se há pedidos no banco
      const totalOrders = await Order.countDocuments({});
      return res.status(404).json({
        message: 'Nenhum pedido encontrado no período especificado',
        totalOrdersInDB: totalOrders,
        suggestion: totalOrders > 0 ? 'Verifique o intervalo de datas' : 'Nenhum pedido encontrado no banco de dados'
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pedidos');

    worksheet.columns = [
      { header: 'Data', key: 'date', width: 20 },
      { header: 'Cliente', key: 'userName', width: 25 },
      { header: 'Email', key: 'userEmail', width: 30 },
      { header: 'Telefone', key: 'userPhone', width: 20 },
      { header: 'Curso', key: 'userCourse', width: 20 },
      { header: 'Produto', key: 'productName', width: 30 },
      { header: 'Gênero', key: 'gender', width: 15 },
      { header: 'Tamanho', key: 'size', width: 15 },
      { header: 'Cor', key: 'color', width: 15 },
      { header: 'Quantidade', key: 'quantity', width: 15 },
      { header: 'Preço Unitário', key: 'price', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Comprovante', key: 'proof', width: 20 }
    ];

    orders.forEach(order => {
      order.items.forEach(item => {
        worksheet.addRow({
          date: new Date(order.date).toLocaleString(),
          userName: order.userName,
          userEmail: order.userEmail,
          userPhone: order.userPhone,
          userCourse: order.userCourse,
          productName: item.name,
          gender: item.gender,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          proof: order.proofOfPayment
        });
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=pedidos_${start}_${end}.xlsx`');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).send({ message: 'Erro ao exportar pedidos', error });
  }
});

// Endpoint para receber o comprovante de pagamento
app.post('/payment/proof', upload.single('proof'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum comprovante enviado' });
    }

    // Extrai os campos do FormData
    const { nome, email, telefone, curso, items } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    let parsedItems;
    try {
      parsedItems = JSON.parse(items);
      if (!Array.isArray(parsedItems)) {
        return res.status(400).json({ message: 'Itens devem ser um array' });
      }
    } catch (e) {
      return res.status(400).json({ message: 'Formato inválido para itens' });
    }

    // Cria o pedido com os campos corretos
    const newOrder = new Order({
      proofOfPayment: req.file.filename,
      date: new Date().toISOString(),
      userName: nome || '',
      userEmail: email,
      userPhone: telefone || '',
      userCourse: curso || '',
      items: parsedItems,
      total: parsedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });

    await newOrder.save();

    res.status(200).json({
      message: 'Pedido criado com sucesso',
      orderData: {
        items: parsedItems,
        total: newOrder.total,
        orderDate: new Date().toLocaleString(),
        proofName: req.file.originalname
      }
    });

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({
      message: 'Erro no servidor',
      error: error.message
    });
  }
});

// Configuração para servir o frontend e lidar com refresh
if (process.env.NODE_ENV === 'production') {
  // Serve arquivos estáticos do React
  app.use(express.static(path.join(__dirname)));
  
  // Rota catch-all para o frontend (importante para o React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});