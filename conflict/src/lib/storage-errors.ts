export class RequiredStorageError extends Error {
  readonly statusCode = 503;

  constructor(storageName: string) {
    super(`${storageName} storage is not initialized. Apply the latest SQL migration in supabase/migrations/.`);
    this.name = "RequiredStorageError";
  }
}

export function isMissingStorageError(error: { code?: string; message: string }, table: string) {
  return error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.message.includes(table);
}
