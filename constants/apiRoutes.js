export const COMPANY_API = {
  LIST:        "/companies",
  CREATE:      "/companies",
  UPDATE:      (id) => `/companies/${id}`,
  DELETE:      (id) => `/companies/${id}`,
  UPLOAD_ICON: "/companies/upload-icon",
  SEED:        "/companies/seed-from-jobs",
  ICON:        "/companies/icon",
  SUGGESTIONS: "/jobs/suggestions/companies",
};
