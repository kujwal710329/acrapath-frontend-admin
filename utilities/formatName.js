export const formatFullName = (firstName, middleName, lastName) =>
  [firstName, middleName, lastName].filter(Boolean).join(" ").trim();
