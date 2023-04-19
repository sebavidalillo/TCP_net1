import net from 'net'; 
var server = net.createServer(); 
import mysql from 'mysql'; 
import {RESP_GTCAN} from './GTCAN.js';

//port = process.env.PORT || 3000; 
const port = 3000;
//ip = 'my_host'; 

const MascaraCAN = [
  "VIN",
  "Ignition Key",
  "Total Distance",
  "Total Fuel Used",
  "RPM",
  "Vehicle Speed",
  "Engine Coolant Temperature",
  "Fuel Consumption",
  "Fuel Level",
  "Range",
  "Accel Pedal Pressure",
  "Total Engine Hours",
  "Total Driving Time",
  "Total Enginge Idle Time",
  "Total Idle Fuel Used",
  "Axle Weight 2nd",
  "Tachograph Information",
  "Detailed Info",
  "Lights",
  "Doors",
  "Total Vehicle Overspeed Time",
  "Total Vehicle Engine Overspeed Time",
  "Total Distance Impulses",
  "Reserved",
  "Reserved",
  "Reserved",
  "Reserved",
  "Reserved",
  "Reserved",
  "CAN Expansion Mask",
  "GNSS Info",
  "Cell Info"
];

const database = mysql.createPool({
  connectionLimit:10,
  host:'localhost',
  user:'root',
  password:'123456789',
  database:'somax_clon1', //
  debug:false
});

database.on('connection', function(connection){
  console.log('Conected to holamundo database'); 

  connection.on('error', (error)=>{
      throw(error);
  });

  connection.on('close', function(err){
      console.error(new Date(), 'MySQL close', err);
  });
}); 

server.on("connection", (socket) => { 
  console.log("Nueva conexión en", socket.remoteAddress + ":" + socket.remotePort); 
  
  // SOCKET.ON DATA //
  socket.on("data", (data) => { 
    console.log(`Datos recibidos: ${data}`);
    const ReporteSeparadoPorComas = data.toString().split(',');
    const messages = GetMessages(ReporteSeparadoPorComas);  
    console.log(messages); 
    database.query('insert into messages (message) value (?);',[data],(error,result)=>{
      if(error){
          throw error;
      }
      else{
          console.log('POSTED');
      }
  });
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




// FUNCIONES // 

function GetMessages(ReporteSeparadoPorComas){ 
    switch(ReporteSeparadoPorComas[0]){
      case '+RESP:GTPNA': 
        // rutina de asignación de campos para GTPNA; 
        break; 
      case '+RESP:GTFRI':
        // rutina de asignación de campos para GTFRI;
        return RESP_GTFRI(ReporteSeparadoPorComas); 
        break;
      case '+RESP:GTCAN':
        //rutina de asignación de campos para GTCAN; 
        return RESP_GTCAN(ReporteSeparadoPorComas, MascaraCAN); 
        break; 
    }
}


function RESP_GTFRI(ReporteSeparadoPorComas){
    const mensajes = {
      Report: 'GTFRI', 
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

