export type DomainScope = "USER" | "ADMIN" | "ALL";

export interface CreateAllowedDomainDTO {
  domain: string;
  scope?: DomainScope;
  description?: string;
  isActive?: boolean;
}

export interface UpdateAllowedDomainDTO {
  scope?: DomainScope;
  description?: string;
  isActive?: boolean;
}
