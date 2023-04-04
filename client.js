const net = require('net'); 
const options= {
    port: 3500, 
    host: 'localhost'
}

const client = net.createConnection(options); 

client.on('connect', ()=>{
    console.log('conexion exitosa'); 
    client.write('Hola servidor'); 
})

client.on('error', (err)=>{
    console.log(err.message); 
})