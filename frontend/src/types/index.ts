export * from "./api";
export * from "./auth";

/**
 * Base entity interface with timestamp audit fields.
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
