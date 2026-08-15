/**
 * Helper function to get role name from role ID
 * @param roleId - The role ID
 * @returns The role name as a string
 */
export const getRoleName = (roleId: string) => {
  switch (roleId) {
    case '01a006da-7d0b-764c-aa30-ea37462aa519':
      return 'Aprendiz';
    case '2':
      return 'Estudiante';
    case '01a006da-7d0b-764c-aa30-ef8086e23aa9':
      return 'Profesor';
    case '01a006da-7d0b-764c-aa30-f163b012a8d0':
      return 'Coordinador';
    case '01a006da-7d0b-764c-aa30-f79567892528':
      return 'Administrador';
    default:
      return 'UNKNOWN';
  }
};


export const GetRoleNameCort = (id: string) => {
  switch (id) {
    case '1':
      return 'Aprendiz';
    case '2':
      return 'Estudiante';
    case '3':
      return 'PROFESOR';
    case '4':
      return 'COORDINADOR';
    case '5':
      return 'ADMIN';
    default:
      return 'UNKNOWN';
  }
};

/**
 * Roles enum for type safety
 */
export const Roles = (id: string): string => {
  switch (id) {
    case '1':
      return 'Aprendiz';
    case '2':
      return 'Estudiante';
    case '3':
      return 'PROFESOR';
    case '4':
      return 'COORDINADOR';
    case '5':
      return 'ADMIN';
    default:
      return 'UNKNOWN';
  }
};
