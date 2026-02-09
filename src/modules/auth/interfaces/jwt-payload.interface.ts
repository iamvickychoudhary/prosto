/**
 * JWT Payload Interface
 *
 * Represents the decoded JWT token payload
 */
export interface IJwtPayload {
  /** User ID */
  sub: string;

  /** User email */
  email: string;

  /** User role */
  role: string;

  /** Token issued at timestamp */
  iat?: number;

  /** Token expiration timestamp */
  exp?: number;
}
