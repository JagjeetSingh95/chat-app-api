// const http = require('http');
// const app = require('./app');

// const port = process.env.PORT || 3001;
// const server = http.createServer(app);

// server.listen(port);

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log(socket.id, 'a user connected');
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });

    socket.on('user', function(user) {
        console.log(user, "user")
    })

    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
      });
  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});