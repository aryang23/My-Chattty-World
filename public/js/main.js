const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

//Join Chatroom
socket.emit('joinRoom', {username, room});

//Get Room and Users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});

//Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //Scroll Down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message Submmit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    //Emit Message to Server
    socket.emit('chatMessage', msg);

    //Clear Input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}
  
  // Add users to DOM
function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.innerText = user.username;
      userList.appendChild(li);
    });
}