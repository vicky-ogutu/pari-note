// config/roles.ts
import { UserRole } from './user';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'manage_users',
    'view_all_reports',
    'create_reports',
    'edit_reports',
    'delete_reports',
    'export_data'
  ],
  doctor: [
    'create_reports',
    'edit_own_reports',
    'view_own_reports',
    'view_all_reports'
  ],
  nurse: [
    'create_reports',
    'view_own_reports'
  ],
  data_clerk: [
    'create_reports',
    'edit_reports',
    'view_all_reports'
  ],
  viewer: [
    'view_all_reports'
  ]
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full system access including user management',
  doctor: 'Can create and view all medical reports',
  nurse: 'Can create and view own medical reports',
  data_clerk: 'Can create and edit all medical reports',
  viewer: 'Can only view reports (read-only access)'
};

export const can = (userRole: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};