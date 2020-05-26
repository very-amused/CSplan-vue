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
      hash: 'SHA-256',
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
 * @typedef {object} UsableKeys
 * @property {CryptoKey} publicKey - Usable CryptoKey object representing an RSA public key
 * @property {CryptoKey} privateKey - Usable CryptoKey object representing an RSA private key
 *
 * @typedef {object} ExportedKeys
 * @property {string} publicKey - RSA public key exported and encoded with Base64
 * @property {string} encryptedPrivateKey - RSA private key wrapped with the user's tempkey
 * and encoded with Base64
 *
 * @typedef {object} Keys
 * @property {UsableKeys} usable
 * @property {ExportedKeys} exported
 *
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
      hash: 'SHA-256'
    },
    1, // The RSA keypair will become the user's master keypair, and must be extractable for storage
    ['wrapKey', 'unwrapKey', 'encrypt', 'decrypt'] // The allowed usages for these keys is to encrypt and decrypt other keys
  ).catch(() => {
    throw new Error('Error generating the user\'s public/private keypair');
  });

  /* Generate a random 96 bit IV for usage in encrypting the private key
  (AES-GCM specifies the use of a 96 bit IV) */
  const iv = crypto.getRandomValues(new Uint8Array(12));

  /* Create an encrypted copy of the private key to be stored serverside */
  const encryptedPrivateKeyBuf = await crypto.subtle.wrapKey(
    'pkcs8',
    privateKey,
    tempKey,
    {
      name: 'AES-GCM',
      iv
    }
  ).catch(() => {
    throw new Error('Error encrypting the user\'s private key');
  });

  // Prepend the IV before the encrypted key, then encode the buffer in base64
  const encryptedPrivateKey = ABencode(ABconcat(iv, encryptedPrivateKeyBuf));

  // Export + encode the public key
  const exportedPublicKey = ABencode(await crypto.subtle.exportKey(
    'spki',
    publicKey
  ).catch(() => {
    throw new Error('Error exporting the user\'s public key');
  }));

  // Encode the PBKDF2 salt for storage
  const encodedSalt = ABencode(salt);

  return {
    keys: {
      usable: {
        publicKey,
        privateKey
      },
      exported: {
        publicKey: exportedPublicKey,
        encryptedPrivateKey
      }
    },
    PBKDF2salt: encodedSalt
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
      hash: 'SHA-256'
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
    ['decrypt', 'unwrapKey']
  );
}

/**
 * Unwrap the user's master keypair
 * @param {string} passphrase - The user's password
 * @param {object} keydata
 */
export async function unwrapMasterKeypair (passphrase, keydata) {
  // Import the user's public key
  const publicKey = await importPublicKey(keydata.publicKey);

  // Derive a tempkey using the same password and salt as were used during account creation
  const saltBuf = ABdecode(keydata.PBKDF2salt);
  const tempKey = await deriveTempKey(passphrase, saltBuf);

  // Decrypt the user's private key
  const encryptedPrivateBuf = ABdecode(keydata.privateKey);
  const iv = encryptedPrivateBuf.slice(0, 12);
  const realEncryptedPrivateBuf = encryptedPrivateBuf.slice(12);
  const privateKey = await crypto.subtle.unwrapKey(
    'pkcs8',
    realEncryptedPrivateBuf,
    tempKey,
    {
      name: 'AES-GCM',
      iv
    },
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    0,
    ['unwrapKey', 'decrypt']
  );

  return {
    usable: {
      privateKey,
      publicKey
    }
  };
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

export async function genSymmetricKey (publicKey) {
  const symmetricKey = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 128
    },
    1, // Key is extractable
    ['encrypt', 'decrypt']
  );

  const exportedSymmetricKey = ABencode(await crypto.subtle.exportKey(
    'raw',
    symmetricKey
  ));

  const encryptedSymmetricKey = ABencode(await crypto.subtle.wrapKey(
    'raw',
    symmetricKey,
    publicKey,
    {
      name: 'RSA-OAEP'
    }
  ));

  return {
    usable: {
      symmetricKey
    },
    exported: {
      symmetricKey: exportedSymmetricKey,
      encryptedSymmetricKey
    }
  };
};

/**
 * Import a symmetric key from base64
 * @param {string} encodedSymmetricKey - Base64 encoded symmetric key
 * @returns {Promise<CryptoKey>} - 128-bit AES-GCM key
 */
