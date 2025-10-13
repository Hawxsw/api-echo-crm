export class UserMapper {
  static toPublicProfile(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    };
  }

  static toAuthResponse(user: any, accessToken: string) {
    return {
      access_token: accessToken,
      user: this.toPublicProfile(user),
    };
  }

  static excludePassword<T extends { password?: string }>(user: T): Omit<T, 'password'> {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

