import net from 'net'; 
var server = net.createServer(); 
import mysql from 'mysql'; 
import {RESP_GTCAN} from './GTCAN.js';

//port = process.env.PORT || 3000; 
const port = 3000;
var database,
dataTypes = []; 
//ip = 'my_host'; 


function connectionDataBase(){
  database = mysql.createPool({
    connectionLimit:10,
    host:'demo-gv3000-1.cnmsiceec0ea.us-east-2.rds.amazonaws.com',
    user:'admin',
    password:'123456789',
    database:'demoInitial', //
    debug:false
  })
  getDataTypes();
  //getDevices();
  //getCards();
  //getCities();
}

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
          console.log('Inserted in DataBase');
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

// FUNCIONES // 

function getDataTypes(){
  try {
      console.log("Finding DataTypes")
      var consult = 'select id_devices_data_types, name as nameDataType from md_fleet_devices_data_types where dateDelete is null',
      query = mysql.format(consult)
      database.query(query, function(error,rows,fields){
          if(error){
              log(error);
          }else{
              dataTypes = rows;
          }
      })
  } catch (error) {
      console.log('error: '+error+'')
  }
}



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
        return RESP_GTCAN(ReporteSeparadoPorComas); 
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



function initServer(){
  try {
      console.log('initServer')
      if(server.listening === false){
          //cleanInterval();
          connectionDataBase();
          database.on('connection', function(connection){
            console.log('Conected to demoInitial database'); 
            connection.on('error', (error)=>{
                throw(error);
            });
          
            connection.on('close', function(err){
                console.error(new Date(), 'MySQL close', err);
            });
          }); 
          server.listen(port,()=>{
            console.log('sevidor corriendo en ', port); 
          });
      }
  } catch (error) {
      console.log('error: '+error+'')
  }
}

initServer();