export function importSymmetricKey (encodedSymmetricKey) {
  const key = ABdecode(encodedSymmetricKey);
  if (!key.byteLength) {
    throw new Error('Empty key provided');
  }

  return crypto.subtle.importKey(
    'raw',
    key,
    {
      name: 'AES-GCM'
    },
    0, // Not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Decrypt an AES-GCM symmetric key using a RSA-OAEP private key
 * @param {string} encryptedSymmetricKey - Base64 ciphertext of an AES-GCM key
 * @param {CryptoKey} privateKey - RSA private key used to decrypt the AES-GCM key
 */
export function unwrapSymmetricKey (encryptedSymmetricKey, privateKey) {
  const key = ABdecode(encryptedSymmetricKey);
  if (!key.byteLength) {
    throw new Error('Empty key provided');
  }

  return crypto.subtle.unwrapKey(
    'raw',
    key,
    privateKey,
    {
      name: 'RSA-OAEP'
    },
    {
      name: 'AES-GCM'
    },
    0,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a piece of text using AES
 * @param {string} text - Plaintext to be encrypted
 * @param {CryptoKey} symmetricKey - 128 bit AES-GCM key
 */
export async function encrypt (plaintext, symmetricKey) {
  // Generate a 12-byte iv
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the plaintext
  const enc = new TextEncoder('utf-8');
  const plainbuf = enc.encode(plaintext);
  const cipherbuf = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128
    },
    symmetricKey,
    plainbuf
  );

  // Create the ciphertext as IV(12) | C(?) | T(16)
  return ABencode(ABconcat(iv, cipherbuf));
}

/**
 * Decrypt a piece of base64 encoded ciphertext using AES
 * @param {string} ciphertext
 * @param {CryptoKey} symmetricKey - 128-bit AES-GCM key
 */
export async function decrypt (ciphertext, symmetricKey) {
  // Decode the ciphertext
  let cipherbuf;
  try {
    cipherbuf = ABdecode(ciphertext);
  }
  catch {
    return ciphertext;
  }

  // Separate the iv from the real ciphertext/buffer
  const iv = cipherbuf.slice(0, 12);
  const realCipherbuf = cipherbuf.slice(12);

  // Decrypt the ciphertext
  let plainbuf;
  try {
    plainbuf = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128
      },
      symmetricKey,
      realCipherbuf
    );
  }
  catch {
    return '';
  }

  // Decode using UTF-8 and return the plaintext
  const dec = new TextDecoder('utf-8');
  return dec.decode(plainbuf);
}

/**
 * Recursively encrypt an object or array while preserving its original structure
 * @param {object | array | string} data - Data to encrypt
 * @param {CryptoKey} symmetricKey - 128-bit AES-GCM key
 * @returns {Promise<object | array | string>}
 */
export async function deepEncrypt (data, symmetricKey) {
  // Encrypt arrays while preserving their structrure
  if (Array.isArray(data)) {
    const cipherout = [];
    for (let i = 0; i < data.length; i++) {
      cipherout.push(await deepEncrypt(data[i], symmetricKey));
    }
    return cipherout;
  }
  // Encrypt objects while preserving their structure
  else if (typeof data === 'object') {
    const cipherout = {};
    for (const i in data) {
      cipherout[i] = await deepEncrypt(data[i], symmetricKey);
    }
    return cipherout;
  }
  // Encrypt strings using the symmetric key provided
  else if (typeof data.toString === 'function') {
    return encrypt(data.toString(), symmetricKey);
  }
  else {
    throw new TypeError('Data provided is not of type object, array, or string.');
  }
};

/**
 * Recursively decrypt an object or array while preserving its original structure
 * @param {object | array | string} data - Data to decrypt
 * @param {CryptoKey} symmetricKey - 128-bit AES-GCM key
 * @returns {Promise<object | array | string>}
 */
export async function deepDecrypt (data, symmetricKey) {
  // Encrypt arrays while preserving their structrure
  if (Array.isArray(data)) {
    const cipherout = [];
    for (let i = 0; i < data.length; i++) {
      cipherout.push(await deepDecrypt(data[i], symmetricKey));
    }
    return cipherout;
  }
  // Encrypt objects while preserving their structure
  else if (typeof data === 'object') {
    const cipherout = {};
    for (const i in data) {
      cipherout[i] = await deepDecrypt(data[i], symmetricKey);
    }
    return cipherout;
  }
  // Encrypt strings using the symmetric key provided
  else if (typeof data.toString === 'function') {
    return decrypt(data.toString(), symmetricKey);
  }
  else {
    throw new TypeError('Data provided is not of type object, array, or string.');
  }
};
