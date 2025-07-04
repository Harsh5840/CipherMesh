// Client-side encryption utilities using Web Crypto API
export class FileEncryption {
  // Generate key pair for file encryption
  static async generateKeyPair(): Promise<CryptoKeyPair> {
    return await crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      true,
      ['deriveKey']
    );
  }

  // Generate AES key for file encryption
  static async generateAESKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt file with AES-256-GCM
  static async encryptFile(file: File): Promise<{
    encryptedData: ArrayBuffer;
    iv: Uint8Array;
    key: CryptoKey;
    keyJwk: JsonWebKey;
  }> {
    // Generate AES key
    const key = await this.generateAESKey();
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Read file as ArrayBuffer
    const fileData = await file.arrayBuffer();
    
    // Encrypt file
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      fileData
    );

    // Export key as JWK
    const keyJwk = await crypto.subtle.exportKey('jwk', key);

    return {
      encryptedData,
      iv,
      key,
      keyJwk
    };
  }

  // Decrypt file
  static async decryptFile(
    encryptedData: ArrayBuffer,
    iv: Uint8Array,
    keyJwk: JsonWebKey
  ): Promise<ArrayBuffer> {
    // Import key from JWK
    const key = await crypto.subtle.importKey(
      'jwk',
      keyJwk,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['decrypt']
    );

    // Decrypt file
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encryptedData
    );

    return decryptedData;
  }

  // Generate secure random password
  static generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => charset[byte % charset.length]).join('');
  }

  // Hash password for comparison
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Secure memory cleanup
  static secureCleanup(buffer: ArrayBuffer): void {
    if (buffer instanceof ArrayBuffer) {
      const view = new Uint8Array(buffer);
      crypto.getRandomValues(view);
    }
  }
}

// Utility functions for working with encrypted files
export const cryptoUtils = {
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  },

  uint8ArrayToBase64(uint8Array: Uint8Array): string {
    return btoa(String.fromCharCode(...uint8Array));
  },

  base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
};
