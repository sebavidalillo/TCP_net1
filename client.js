const net = require('net'); 
const options= {
    port: 80, 
    host: 'tcp-net1.onrender.com'
}

const client = net.createConnection(options); 

client.on('connect', ()=>{
    console.log('conexion exitosa'); 
    client.write('Hola servidor'); 
})

client.on('error', (err)=>{
    console.log(err.message); 
})