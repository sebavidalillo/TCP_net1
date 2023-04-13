const net = require('net'); 
const readLine= require('readline-sync'); 

const options= {
    port: 3000, 
    host: 'localhost'
}

const client = net.createConnection(options); 

client.on('connect', ()=>{
    console.log('conexion exitosa'); 
    //sendLine(); 
    client.write('+RESP:GTFRI,270F01,863457051459871,,,10,1,1,,,70.3,-71.602106,-33.045132,20230405203914,,,,,00,,,,,0,110000,,,,20230405203924,499C$'); 
    //client.write('+RESP:GTCAN,270F01,863457051459871,,0,1,C0000134,H1227320,660,0,L17.00,,,0,0.0,0,67.4,-71.557849,-33.027922,20230321153602,0730,0002,6979,235CC8,00,20230321153604,47C8$')
    //client.write('+RESP:GTCAN,270F01,863457051459871,,0,1,A07FFFFF,,2,H1222390,0.39,645,0,95,,L9.50,,0,0.35,0.04,0.31,0.28,,,0042,,00,,,001FFFFF,,,,,,,,,69,102,0,0.04,,0.00,2,,,,,,0000,,,0730,0002,6979,232EA9,00,20230309150847,2C96$') 
})

client.on('error', (err)=>{
    console.log(err.message); 
})

function sendLine(){
    const line = readLine.question('\n mensaje a enviar:\t');
    client.write(line); 
}