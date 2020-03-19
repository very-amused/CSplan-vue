/**
 * Encode an ArrayBuffer as base64
 * @param {ArrayBuffer | Uint8Array} buf - ArrayBuffer data
 * @returns {String} Base64
 * @public
 */
export function ABencode (buf) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
}

/**
 * Decode a base64 string as an ArrayBuffer
 * @param {String} base64 - Base64
 * @returns {ArrayBuffer | Uint8Array} ArrayBuffer data
 * @public
 */
export function ABdecode (base64) {
  const raw = atob(base64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    buf[i] = raw.charCodeAt(i);
  }
  return buf;
}

/**
 * Concatenate two ArrayBuffers/Uint8Arrays
 * @param {ArrayBuffer | Uint8Array} buf1
 * @param {ArrayBuffer | Uint8Array} buf2
 * @returns {Uint8Array}
 * @private
 */
function ABconcat (buf1, buf2) {
  const buf1Accessible = new Uint8Array(buf1);
  const buf2Accessible = new Uint8Array(buf2);

  const concat = new Uint8Array(buf1Accessible.byteLength + buf2Accessible.byteLength);
  concat.set(buf1Accessible, 0);
  concat.set(buf2Accessible, buf1Accessible.byteLength);

  return concat;
}

/**
 * Create a KeyObject from a passphrase
 * @param {String} passphrase - Passphrase to create a key from
 * @returns {Promise<CryptoKey>} KeyObject
 * @private
 */
function passToKey (passphrase) {
  // Encode the passphrase in the form of an 8 bit unsigned int array
  const enc = new TextEncoder();
  const passphraseUint8Array = enc.encode(passphrase);

  return crypto.subtle.importKey(
    'raw',
    passphraseUint8Array,
    {
      name: 'PBKDF2'
    },
    0, // This key cannot be extractable
    ['deriveKey'] // This key may only be used to derive a new, more secure key using PBKDF2
  );
}

/**
 * Derive a 128-bit AES-GCM key from a passphrase and salt using PBKDF2
 * @param {string} passphrase - Passphrase to derive a key from
 * @param {ArrayBuffer} salt - Salt to use when deriving the key, must be cryptographically random
 * @returns {Promise<CryptoKey>} AES key
 * @private
 */
async function deriveTempKey (passphrase, salt) {
  // Create a key object from the passphrase
  const passKey = await passToKey(passphrase);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-512',
      salt,
      iterations: 500000
    },
    passKey,
    {
      name: 'AES-GCM', // Derive an AES-GCM key
      length: 128 // Of 128 bits length
    },
    0, // The key should never be extractable!!! This key is never stored
    ['wrapKey', 'unwrapKey'] // The only allowed usage for this key is to encrypt the user's private master key
  );
}

/**
 * @typedef {Object} webCryptoSupportInfo
 * @property {boolean} isSupported - Whether or not WebCrypto is supported
 * @property {message?} - Error message (only present if WebCrypto support is not present)
 */

/**
 * Checks whether the browser has support for the WebCrypto API
 * @returns {webCryptoSupportInfo}
 * @private
 */
function cryptoCheck () {
  if (!crypto) {
    return {
      isSupported: false,
      message: 'WebCrypto is not supported in this browser'
    };
  }
  else {
    return {
      isSupported: true
    };
  }
}

/**
 * @typedef {Object} Keys
 * @property {string} publicKey - RSA public key exported as SPKI and encoded with Base64
 * @property {string} privateKey - RSA private key exported as pkcs8 and encoded with Base64
 * @property {string} encryptedPrivateKey - RSA private key exported as pkcs8,
 * encrypted using AES-GCM, and encoded with Base64
 */

/**
 * @typedef {Object} KeyInfo
 * @property {Keys} keys - Public, private, and encrypted private RSA keys
 * @property {string} PBKDF2salt - Salt used in PBKDF2 along with the passphrase
 * to decrypt the RSA private key
 */

/**
 * Generates and exports a 4096-bit RSA keypair in multiple formats
 * @param {String} passphrase - The passphrase to use as a key in encrypting the private key
 * @returns {Promise<KeyInfo>} KeyInfo object for clientside processing
 * @public
 */
