const net = require('net'); 
var server = net.createServer(); 

port = 3500; 
ip = 'my_host'; 

server.on("connection", (socket) => { 
  console.log("new client connection is made", socket.remoteAddress + ":" + socket.remotePort); 
  socket.on("data", (data) => { 
    console.log(data.toString()); 
  }); 
  socket.once("close", () => { 
    console.log("client connection closed."); 
  }); 
  socket.on("error", (err) => { 
    console.log("client connection got errored out.") 
  }); 
  socket.write('SERVER: Hello! Connection successfully made.<br>'); 
}); 
server.on('error', (e) => { 
  if (e.code === 'EADDRINUSE') { 
    console.log('Address in use, retrying...'); 
    setTimeout(() => { 
      server.close(); 
      server.listen(PORT, HOST); 
    }, 1000); 
  } 
  else { 
    console.log("Server failed.") 
  } 
}); 

server.listen(port, ()=>{
  console.log('sevidor corriendo en ', port); 
});
