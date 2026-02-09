/**
 * Job data interface
 */
export interface IJobData<T = unknown> {
  /** Unique job ID */
  id: string;

  /** Job type/name */
  type: string;

  /** Job payload */
  data: T;

  /** Job options */
  options?: IJobOptions;

  /** Job creation timestamp */
  createdAt: Date;

  /** Number of attempts */
  attempts: number;
}

/**
 * Job options
 */
export interface IJobOptions {
  /** Delay in milliseconds before processing */
  delay?: number;

  /** Maximum retry attempts */
  maxRetries?: number;

  /** Retry delay in milliseconds */
  retryDelay?: number;

  /** Job priority (higher = more important) */
  priority?: number;

  /** Job timeout in milliseconds */
  timeout?: number;

  /** Remove job after completion */
  removeOnComplete?: boolean;

  /** Remove job after failure */
  removeOnFail?: boolean;
}

/**
 * Job result interface
 */
export interface IJobResult<T = unknown> {
  /** Whether the job succeeded */
  success: boolean;

  /** Result data */
  data?: T;

  /** Error message if failed */
  error?: string;

  /** Processing duration in milliseconds */
  duration: number;
}

/**
 * Queue statistics
 */
export interface IQueueStats {
  /** Number of waiting jobs */
  waiting: number;

  /** Number of active jobs */
  active: number;

  /** Number of completed jobs */
  completed: number;

  /** Number of failed jobs */
  failed: number;

  /** Number of delayed jobs */
  delayed: number;
}

/**
 * Job processor function type
 */
export type JobProcessor<T, R = unknown> = (data: T) => Promise<R>;

/**
 * Queue event types
 */
export enum QueueEvent {
  JOB_ADDED = 'job:added',
  JOB_STARTED = 'job:started',
  JOB_COMPLETED = 'job:completed',
  JOB_FAILED = 'job:failed',
  JOB_RETRYING = 'job:retrying',
}
