/**
 * Draft Status Enum
 *
 * Defines the status of a draft profile during registration.
 */
export enum DraftStatus {
  /** Profile is being created */
  DRAFT = 'draft',

  /** Profile has been completed and converted to user */
  COMPLETED = 'completed',

  /** Draft has expired */
  EXPIRED = 'expired',
}
