/*
* Convert  an ArrayBuffer into a string
* from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
*/
function encode (buf) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
}

function decode (str) {
  const rawStr = atob(str);
  const buf = new Uint8Array(rawStr.length);
  for (let i = 0; i < rawStr.length; i++) {
    buf[i] = rawStr.charCodeAt(i);
  }
  return buf;
}

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
    1,
    ['deriveKey'] // This key may only be used to derive a new, more secure key using PBKDF2
  );
}

async function deriveTempKey (salt, passphrase) {
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

export function cryptoCheck () {
  if (!crypto) {
    throw new Error('No clientside WebCrypto support is detected. Please update your browser to the most recent version, or try using a different browser');
  }
}

export async function generateMasterKeypair (passphrase) {
  // Don't generate a key with a null passphrase
  if (!passphrase.length) {
    throw new Error('A passphrase is required');
  }

  // Generate a 128-bit/16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive a temporary 128-bit AES key from the user's password and salt
  const tempKey = await deriveTempKey(salt, passphrase);

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
    ['wrapKey', 'unwrapKey'] // The allowed usages for this key is to encrypt and decrypt other keys
  );

  /* Generate a random 96 bit IV for usage in encrypting the private key
  (AES-GCM specifies the use of a 96 bit IV) */
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Export and Encrypt the private key using AES-GCM and encode it using base64
  const exportedPrivateKey = await crypto.subtle.exportKey(
    'pkcs8',
    privateKey
  );
  const encryptedPrivateKey = await crypto.subtle.wrapKey(
    'pkcs8',
    privateKey,
    tempKey,
    {
      name: 'AES-GCM',
      iv
    }
  );

  // Prepend the IV before the encrypted key
  const concatenatedPrivateKey = new Uint8Array(iv.byteLength + encryptedPrivateKey.byteLength);
  concatenatedPrivateKey.set(iv, 0);
  concatenatedPrivateKey.set(new Uint8Array(encryptedPrivateKey), iv.byteLength);

  // Export the public key
  const exportedPublicKey = await crypto.subtle.exportKey(
    'spki',
    publicKey
  );

  return {
    keys: {
      publicKey: encode(exportedPublicKey),
      privateKey: encode(exportedPrivateKey),
      encryptedPrivateKey: encode(concatenatedPrivateKey)
    },
    PBKDF2salt: encode(salt),
    iv: encode(iv)
  };
};

export function decodePublicKey (publicKey) {
  if (typeof publicKey !== 'string') {
    throw new TypeError('Public key must be base64 encoded in the form of a string');
  }
  return crypto.subtle.importKey(
    'spki',
    decode(publicKey),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-512'
    },
    0,
    ['encrypt', 'wrapKey']
  );
}

export async function publicEncrypt (text, publicKey) {
  // Decode and import the privade key if it isn't provided as a usable CryptoKey instance
  const usablePublicKey = (publicKey instanceof CryptoKey) ? publicKey : await decodePublicKey(publicKey);

  // Encode the data into a buffer
  const enc = new TextEncoder();
  const buf = enc.encode(text);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    usablePublicKey,
    buf
  );

  return encode(ciphertext);
};
