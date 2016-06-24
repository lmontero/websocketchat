/**
 * Created by Luis Montero on 6/23/2016.
 */
(function () {
  'use strict';

  //var app = require('express')();
  //var http = require('http').Server(app);
  var http = require('http').createServer(handler);
  var fs = require('fs');
  var io = require('socket.io')(http);
  var clients = [];

  /*app.get('/', function (request, response) {
    //response.send('<h1>Hello World</h1>');
    response.sendFile(__dirname + '/index.html');
  });*/
  
  function handler(request, response) {
    fs.readFile(__dirname + '/index.html', function (err, data) {
      if (err){
        response.writeHead(500);
        return response.end('Error loading index.html');
      }
      
      response.writeHead(200);
      response.end(data);
    });
  }

  io.on('connection', function (socket) {
    socket.on('user connected', function (info) {
      socket.nickname = info;
      socket.broadcast.emit('user connected', info + ' was connected...');
      clients.push({id: socket.id, nickname: socket.nickname});
      console.log(clients);
      //socket.emit('load users', io.sockets.clients());
    });
    
    socket.on('chat message', function (msg) {
      socket.broadcast.emit('chat message', msg);
    });

    socket.on('disconnect', function (user) {
      var positionToRemove = clients.map(function (item) {
        return item.id;
      }).indexOf(socket.id);
      positionToRemove >= 0 ? clients.splice(positionToRemove, 0): console.log('Not exist this element...');
      io.emit('disconnected user', socket.nickname + ' was disconnected...');
    });
    
    socket.on('writing on', function (msg) {
      socket.broadcast.emit('writing on', msg);
    });
    
    socket.on('writing off', function (msg) {
      socket.broadcast.emit('writing off', msg);
    });
  });

  http.listen(3000, function () {
    console.log('listening on *:3000');
  })
})();