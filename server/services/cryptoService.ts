import crypto from "crypto";
import bcrypt from "bcrypt";

class CryptoService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateFileId(): string {
    return crypto.randomUUID();
  }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  encryptBuffer(buffer: Buffer, key: string): {
    encrypted: Buffer;
    iv: Buffer;
  } {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);
    
    return { encrypted, iv };
  }

  decryptBuffer(encrypted: Buffer, key: string, iv: Buffer): Buffer {
    const algorithm = 'aes-256-gcm';
    const decipher = crypto.createDecipher(algorithm, key);
    
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
  }
}

export const cryptoService = new CryptoService();
