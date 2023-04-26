import net from 'net'; 
var server = net.createServer(); 
import mysql from 'mysql'; 
import {RESP_GTCAN} from './GTCAN.js';
import { exec } from "child_process";
import moment from 'moment-timezone';

//port = process.env.PORT || 3000; 
const port = 3000;
var database,
dataTypes = [],
clients=[],
dateTimeFormat = 'YYYY-MM-DD HH:mm:ss ZZ',
timeZone = '-04:00'; 
//ip = 'my_host'; 


function connectionDataBase(){
  database = mysql.createPool({
    connectionLimit:10,
    host:'localhost',
    user:'root',
    password:'123456789',
    database:'somax_clon1', //
    debug:false
  })
  getDataTypes();
  //getDevices();
  //getCards();
  //getCities();
}

function getTimeZone(){
  exec("date +%:z", (error, stdout, stderr) => {
    if(error || stderr){ return ''; }
    // timeZone = stdout.replace('\n','');
  });
}

server.on("connection", (socket) => { 
  //console.log("Nueva conexión en", socket.remoteAddress + ":" + socket.remotePort); 
  socket.name = socket.remoteAddress + ':' + socket.remotePort;
  clients.push({
      name: socket.name,
      socket: socket,
      binary: Buffer.alloc(0,0,'binary'),
      decoded: [],
      time: getDateTime(),
      timeMilis: new Date().getTime(),
      nextUpdateMilis: (new Date().getTime() + 180000),
      ip: transformIp(socket.remoteAddress,1),
      port: socket.remotePort,
      imei: null,
      id_devices: null,
      request: [],
      requestReceive: [],
      requestSend: [],
      checkRequest: 0,
      sendRequest: null,
      nextCheckRequest: 0,
      cities: []
  })
  //console.log(clients[0]);
  console.log('Nueva Conexion: '+socket.name+'')

  // SOCKET.ON DATA //
  socket.on("data", (data) => { 
    //console.log(`Datos recibidos: ${data}`);
    //IF para separar entre stream SM y stream de GV??
    stream(data,socket); //llena el buffer del cliente de SM. 
    decodeGV(data); 
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

//Esta función debería hacer toda la rutina de decodificación y guardado. 
// Abrir otro cliente?? Creo que es innecesario abrir nueva linea de clientes, 
// debería haber un tag que los identifique.  
function decodeGV(data){
  database.query('insert into messages (message) value (?);',[data],(error)=>{
    if(error){
        throw error;
    }
    else{
        console.log('Inserted in DataBase');
    }
  });
  const ReporteSeparadoPorComas = data.toString().split(',');
  const messages = GetMessages(ReporteSeparadoPorComas);  
  console.log(messages); 
  //insertIntoBaseData(messages); 
}

function getDateTime(){
  try {
    getTimeZone();
    return moment.utc().utcOffset(timeZone).format(dateTimeFormat);
  } catch (error) {
      console.log('error: '+error+'')
  }
}


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

function findDataType(id){
  try {
      console.log('findDataType');
      for (let i = 0; i < dataTypes.length; i++) {
          if(dataTypes[i].id_devices_data_types == id){
              return dataTypes[i].nameDataType
          }
      }
      return null;
  } catch (error) {
      console.log('error: '+error+'')
  }
}

function transformIp(ip,format){
  try {
      // 1 = ip to int, 2 = int to ip
      console.log('transformIp')
      if(format == 1){
          return ip.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
      }else{
          return ( (ipInt>>>24) +'.' + (ipInt>>16 & 255) +'.' + (ipInt>>8 & 255) +'.' + (ipInt & 255) );
      }
  } catch (error) {
      console.log('error: '+error+'')
  }
}

function stream(data,socket){
  try {
      for (var i = 0; i < clients.length; i++) {
          if(clients[i].socket === socket){
              try {
                  var msg = Buffer.concat([ clients[i].binary, Buffer.from(data,'binary')]);
                  clients[i].binary = msg;
              } catch (error) {
                  clients[i].socket.write("0x10");
              }
          }
      }
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

// server.on('listening',function(){
//   log('server start '+ip+':'+port+'')
//   intervals.push(setInterval(function(){  // cada 10 segundos se hace decode Messages, closeOldConnection
//       decodeMessages();
//       closeOldConnection();
//       log('Concurrent connections ('+clients.length+')');
//   },10000));
// });

initServer();
