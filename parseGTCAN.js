//ESTE CÓDIGO FUNCIONA SOLO PARA REPORTE CAN SIN EXPANSION MASK // 

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


const mensaje = "+RESP:GTCAN,270F01,863457051459871,,0,1,C0000134,H1227320,660,0,L17.00,,,0,0.0,0,67.4,-71.557849,-33.027922,20230321153602,0730,0002,6979,235CC8,00,20230321153604,47C8$";

//const mensaje = "+RESP:GTCAN,270F01,863457051459871,,0,1,A07FFFFF,,2,H1222390,0.39,645,0,95,,L9.50,,0,0.35,0.04,0.31,0.28,,,0042,,00,,,001FFFFF,,,,,,,,,69,102,0,0.04,,0.00,2,,,,,,0000,,,0730,0002,6979,232EA9,00,20230309150847,2C96$";

const MensajeSeparadoPorComas = mensaje.split(','); 

/*
const DatosFinales ={ 
    'Reporte':    
}
*/


// Extraemos la máscara del mensaje en binario
const mascara = parseInt(hex2bin(MensajeSeparadoPorComas[6]),2); 

console.log(mascara); 

// Array para almacenar los campos seleccionados
const camposSeleccionados = [];

// Iterar sobre cada uno de los bits de la máscara
for (let i = 0; i < MascaraCAN.length; i++) {
  // Comprueba si el bit actual está establecido en la máscara
  if ((mascara & (1 << i)) !== 0) {
    // Si el bit está establecido, añadimos el campo correspondiente al array de campos seleccionados
    //console.log('bit ', i+1, 'se reporta ', CamposMascara[i]); 
    if(MascaraCAN[i] == 'GNSS Info'){
      camposSeleccionados.push('Reserved PreGNSS1');
      camposSeleccionados.push('Reserved PreGNSS2');
        camposSeleccionados.push('GNSS Accuracy');
        camposSeleccionados.push('Speed GNSS');
        camposSeleccionados.push('Azimuth');
        camposSeleccionados.push('Altitude');
        camposSeleccionados.push('Longitude');
        camposSeleccionados.push('Latitude');
        camposSeleccionados.push('GNSSUTC');
    }
    else if (MascaraCAN[i] == 'Cell Info'){
      camposSeleccionados.push('MCC');
      camposSeleccionados.push('MNC');
      camposSeleccionados.push('LAC');
      camposSeleccionados.push('Cell ID');
    }
    else{
    camposSeleccionados.push(MascaraCAN[i]);
    }
  }
}

// Un objeto para almacenar los valores recibidos asociados a los campos seleccionados
const valoresPorCampo = {}; 
// Iteramos sobre los campos seleccionados y los asociamos con los valores recibidos
for (let i = 0; i < camposSeleccionados.length; i++) {
  const valor = MensajeSeparadoPorComas[i+7];
  campo = camposSeleccionados[i];
  valoresPorCampo[campo] = valor;
}

// Mostramos los valores recibidos asociados a los campos seleccionados
console.log(MensajeSeparadoPorComas); 
console.log(camposSeleccionados); 
console.log(valoresPorCampo);


// FUNCIONES DE ESTE MODULO //

//funcion parse HEX a BINARIO 
function hex2bin(n){  
    return (parseInt(n, 16).toString(2)).padStart(8, '0');
}