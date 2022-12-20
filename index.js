const express = require('express')
const { cookie } = require('express/lib/response')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const cookieParser = require('cookie-parser')
const { parse } = require('cookie')

//em teste
const session = require('express-session')
const MemoryStore = require('memorystore')(session)

// New session management with express-session

const store = new MemoryStore({
    checkPeriod: 86400000 // Verifique se a memória está cheia a cada 24 horas e limpe a sessão mais antiga se necessário
});




//Message class

class Message {
    constructor(author, content, date){
      this.author = author,
      this.content = content,
      this.date = date
    }
  }


// //Brasilian hours
// function fixDate(){
//     let UTC = new Date()
//     let hours
//     if 
// }

//Settings
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(express.static(__dirname))

    app.use(cookieParser())


    const sessionMiddleware = session({
        store: store, // Use a store configurada acima
        secret: 'b8b9e99daee8c9c41ca0520e89d0953f', // Use uma string secreta para assinar a sessão SUBSTITUIR POR UMA VARIÁVEL GLOBAL DE PRODUÇÃO
        resave: false, // Só salvar a sessão se houver alterações
        saveUninitialized: false // Só salvar uma sessão nova se houver alterações
      })

    app.use(sessionMiddleware);
    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
    io.use(wrap(sessionMiddleware))

//Application global variables
var currentUsers = []
var history = []

// app.get('/', (req, res) => {
//     // if(req.cookies.nickname === '' || req.cookies.nickname === undefined){
//     //     res.redirect('/join')
//     // } else {
//     //     res.sendFile(__dirname + '/index.html')
//     // }
//     console.log('hmmm ta ok')
//     res.send('bom dia amigao')
// })

app.get('/join', (req, res) => {
    res.sendFile(__dirname + '/login.html')
})

app.post('/joining', (req, res) => {
    console.log('perfil criado: ' + req.body.nickname)
    // req.session.destroy((err) => {
    //     if (err) {
    //       console.error(err);
    //       res.send('Ocorreu um erro ao tentar desconectar.');
    //       return;
    //     }
    // });


    // var nickname = req.body.nickname
    // nickname.toString()
    req.session.username = req.body.nickname
    req.session.save((err) => {
        if (err) {
          console.error(err);
          res.send('Ocorreu um erro ao tentar fazer login.');
          return;
        }
    })
    // console.log(res)
    // res.io.socket.request.session.username = req.session.username;
    // res.io.socket.handshake.accept();
    res.redirect('/')
})

io.on('connection', (socket) => {
    console.log('a user connected')
    console.log(socket.request.session.username)
    if (socket.request.session.username){
        console.log('username: ' + socket.request.session.username)
        let user = socket.request.session.username
        console.log(user)

        //TEM UM ERRO NOS NOMES, CORTA O PONTO E VIRGULA DIREITO

        console.log('user: ' + user)
        currentUsers.push(user)

        console.log(user + ' se conectou!')
        // const cookies = parse(socket.request.headers.cookie)
        // console.log(socket.request.headers)
        // console.log(socket.request.headers.cookie.slice(socket.request.headers.cookie.indexOf('nickname=')).slice(9))
        // console.log(socket.request.headers.cookie.nickname)

        console.log('CONECTED USERS ' + currentUsers)
        io.emit('render online users list', currentUsers)
        socket.emit('render history', history)
    } else {
        socket.emit('redirect join page')
    }

    socket.on('chat message', (msg) => {
        if(!socket.request.session.username || socket.request.session.username == undefined || socket.request.session.username == null) return
        console.log('"chat message" event listened')
        let now = new Date()
        var newMessage = new Message(
            socket.request.session.username,//author
            msg, //message content
            `${now.getUTCHours() - 3}:${now.getUTCMinutes} - ${now.getUTCDate()}/${now.getUTCMonth() + 1}/${now.getUTCFullYear()}`//Time
        )
        history.push(newMessage)
        io.emit('chat message', newMessage)
        if(history.length >= 21){
            history.shift()
        }
    })

    socket.on('disconnect', () => {
        console.log('user disconnected (' + socket.request.session.username + ')')
        currentUsers.splice(currentUsers.indexOf(socket.request.session.username), 1)
        io.emit('render online users list', currentUsers)

        // console.log('AAAAAAAAAAAAAA----AAAAAAAAAAAA como eu te odeio, ' + JSON.parse(socket.handshake.headers.cookie).nickname) // não funciona
    })
})


server.listen(3000, () => {
    console.log('listening on *:3000')
})


/*

--- Tasks -----------------------

Uma página de 'login' para escolher seu nickname

Sistema de gerenciamento de IDs

Exibir quem mandou cada mensagem

Um header que exibe quem está online

Salvar as 20 ultimas mensagens no server para contextualizar quem estiver chegando agora

*/





/*

Erros para arrumar

CHAT
- Os nomes no celular não funcionam
- Quando alguém entra ou sai do chat, a lista de pessoas online buga


LOGIN
- Ele aceita nomes nulos



*/