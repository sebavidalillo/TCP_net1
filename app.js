const net = require('net'); 
var server = net.createServer(); 

port = process.env.PORT || 3000; 
ip = 'my_host'; 

server.on("connection", (socket) => { 
  console.log("Nueva conexión en", socket.remoteAddress + ":" + socket.remotePort); 
  
  // SOCKET.ON DATA //
  socket.on("data", (data) => { 
    console.log(`Datos recibidos: ${data}`);

    const ReporteSeparadoPorComas = data.toString().split(',');
    const messages = GetMessages(ReporteSeparadoPorComas);  
    console.log(messages); 
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
      server.listen(port); 
    }, 1000); 
  } 
  else { 
    console.log("Server failed.") 
  } 
}); 

server.listen(port, ()=>{
  console.log('sevidor corriendo en ', port); 
});

function GetMessages(ReporteSeparadoPorComas){ 
    switch(ReporteSeparadoPorComas[0]){
      case '+RESP:GTPNA': 
        // rutina de ordenamiento en objetos para GTPNA; 
        break; 
      case '+RESP:GTFRI':
        // rutina de asignación de campos para GTFRI;
        return RESP_GTFRI(ReporteSeparadoPorComas); 
        break;
      case '+RESP:GTCAN':
        //rutina de asignación de campos para GTCAN; 
        break; 
    }
}


function RESP_GTFRI(ReporteSeparadoPorComas){
    const mensajes = {
      IMEI: ReporteSeparadoPorComas[2], 
      ReportMask: ReporteSeparadoPorComas[6],
      Altitude: ReporteSeparadoPorComas[10], 
      Longitud: ReporteSeparadoPorComas[11], 
      Latitude: ReporteSeparadoPorComas[12], 
      BackUpBattery: ReporteSeparadoPorComas[23], 
      SendTime: ReporteSeparadoPorComas[28],

    };
    return mensajes; 
}


function RESP_GTCAN(ReporteSeparadoPorComas){
  const mensajes = {
    IMEI: ReporteSeparadoPorComas[2],
    CanState: ReporteSeparadoPorComas[5], // 1 OK, 0 ABNORMAL
    
  };
  return mensajes; 
}