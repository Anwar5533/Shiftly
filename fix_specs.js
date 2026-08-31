const fs = require('fs');
const path = require('path');

const services = [
  'identity-service', 'jobs-service', 'user-service', 'analytics-service',
  'documents-service', 'notifications-service', 'applications-service',
  'payments-service', 'search-service'
];

const basePath = '/Users/anwarkornipalli/Desktop/Shiftly/apps';

services.forEach(service => {
  const file = path.join(basePath, service, 'src/shared/guards/jwt-auth.guard.spec.ts');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add process.env.JWT_SECRET to beforeEach
    if (!content.includes(`process.env.JWT_SECRET = 'test-secret';`)) {
      content = content.replace(
        /guard = new JwtAuthGuard\(reflector\);/,
        `guard = new JwtAuthGuard(reflector);\n    process.env.JWT_SECRET = 'test-secret';`
      );
    }

    // Replace the x-user-id test
    const oldTest = `    it('should return true and set user if x-user-id header exists', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const mockRequest = {
        headers: {
          'x-user-id': 'user123',
          'x-user-role': 'admin',
        },
        user: undefined,
      };
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
      expect(mockRequest.user).toEqual({
        id: 'user123',
        sub: 'user123',
        userId: 'user123',
        role: 'admin',
      });
    });`;

    const newTest = `    it('should throw UnauthorizedException if x-user-id header is provided without a Bearer token', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const mockRequest = {
        headers: {
          'x-user-id': 'user123',
          'x-user-role': 'admin',
        },
        user: undefined,
      };
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });`;

    content = content.replace(oldTest, newTest);
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
