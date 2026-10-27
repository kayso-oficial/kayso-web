/**
 * GOOGLE APPS SCRIPT — Formularios de kayso.com.ar
 * ---------------------------------------------------------------------------
 * Va en el proyecto de Apps Script de la cuenta de INFO KAYSO, el de esta URL:
 * https://script.google.com/macros/s/AKfycbzsYMhzo9KfEM7rFQuE6RzJ8aO6GeN2mx9jyW7xpDvFYmguKMNCA2sP9ueNpvRbyopi/exec
 *
 * Recibe los dos formularios de /contacto:
 *   1) "Empezá tu consulta"     → mail + fila en tu planilla de siempre
 *   2) "Trabajá con nosotros"   → PDF en Drive + mail con el PDF + pestaña "Postulaciones"
 * Y frena el spam en los dos (lo descartado queda en la pestaña "Spam").
 *
 * CÓMO INSTALARLO
 *  0. ANTES de borrar el código viejo, fijate si tiene algo como
 *       SpreadsheetApp.openById("1AbC...xyz")   → copiá ese ID en ID_PLANILLA
 *       getSheetByName("Hoja 1")                → copiá ese nombre en PESTANA_CONSULTAS
 *  1. Borrá todo y pegá este archivo.
 *  2. Revisá la CONFIGURACIÓN de abajo.
 *  3. Elegí la función `probar` → Ejecutar → aceptá los permisos (pide Drive y Gmail).
 *     Después `probarPostulacion` → Ejecutar.
 *  4. Implementar → Administrar implementaciones → ✏️ → Versión: "Nueva versión" → Implementar.
 *     ("Quién tiene acceso" tiene que decir "Cualquier persona".)
 *     NO uses "Nueva implementación": cambia la URL y los formularios dejan de andar.
 */

// ===================== CONFIGURACIÓN =====================
var MI_CORREO = "info@kayso.com.ar";   // acá te llegan los avisos (cuenta info kayso)
var ASUNTO_LEAD = "Nueva consulta web KA&SO";
var ASUNTO_POSTULACION = "Nueva postulación web KA&SO";

// Planilla donde se anotan las consultas.
// Si el script está creado DESDE la planilla (Extensiones → Apps Script), dejalo vacío "".
// Si no, pegá el ID de la planilla (lo que está entre /d/ y /edit en su dirección).
var ID_PLANILLA = "";

// Pestaña de las consultas. Vacío "" = la PRIMERA pestaña de la planilla (donde ya se venían anotando).
// Las columnas se completan según sus títulos (Fecha, Nombre, Email, Servicio, Mensaje...),
// así que no hace falta cambiar el orden de tu planilla.
var PESTANA_CONSULTAS = "";

// Carpeta de Drive para los CV. Vacío "" = se crea sola "KA&SO - Postulaciones".
// Si querés usar una tuya, pegá su ID (lo que está después de /folders/ en su dirección).
var ID_CARPETA_CV = "";

var MAX_MB_PDF = 5;
var GUARDAR_SPAM = true;   // pestaña "Spam" para revisar lo descartado

// ======================== PRINCIPAL ========================
function doPost(e) {
  var p = (e && e.parameter) || {};
  var esPostulacion = p.tipo === "postulacion";

  if (esSpam(p)) {
    if (GUARDAR_SPAM) {
      try {
        guardarRegistro("Spam", [
          ["Fecha", new Date()], ["Formulario", esPostulacion ? "Postulación" : "Consulta"],
          ["Nombre", p.nombre], ["Email", p.email], ["Mensaje", p.mensaje]
        ]);
      } catch (err) {}
    }
    return respuesta({ result: "success" });
  }

  return esPostulacion ? recibirPostulacion(p) : recibirContacto(p);
}

