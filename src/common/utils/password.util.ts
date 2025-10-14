import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16 as const;
const KEY_LENGTH = 64 as const;
const SALT_SEPARATOR = '.' as const;

export class PasswordUtil {
  static async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH).toString('hex');
    const hash = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
    return `${salt}${SALT_SEPARATOR}${hash.toString('hex')}`;
  }

  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    const parts = hashedPassword.split(SALT_SEPARATOR);
    
    if (parts.length !== 2) {
      return false;
    }

    const [salt, hash] = parts;
    
    if (!salt || !hash) {
      return false;
    }

    const hashBuffer = Buffer.from(hash, 'hex');
    const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
    
    if (hashBuffer.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(hashBuffer, derivedKey);
  }
}

