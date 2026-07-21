import { createZodDto } from './zod-dto.util';
import { z } from 'zod';

describe('createZodDto', () => {
  it('should create a class with static schema', () => {
    const schema = z.object({ name: z.string() });
    const DtoClass = createZodDto(schema);

    expect((DtoClass as any).schema).toBe(schema);
  });

  it('should parse valid data successfully', () => {
    const schema = z.object({ name: z.string() });
    const DtoClass = createZodDto(schema);

    const instance = new (DtoClass as any)({ name: 'Test' });
    expect(instance).toEqual({ name: 'Test' });
  });

  it('should throw error on invalid data', () => {
    const schema = z.object({ name: z.string() });
    const DtoClass = createZodDto(schema);

    expect(() => new (DtoClass as any)({ name: 123 })).toThrow();
  });

  it('should create empty instance if no data provided', () => {
    const schema = z.object({ name: z.string() });
    const DtoClass = createZodDto(schema);

    const instance = new DtoClass();
    expect(instance).toEqual({});
  });
});