export async function generateMasterKeypair (passphrase) {
  // Check for WebCrypto support
  if (!cryptoCheck().isSupported) {
    throw new Error(cryptoCheck().message);
  }
  // Don't generate a key with a null passphrase
  if (!passphrase || !passphrase.length) {
    throw new Error('The passphrase must not be empty');
  }

  // Generate a 128-bit/16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive a temporary 128-bit AES key from the user's password and salt
  const tempKey = await deriveTempKey(passphrase, salt);

  // Generate the keypair
  const publicExponent = new Uint8Array([0x01, 0x00, 0x01]); // 65537, standard RSA public exponent
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 4096,
      publicExponent,
      hash: 'SHA-512'
    },
    true, // The RSA keypair will become the user's master keypair, and must be extractable for storage
    ['wrapKey', 'unwrapKey'] // The allowed usages for these keys is to encrypt and decrypt other keys
  );

  /* Generate a random 96 bit IV for usage in encrypting the private key
  (AES-GCM specifies the use of a 96 bit IV) */
  const iv = crypto.getRandomValues(new Uint8Array(12));

  /* Make two copies of the private key, one encoded but not encrypted,
  and the other encoded and wrapped. The unencrypted key is stored clientside,
  and the encrypted/wrapped key is stored serverside */
  const exportedPrivateKey = ABencode(await crypto.subtle.exportKey(
    'pkcs8',
    privateKey
  ));
  const encryptedPrivateKey = await crypto.subtle.wrapKey(
    'pkcs8',
    privateKey,
    tempKey,
    {
      name: 'AES-GCM',
      iv
    }
  );

  // Prepend the IV before the encrypted key, then encode the buffer in base64
  const storeablePrivateKey = ABencode(ABconcat(iv, encryptedPrivateKey));

  // Export + encode the public key
  const exportedPublicKey = ABencode(await crypto.subtle.exportKey(
    'spki',
    publicKey
  ));

  // Encode the PBKDF2 salt for storage
  const encodedSalt = ABencode(salt);

  return {
    keys: {
      publicKey: exportedPublicKey,
      privateKey: exportedPrivateKey,
      encryptedPrivateKey: storeablePrivateKey
    },
    PBKDF2salt: encodedSalt,
    iv: ABencode(iv)
  };
};

/**
 * Decode and import a public RSA key from a Base64 string
 * @param {string} publicKey - Base64 encoded public RSA key
 * @returns {Promise<CryptoKey>} KeyObject instance, usable for encrypting data or wrapping other keys
 */
export function importPublicKey (encodedPublicKey) {
  const publicKey = ABdecode(encodedPublicKey);

  return crypto.subtle.importKey(
    'spki',
    publicKey,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-512'
    },
    0, // Not exportable
    ['encrypt', 'wrapKey']
  );
}

/**
 * Decode and import a private RSA key from a Base64 string
 * @param {string} encodedPrivateKey - Base64 encoded private RSA key
 * @returns {Promise<CryptoKey>} KeyObject instance, usable for decrypting data or unwrapping other keys
 */
export function importPrivateKey (encodedPrivateKey) {
  const privateKey = ABdecode(encodedPrivateKey);
  if (!privateKey.byteLength) {
    throw new Error('Empty private key provided');
  }

  return crypto.subtle.importKey(
    'pkcs8',
    privateKey,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-512'
    },
    0, // Not exportable
    ['decrypt']
  );
}

/**
 * Encrypt text with a public CryptoKey instance
 * (not for encrypting other keys)
 * @param {string} text - Text to be encrypted
 * @param {CryptoKey} publicKey - Public RSA key with 'encrypt' allowed as a usage
 * @returns {Promise<string>} Base64 encoded ciphertext
 * @public
 */
export async function publicEncrypt (text, publicKey) {
  // Encode the data into a buffer
  const enc = new TextEncoder();
  const buf = enc.encode(text);

  const ciphertext = ABencode(await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    publicKey,
    buf
  ));

  return ciphertext;
};

/**
 * Decrypt text with a private CryptoKey instance
 * (not for decrypting other keys)
 * @param {string} base64 - Base64 encoded ciphertext
 * @param {CryptoKey} privateKey - Private RSA key with 'decrypt' allowed as a usage
 * @returns {Promise<string>} Plaintext
 * @public
 */
export async function privateDecrypt (base64, privateKey) {
  // Decode the data from base64
  const buf = ABdecode(base64);

  const plainbuf = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP'
    },
    privateKey,
    buf
  );

  const dec = new TextDecoder('utf-8');
  const plaintext = dec.decode(plainbuf);

  return plaintext;
};
