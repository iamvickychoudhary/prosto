/**
 * Authentication Tokens Interface
 */
export interface IAuthTokens {
  /** JWT access token */
  accessToken: string;

  /** JWT refresh token */
  refreshToken: string;

  /** Access token expiration time */
  expiresIn: string;
}
