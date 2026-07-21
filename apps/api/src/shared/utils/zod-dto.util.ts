import { ZodSchema } from 'zod';

type ZodDtoClass<T> = new () => T;

/**
 * Creates a class from a Zod schema for use with class-validator/class-transformer.
 * Strips unknown keys (whitelist) and parses input through Zod.
 */
export function createZodDto<T extends object>(
  schema: ZodSchema<T>,
): ZodDtoClass<T> {
  class ZodDto {
    static schema = schema;

    constructor(data?: Partial<T>) {
      if (data) {
        const parsed = schema.parse(data);
        Object.assign(this, parsed);
      }
    }
  }

  return ZodDto as unknown as ZodDtoClass<T>;
}
