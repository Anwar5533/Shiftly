import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@shiftly/shared-types';

export const ROLES_KEY = 'roles';

/**
 * Restricts route access to specified roles.
 * @example @Roles('ADMIN', 'SUPER_ADMIN')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
