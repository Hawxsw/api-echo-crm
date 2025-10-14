interface UserWithRole {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: {
    id: string;
    name: string;
    permissions: Array<{
      action: string;
      resource: string;
    }>;
  } | null;
}

export class UserMapper {
  static toPublicProfile(user: UserWithRole) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    };
  }

  static toAuthResponse(user: UserWithRole, accessToken: string) {
    return {
      access_token: accessToken,
      user: this.toPublicProfile(user),
    };
  }

  static excludePassword<T extends { password?: string }>(user: T): Omit<T, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

