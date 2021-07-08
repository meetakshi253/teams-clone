const express = require('express')
const app = express()
app.use(express.static(__dirname));
const server = require('http').Server(app)
const io = require('socket.io')(server)  //a server based on our express server passed to socket.io
const{ v4 } = require('uuid')

console.log('hi')
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (request, response)=>
{
    //redirect user to a dynamic room
    response.redirect(`/${v4()}`) //gives a dynamic url
})

app.get('/:room', (request, response)=>
{
    //create a  route for our room.
    response.render('room', {roomId: request.params.room})
})

io.on('connection', socket=>{
    socket.on('join-room', (roomId, userId)=>
    {
        socket.join(roomId)
        //notify everyone in the room about the presence of the new user
        socket.broadcast.to(roomId).emit('user-joinedin', userId)
        //whenever we join a room, the userid and roomid is passed.

        socket.on('in-call-message', (msg, user) =>
        {
            io.to(roomId).emit('new-message', msg, user)
        })

        socket.on('disconnect', ()=>
        {
            console.log(roomId+" "+userId)
            socket.broadcast.to(roomId).emit('user-left', userId)
        })      
    }) 
})

server.listen(3000)