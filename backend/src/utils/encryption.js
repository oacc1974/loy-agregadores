const crypto = require('crypto');

// Clave de encriptación (debe estar en variables de entorno en producción)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'loy-agregadores-secret-key-32ch'; // Debe ser de 32 caracteres
const IV_LENGTH = 16; // Para AES, esto siempre es 16

/**
 * Encripta un texto usando AES-256-CBC
 * @param {string} text - Texto a encriptar
 * @returns {string} - Texto encriptado en formato hex
 */
function encryptData(text) {
  if (!text) return text;
  
  try {
    // Asegurar que la clave tenga 32 caracteres
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Retornar IV + texto encriptado
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Error encriptando datos:', error);
    return text; // En caso de error, retornar el texto original
  }
}

/**
 * Desencripta un texto encriptado con AES-256-CBC
 * @param {string} text - Texto encriptado en formato hex
 * @returns {string} - Texto desencriptado
 */
function decryptData(text) {
  if (!text || !text.includes(':')) return text;
  
  try {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error desencriptando datos:', error);
    return text; // En caso de error, retornar el texto original
  }
}

module.exports = {
  encryptData,
  decryptData
};
