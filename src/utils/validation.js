// Email validation
export const emailValidationRules = () => [
  (v) => !!v || "Email is required",
  (v) => /.+@.+\..+/.test(v) || "Email must be valid",
];

// Username validation
export const usernameValidationRules = () => [
  (v) => !!v || "Username is required",
  (v) => v.length >= 5 || "Username must be at least 5 characters",
  (v) =>
    /^[a-zA-Z0-9._-]+$/.test(v) ||
    "Username can only contain letters, numbers, and ._-",
];

// Password validation
export const passwordValidationRules = () => [
  (v) => !!v || "Password is required",
  (v) => v.length >= 8 || "Password must be at least 8 characters",
  (v) =>
    /(?=.*[A-Za-z])(?=.*\d)/.test(v) ||
    "Password must contain both letters and numbers",
  (v) =>
    /[!@#$%^&*(),.?":{}|<>]/.test(v) ||
    "Password must contain at least 1 special character",
  (v) =>
    /(?=.*[a-z])(?=.*[A-Z])/.test(v) ||
    "Password must contain both lowercase and uppercase letters",
];

// Email or username validation (for login)
export const emailOrUsernameValidationRules = () => [
  (v) => !!v || "Email or username is required",
  (v) => v.length >= 3 || "Must be at least 3 characters",
];

// Full name validation
export const fullNameValidationRules = () => [
  (v) => !!v || "Full name is required",
  (v) => v.length >= 2 || "Full name must be at least 2 characters",
];

// Confirm password validation
export const confirmPasswordValidationRules = (password) => [
  (v) => !!v || "Please confirm your password",
  (v) => v === password || "Passwords do not match",
];
