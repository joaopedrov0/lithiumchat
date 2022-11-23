const express = require('express')
const { cookie } = require('express/lib/response')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const cookieParser = require('cookie-parser')
const { parse } = require('cookie')

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
    res.clearCookie()
    // var nickname = req.body.nickname
    // nickname.toString()
    res.cookie('nickname', req.body.nickname, {httpOnly: false, maxAge: 1000*60*60*24*7, encode: String})
    res.redirect('/')
})

io.on('connection', (socket) => {
    console.log('a user connected')
    if (socket.request.headers.cookie){
        console.log('cookie: ' + socket.request.headers.cookie)
        let user = socket.request.headers.cookie.slice(socket.request.headers.cookie.indexOf('nickname=')).slice(9)
        console.log(user)
        if (user.indexOf(';')) {
            user = user.slice(0, user.indexOf(';') + 1)
        }

        //TEM UM ERRO NOS NOMES, CORTA O PONTO E VIRGULA DIREITO

        console.log('user: ' + user)
        currentUsers.push(socket.request.headers.cookie.slice(socket.request.headers.cookie.indexOf('nickname=')).slice(9))

        console.log(user + ' se conectou!')
        const cookies = parse(socket.request.headers.cookie)
        // console.log(socket.request.headers)
        // console.log(socket.request.headers.cookie.slice(socket.request.headers.cookie.indexOf('nickname=')).slice(9))
        // console.log(socket.request.headers.cookie.nickname)

        console.log('CONECTED USERS ' + currentUsers)
        io.emit('render online users list', currentUsers)
        io.emit('render history', history)
    }
    

    socket.on('chat message', (msg) => {
        let now = new Date()
        var newMessage = new Message(
            socket.request.headers.cookie.slice(socket.request.headers.cookie.indexOf('nickname=')).slice(9),//author
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
        console.log('user disconnected (' + socket.request.headers.cookie.slice(socket.request.headers.cookie.indexOf('nickname=')).slice(9) + ')')
        currentUsers.splice(currentUsers.indexOf(socket.request.headers.cookie.slice(socket.request.headers.cookie.indexOf('nickname=')).slice(9)), 1)
        io.emit('render online users list', currentUsers)

        console.log('AAAAAAAAAAAAAA----AAAAAAAAAAAA como eu te odeio, ' + JSON.parse(socket.handshake.headers.cookie).nickname) // não funciona
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