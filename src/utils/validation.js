import i18n from "@/i18n";

export function emailValidationRules() {
  /* eslint-disable no-control-regex */
  return [
    (v) => !!v || i18n.t("emailRequired"),
    (v) =>
      /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/.test(
        v
      ) || i18n.t("error.invalidEmail"),
  ];
  /* eslint-enable no-control-regex */
}

export function emailOrUsernameValidationRules() {
  /* eslint-disable no-control-regex */
  return [
    (v) => !!v || i18n.t("emailOrUsernameRequired"),
    (v) => {
      const emailRegex =
        /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
      const usernameRegex = /^[a-zA-Z0-9-_]{2,30}$/;
      return (
        emailRegex.test(v) ||
        usernameRegex.test(v) ||
        i18n.t("error.invalidEmailOrUsername")
      );
    },
  ];
  /* eslint-enable no-control-regex */
}

export function passwordValidationRules() {
  return [
    (v) => !!v || i18n.t("passwordRequired"),
    (v) => v.length >= 8 || i18n.t("validPassword"),
    (v) => /[A-Z]/.test(v) || i18n.t("passwordUppercase"),
    (v) => /[0-9]/.test(v) || i18n.t("passwordNumber"),
    (v) => /[\W_]/.test(v) || i18n.t("passwordSpecial"),
  ];
}

export function phoneNumberValidationRules() {
  return [
    (v) => !!v || i18n.t("error.requiredField"),
    (v) =>
      /^(\+1[-\s.]?)?(\(?\d{3}\)?[-\s.]?)?\d{3}[-\s.]?\d{4}$/.test(v) ||
      i18n.t("error.invalidPhoneNumber"),
  ];
}

export function requiredFieldValidationRules() {
  return [(v) => !!v || i18n.t("error.requiredField")];
}

export function requiredFieldValidationRulesForArray() {
  return [
    (v) =>
      v?.value?.length > 0 || v?.length > 0 || i18n.t("error.requiredField"),
  ];
}

export function requiredAndMax255FieldValidationRules() {
  return [
    (v) => !!v || i18n.t("error.requiredField"),
    (v) => v.length <= 255 || i18n.t("error.max255Chars"),
  ];
}

export function firstNameValidation() {
  return [
    (v) => !!v || i18n.t("firstNameRequired"),
    (v) => (v && v.length >= 2) || i18n.t("min2Chars"),
  ];
}

export function lastNameValidation() {
  return [
    (v) => !!v || i18n.t("lastNameRequired"),
    (v) => (v && v.length >= 2) || i18n.t("min2Chars"),
  ];
}

export function usernameValidation() {
  const defaultRules = [
    (v) => !!v || i18n.t("usernameRequired"), // Check if the username is present

    // Check length between 2 and 30 characters
    (v) => (v && v.length >= 2 && v.length <= 30) || i18n.t("usernameLength"),

    // Check if it starts with a valid character
    (v) => !/^[_.-]/.test(v) || i18n.t("usernameInvalidStart"),

    // Check if it contains two consecutive underscores, periods, or hyphens
    (v) => !/.*[_.-]{2}/.test(v) || i18n.t("usernameConsecutiveInvalid"),

    // Check if it ends with a valid character
    (v) => !/[_.-]$/.test(v) || i18n.t("usernameInvalidEnd"),

    // Check for valid characters (letters, numbers, underscore, period, and hyphen)
    (v) => /^[a-zA-Z0-9_-]+$/.test(v) || i18n.t("usernameInvalidCharacters"),
  ];
  if (i18n.handleError) {
    return [...defaultRules];
  }
  return defaultRules;
}

export function requiredAndLengthRangeRules(minLength = 2, maxLength = 64) {
  return [
    (v) => !!v || i18n.t("error.requiredField"),
    (v) =>
      (v && v.length >= minLength && v.length <= maxLength) ||
      i18n.t("error.tokenNameLength", { min: minLength, max: maxLength }),
  ];
}

export function validateTokenNameCharacters(value) {
  return (
    /^[a-zA-Z0-9-_~]+$/.test(value) ||
    i18n.t("error.tokenNameInvalidCharacters")
  );
}

export function requiredRule() {
  return (value) => !!value || i18n.t("fieldRequired");
}

export function min2CharsRule() {
  return (value) => (value && value.length >= 2) || i18n.t("min2Chars");
}

export function projectKeyMax10CharsRule() {
  return (value) =>
    (value && value.length <= 10) ||
    i18n.t("projects.create_project.projectKeyMax10Chars");
}

export function projectKeyFormatRule() {
  return (value) =>
    /^[A-Za-z0-9_-]+$/.test(value) ||
    i18n.t("projects.create_project.projectKeyFormat");
}

export function maxProjectNameLengthRule() {
  return (value) =>
    (value && value.length <= 100) ||
    i18n.t("projects.create_project.close_dialog.maxProjectNameLength");
}

export function maxDescriptionLengthRule() {
  return (value) =>
    !value ||
    value.length <= 500 ||
    i18n.t("projects.create_project.close_dialog.maxDescriptionLength");
}
