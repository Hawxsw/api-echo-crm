import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const SALT_SEPARATOR = '.';

export class PasswordUtil {
  static async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH).toString('hex');
    const hash = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
    return `${salt}${SALT_SEPARATOR}${hash.toString('hex')}`;
  }

  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(SALT_SEPARATOR);
    const hashBuffer = Buffer.from(hash, 'hex');
    const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
    return timingSafeEqual(hashBuffer, derivedKey);
  }
}

