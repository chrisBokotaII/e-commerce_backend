import bcrypt from 'bcrypt';
export class encrypt {
  static haspassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }
  static comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}
