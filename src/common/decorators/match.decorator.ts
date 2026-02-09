import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

/**
 * Match Decorator
 *
 * Custom validator that ensures a property matches another property's value.
 * Commonly used for password confirmation fields.
 *
 * @param property - The name of the property to match against
 * @param validationOptions - Optional validation options
 *
 * @example
 * ```typescript
 * class CreateUserDto {
 *   @IsString()
 *   password: string;
 *
 *   @Match('password', { message: 'Passwords do not match' })
 *   confirmPassword: string;
 * }
 * ```
 */
export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}
