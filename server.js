const path = require('path');
const http =  require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');

const app = express(); //Making an App via ExpressJJS
const server = http.createServer(app); //Making the Server
const io = socketio(server); //Connecting SocketIo to this Particular Server
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
  } = require("./utils/users");

//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'My Chatyyy World!';


//Run when client connects
io.on('connection', socket => {

    socket.on('joinRoom',({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcome Current User
        socket.emit('message', formatMessage(botName, 'Welcome to My Chatyyy World!'));

        //Broadcast when a user connects
        socket.broadcast
        .to(user.room)
        .emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Listen for Chat Msg
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //Runs when client disconnects
    socket.on('disconnect', () => {
        // io.emit('message', formatMessage(botName, 'A user has left the chat'));

        const user = userLeave(socket.id);

        if (user) {
        io.to(user.room).emit(
            "message",
            formatMessage(botName, `${user.username} has left the chat`)
        );

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
        }
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on Port ${PORT}`));