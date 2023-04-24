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

//Rutina que entrega objeto con información reportada por CAN. Input: Mensaje separado por comas, MascaraCAN. 
export function RESP_GTCAN(MensajeSeparadoPorComas) {
    // Extraemos la máscara del mensaje en binario
    const mascara = parseInt((parseInt(MensajeSeparadoPorComas[6], 16).toString(2)).padStart(8, '0'), 2);
    
    // Array para almacenar los campos seleccionados
    const camposSeleccionados = [];

    // Iterar sobre cada uno de los bits de la máscara
    for (let i = 0; i < MascaraCAN.length; i++) {
        // Comprueba si el bit actual está establecido en la máscara
        if ((mascara & (1 << i)) !== 0) {
            // Si el bit está establecido, añadimos el campo correspondiente al array de campos seleccionados
            if (MascaraCAN[i] == 'GNSS Info') {
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
            else if (MascaraCAN[i] == 'Cell Info') {
                camposSeleccionados.push('MCC');
                camposSeleccionados.push('MNC');
                camposSeleccionados.push('LAC');
                camposSeleccionados.push('Cell ID');
            }
            else {
                camposSeleccionados.push(MascaraCAN[i]);
            }
        }
    }

    // Un objeto para almacenar los valores recibidos asociados a los campos seleccionados
    const valoresPorCampo = {};

    // Iteramos sobre los campos seleccionados y los asociamos con los valores recibidos
    for (let i = 0; i < camposSeleccionados.length; i++) {
        const valor = MensajeSeparadoPorComas[i + 7];
        const campo = camposSeleccionados[i];
        valoresPorCampo[campo] = valor;
    }

    //console.log(valoresPorCampo);

    return valoresPorCampo; 
    
};

