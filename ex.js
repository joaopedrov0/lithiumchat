const express = require('express');
const session = require('express-session');

const MemoryStore = require('memorystore')(session);

// Configure a store para armazenar sessões em memória
const store = new MemoryStore({
  checkPeriod: 86400000 // Verifique se a memória está cheia a cada 24 horas e limpe a sessão mais antiga se necessário
});


const app = express();

// Configure a store para armazenar sessões
// Você pode usar um banco de dados, como MongoDB ou MySQL, ou um armazenamento em memória, como o módulo "memorystore"

// Configure o middleware de sessão
app.use(session({
  store: store, // Use a store configurada acima
  secret: 'my-secret', // Use uma string secreta para assinar a sessão
  resave: false, // Só salvar a sessão se houver alterações
  saveUninitialized: false // Só salvar uma sessão nova se houver alterações
}));

// Adicione uma rota para a página inicial
app.get('/', (req, res) => {
  // Acesse a sessão através do objeto "req.session"
  if (req.session.views) {
    req.session.views++;
    res.setHeader('Content-Type', 'text/html');
    res.write('<p>Você visitou esta página ' + req.session.views + ' vezes</p>');
    res.end();
  } else {
    req.session.views = 1;
    res.end('Bem-vindo à primeira visualização desta página');
  }
});

app.listen(3000, () => {
  console.log('Aplicativo iniciado na porta 3000');
});