// ------------------- 1) Formulario de contacto -------------------
function recibirContacto(p) {
  try {
    guardarRegistro(PESTANA_CONSULTAS, [
      ["Fecha", new Date()], ["Nombre", p.nombre], ["Email", p.email],
      ["Servicio", p.servicio], ["Mensaje", p.mensaje], ["Estado", "Nuevo"]
    ]);
  } catch (err) {
    console.error("No se pudo guardar en la planilla: " + err);
  }

  var cuerpo = "¡Tenés un nuevo prospecto desde la web!\n\n" +
               "👤 Nombre: " + (p.nombre || "") + "\n" +
               "✉️ Email: " + (p.email || "") + "\n" +
               "🚀 Servicio de interés: " + (p.servicio || "—") + "\n" +
               "📝 Mensaje:\n" + (p.mensaje || "") + "\n\n" +
               "--------------------------------\n" +
               "Respondé a este correo para contactar al cliente directamente.";

  MailApp.sendEmail({
    to: MI_CORREO,
    subject: ASUNTO_LEAD + (p.servicio ? " - " + p.servicio : ""),
    body: cuerpo,
    replyTo: p.email || MI_CORREO
  });
  return respuesta({ result: "success" });
}

// ------------------- 2) Trabajá con nosotros -------------------
function recibirPostulacion(p) {
  if (!p.archivo_base64) return respuesta({ result: "error", message: "falta el PDF" });

  var bytes;
  try {
    bytes = Utilities.base64Decode(p.archivo_base64);
  } catch (err) {
    return respuesta({ result: "error", message: "el archivo llegó dañado" });
  }
  if (bytes.length > MAX_MB_PDF * 1024 * 1024) {
    return respuesta({ result: "error", message: "el PDF pesa más de " + MAX_MB_PDF + " MB" });
  }
  // Un PDF de verdad empieza con "%PDF"
  if (!(bytes[0] === 37 && bytes[1] === 80 && bytes[2] === 68 && bytes[3] === 70)) {
    return respuesta({ result: "error", message: "el archivo no es un PDF" });
  }

  var fecha = Utilities.formatDate(new Date(), "America/Argentina/Cordoba", "yyyy-MM-dd");
  var nombreArchivo = (fecha + " - " + (p.nombre || "Sin nombre") + " - " + (p.area || ""))
    .replace(/[\\\/:*?"<>|]/g, "").slice(0, 120) + ".pdf";
  var pdf = Utilities.newBlob(bytes, "application/pdf", nombreArchivo);
  var link = carpetaCV().createFile(pdf).getUrl();

  try {
    guardarRegistro("Postulaciones", [
      ["Fecha", new Date()], ["Nombre", p.nombre], ["Email", p.email], ["Área", p.area],
      ["Portafolio", p.portfolio], ["Mensaje", p.mensaje], ["CV (PDF)", link], ["Estado", "Sin revisar"]
    ]);
  } catch (err) {
    console.error("No se pudo guardar en la planilla: " + err);
  }

  var cuerpo = "Nueva postulación desde la web (Trabajá con nosotros):\n\n" +
               "👤 Nombre: " + (p.nombre || "") + "\n" +
               "✉️ Email: " + (p.email || "") + "\n" +
               "🎨 Área: " + (p.area || "") + "\n" +
               "🔗 Portafolio: " + (p.portfolio || "—") + "\n" +
               "📝 Mensaje: " + (p.mensaje || "—") + "\n\n" +
               "📄 CV en Drive: " + link + "\n" +
               "(también va adjunto en este mail)\n\n" +
               "--------------------------------\n" +
               "Respondé a este correo para escribirle directamente.";

  MailApp.sendEmail({
    to: MI_CORREO,
    subject: ASUNTO_POSTULACION + (p.area ? " - " + p.area : ""),
    body: cuerpo,
    replyTo: p.email || MI_CORREO,
    attachments: [pdf]
  });

  return respuesta({ result: "success" });
}

// ======================== PLANILLA ========================
// Palabras con las que reconocemos cada columna por su título
var SINONIMOS = {
  "Fecha":      ["fecha", "marca temporal", "timestamp"],
  "Nombre":     ["nombre", "name"],
  "Email":      ["email", "mail", "correo"],
  "Servicio":   ["servicio", "interes"],
  "Mensaje":    ["mensaje", "consulta", "comentario"],
  "Estado":     ["estado", "status"],
  "Formulario": ["formulario"],
  "Área":       ["area"],
  "Portafolio": ["portafolio", "portfolio"],
  "CV (PDF)":   ["cv", "pdf"]
};

function normal(t) {
  return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

// campos: [["Fecha", valor], ["Nombre", valor], ...]
// Completa cada valor en la columna cuyo título coincida. Si la pestaña no existe la crea,
// y si falta alguna columna la agrega al final (no se pierde ningún dato).
function guardarRegistro(nombrePestana, campos) {
  var libro = ID_PLANILLA ? SpreadsheetApp.openById(ID_PLANILLA) : SpreadsheetApp.getActiveSpreadsheet();
  if (!libro) throw new Error("No encuentro la planilla: completá ID_PLANILLA.");

  var hoja = nombrePestana ? libro.getSheetByName(nombrePestana) : libro.getSheets()[0];
  if (!hoja) hoja = libro.insertSheet(nombrePestana);

  if (hoja.getLastRow() === 0) {
    var titulos = campos.map(function (c) { return c[0]; });
    hoja.appendRow(titulos);
    hoja.getRange(1, 1, 1, titulos.length).setFontWeight("bold");
    hoja.setFrozenRows(1);
  }

  var encabezados = hoja.getRange(1, 1, 1, Math.max(hoja.getLastColumn(), 1)).getValues()[0];
  var fila = encabezados.map(function () { return ""; });
  var usadas = {};

  campos.forEach(function (c) {
    var claves = SINONIMOS[c[0]] || [normal(c[0])];
    var col = -1;
    for (var i = 0; i < encabezados.length && col < 0; i++) {
      var h = normal(encabezados[i]);
      if (!usadas[i] && h && claves.some(function (k) { return h.indexOf(k) !== -1; })) col = i;
    }
    if (col < 0) {                       // no hay columna para este dato: la agregamos
      col = encabezados.length;
      encabezados.push(c[0]);
      hoja.getRange(1, col + 1).setValue(c[0]).setFontWeight("bold");
      fila.push("");
    }
    usadas[col] = true;
    fila[col] = c[1] instanceof Date ? c[1] : limpiar(c[1]);
  });

  hoja.appendRow(fila);
}

// Evita que alguien meta fórmulas en tu planilla escribiendo "=..." en el formulario
function limpiar(v) {
  v = String(v == null ? "" : v).trim();
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function carpetaCV() {
  if (ID_CARPETA_CV) return DriveApp.getFolderById(ID_CARPETA_CV);
  var nombre = "KA&SO - Postulaciones";
  var it = DriveApp.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : DriveApp.createFolder(nombre);
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ======================== ANTI-SPAM ========================
function esSpam(p) {
  p = p || {};
  if (p.website && String(p.website).trim() !== "") return true;          // campo trampa

  var ts = Number(p._ts);
  if (!ts) return true;
  var segundos = (Date.now() - ts) / 1000;
  if (segundos < 4) return true;                                            // demasiado rápido
  if (segundos > 60 * 60 * 24 * 3) return true;                             // formulario viejo reutilizado

  if (p._tk !== "ks-" + (ts % 9973).toString(36)) return true;              // nadie tocó la página

  var nombre = String(p.nombre || "");
  var mensaje = String(p.mensaje || "");
  if ((mensaje.match(/https?:\/\/|www\./gi) || []).length > 2) return true; // muchos links
  if (/https?:\/\/|www\./i.test(nombre)) return true;                       // link en el nombre
  if (/[Ѐ-ӿ]/.test(nombre + mensaje)) return true;                // cirílico
  if (/\b(seo services|backlinks?|viagra|porn|loan offer|guest post)\b/i.test(mensaje)) return true;
  return false;
}

// ======================== PRUEBAS ========================
// Ejecutalas desde el editor. La primera vez te pide permisos.
function probar() {
  var ts = Date.now() - 10000;
  doPost({ parameter: {
    nombre: "Prueba KA&SO", email: MI_CORREO, servicio: "Branding",
    mensaje: "Mensaje de prueba", _ts: String(ts), _tk: "ks-" + (ts % 9973).toString(36)
  }});
}

function probarPostulacion() {
  var ts = Date.now() - 10000;
  var pdfMinimo = Utilities.base64Encode(Utilities.newBlob("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF").getBytes());
  var r = doPost({ parameter: {
    tipo: "postulacion", nombre: "Prueba Postulación", email: MI_CORREO, area: "Diseño gráfico",
    portfolio: "https://www.behance.net/", mensaje: "Postulación de prueba",
    _ts: String(ts), _tk: "ks-" + (ts % 9973).toString(36),
    archivo_nombre: "prueba.pdf", archivo_base64: pdfMinimo
  }});
  Logger.log(r.getContent());
}
