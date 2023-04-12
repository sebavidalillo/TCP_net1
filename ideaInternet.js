const net = require('net');
const mysql = require('mysq'); //cambiar por mysql y listo

const server = net.createServer((socket) => {
  console.log('Cliente conectado');

  socket.on('data', async (data) => {
    console.log(`Datos recibidos: ${data}`);

    const separadoPorComas = data.toString().split(',');

    const objeto = {
      RESP: separadoPorComas[0],
      id: separadoPorComas[1],
      imei: separadoPorComas[2],
      velocidad: separadoPorComas[5],
      latitud: separadoPorComas[11],
      longitud: separadoPorComas[12],
      fecha: separadoPorComas[13],
      ignicion: separadoPorComas[24],
      bateria: separadoPorComas[25],
      timestamp: separadoPorComas[28]
    };

    const connection = await mysql.createConnection({
      host: 'nombre-del-host',
      user: 'nombre-de-usuario',
      password: 'contraseña',
      database: 'nombre-de-la-base-de-datos'
    });

    const [results, fields] = await connection.execute(
      'INSERT INTO nombre-de-la-tabla (id, imei, velocidad, latitud, longitud, fecha, ignicion, bateria, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [objeto.id, objeto.imei, objeto.velocidad, objeto.latitud, objeto.longitud, objeto.fecha, objeto.ignicion, objeto.bateria, objeto.timestamp]
    );

    console.log(results);

    await connection.end();
  });

  socket.on('end', () => {
    console.log('Cliente desconectado');
  });
});

server.listen(8080, () => {
  console.log('Servidor TCP escuchando en el puerto 8080');
});
