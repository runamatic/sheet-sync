// Configuración global
const API_URL = 'https://app.runamatic.io/api/accounts/bot_fields/{REEMPLAZAR_POR_ID_CAMPO_BOT}';
const ACCESS_TOKEN = '{REEMPLAZAR_POR_RUNAMATIC_API_KEY}';
const SHEET_NAME = '{REEMPLAZAR_POR_NOMBRE_HOJA}';

/**
 * Se ejecuta cuando se detecta un cambio en la hoja.
 */
function onEdit(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME); // Obtiene la hoja específica

    // Verifica si la hoja existe
    if (!sheet) {
      Logger.log(`Error: La hoja "${SHEET_NAME}" no existe en este archivo.`);
      listSheetNames(); // Lista todas las hojas disponibles para depuración
      return;
    }

    // Verifica si el cambio ocurrió en la hoja correcta
    if (e && e.range.getSheet().getName() !== SHEET_NAME) return;

    const data = sheet.getDataRange().getValues(); // Obtiene todos los datos de la hoja
    const sheetContent = convertToText(data); // Convierte los datos a texto

    // Envía la información al endpoint
    sendDataToApp(sheetContent);
  } catch (error) {
    Logger.log('Error en la función onEdit: ' + error.message);
  }
}

/**
 * Convierte los datos de la hoja a texto plano.
 * @param {Array} data - Datos de la hoja (matriz bidimensional).
 * @returns {string} - Datos como texto plano.
 */
function convertToText(data) {
  const headers = data[0]; // Obtiene los encabezados (primera fila)
  const rows = data.slice(1); // Filas de datos sin los encabezados

  const textArray = rows.map(row => {
    return row.map((cell, index) => `${headers[index]}: ${cell}`).join(', ');
  });

  return textArray.join('\n'); // Une las filas con saltos de línea
}

/**
 * Envía los datos al endpoint.
 * @param {string} sheetContent - Contenido de la hoja en formato de texto.
 */
function sendDataToApp(sheetContent) {
  const payload = `value=${encodeURIComponent(sheetContent)}`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-ACCESS-TOKEN': ACCESS_TOKEN
    },
    payload: payload
  };

  try {
    const response = UrlFetchApp.fetch(API_URL, options);
    Logger.log('Datos enviados exitosamente: ' + response.getContentText());
  } catch (error) {
    Logger.log('Error al enviar datos: ' + error.message);
  }
}

/**
 * Lista los nombres de las hojas disponibles en el documento.
 */
function listSheetNames() {
  const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  Logger.log('Hojas disponibles en este archivo:');
  sheets.forEach(sheet => Logger.log('- ' + sheet.getName()));
}
