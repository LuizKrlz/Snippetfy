export type AuthUser = {
  id: number;
  email: string;
};

export type AuthVariables = {
  user: AuthUser;
};

export type JwtPayload = {
  sub: number;
  email: string;
  exp: number;
};
