/**
 * Helper function to get role name from role ID
 * @param roleId - The role ID
 * @returns The role name as a string
 */
export const getRoleName = (roleId: number) => {
  switch (roleId) {
    case 1:
      return 'Aprendiz';
    case 2:
      return 'Estudiante';
    case 3:
      return 'Profesor';
    case 4:
      return 'Coordinador';
    case 5:
      return 'Administrador';
    default:
      return 'UNKNOWN';
  }
};


export const GetRoleNameCort = (id: number) => {
  switch (id) {
    case 1:
      return 'Aprendiz';
    case 2:
      return 'Estudiante';
    case 3:
      return 'PROFESOR';
    case 4:
      return 'COORDINADOR';
    case 5:
      return 'ADMIN';
    default:
      return 'UNKNOWN';
  }
};

/**
 * Roles enum for type safety
 */
export const Roles = (id: number): string => {
  switch (id) {
    case 1:
      return 'Aprendiz';
    case 2:
      return 'Estudiante';
    case 3:
      return 'PROFESOR';
    case 4:
      return 'COORDINADOR';
    case 5:
      return 'ADMIN';
    default:
      return 'UNKNOWN';
  }
};
