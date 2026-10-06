export function validateRegistration(input: { name: string; email: string; password: string; confirmation: string; acknowledged: boolean }) {
  if (input.name.trim().length < 2 || input.name.trim().length > 100) return "name";
  if (input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return "email";
  if (input.password.length < 12 || input.password.length > 128) return "password";
  if (input.password !== input.confirmation) return "confirmation";
  if (!input.acknowledged) return "acknowledgement";
  return null;
}
