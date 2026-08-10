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

/**
 * Roles enum for type safety
 */
export enum Roles {
  ASPIRANTE = 1,
  ADMIN = 5,
  DOCENTE = 3,
  ESTUDIANTE = 2,
  COORDINADOR = 4,
}