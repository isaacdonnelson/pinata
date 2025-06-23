import i18n from "@/i18n";

export function emailValidationRules() {
  console.log("init email. rule");
  /* eslint-disable no-control-regex */
  return [
    (v) => !!v || i18n.t("auth.messages.emailRequired"),
    (v) =>
      /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/.test(
        v
      ) || i18n.t("auth.messages.invalidEmail"),
  ];
  /* eslint-enable no-control-regex */
}

export function emailOrUsernameValidationRules() {
  /* eslint-disable no-control-regex */
  return [
    (v) => !!v || i18n.t("auth.messages.emailOrUsernameRequired"),
    (v) => {
      const emailRegex =
        /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
      const usernameRegex = /^[a-zA-Z0-9-_]{2,30}$/;
      return (
        emailRegex.test(v) ||
        usernameRegex.test(v) ||
        i18n.t("auth.messages.invalidEmailOrUsername")
      );
    },
  ];
  /* eslint-enable no-control-regex */
}

export function passwordValidationRules() {
  return [
    (v) => !!v || i18n.t("auth.messages.passwordRequired"),
    (v) => v.length >= 8 || i18n.t("auth.messages.validPassword"),
    (v) => /[A-Z]/.test(v) || i18n.t("auth.messages.passwordUppercase"),
    (v) => /[0-9]/.test(v) || i18n.t("auth.messages.passwordNumber"),
    (v) => /[\W_]/.test(v) || i18n.t("auth.messages.passwordSpecial"),
  ];
}

export function phoneNumberValidationRules() {
  return [
    (v) => !!v || i18n.t("auth.messages.requiredField"),
    (v) =>
      /^(\+1[-\s.]?)?(\(?\d{3}\)?[-\s.]?)?\d{3}[-\s.]?\d{4}$/.test(v) ||
      i18n.t("auth.messages.invalidPhoneNumber"),
  ];
}

export function requiredFieldValidationRules() {
  return [(v) => !!v || i18n.t("auth.messages.requiredField")];
}

export function requiredFieldValidationRulesForArray() {
  return [
    (v) =>
      v?.value?.length > 0 ||
      v?.length > 0 ||
      i18n.t("auth.messages.requiredField"),
  ];
}

export function requiredAndMax255FieldValidationRules() {
  return [
    (v) => !!v || i18n.t("auth.messages.requiredField"),
    (v) => v.length <= 255 || i18n.t("auth.messages.max255Chars"),
  ];
}

export function firstNameValidation() {
  return [
    (v) => !!v || i18n.t("auth.messages.firstNameRequired"),
    (v) => (v && v.length >= 2) || i18n.t("auth.messages.min2Chars"),
  ];
}

export function lastNameValidation() {
  return [
    (v) => !!v || i18n.t("auth.messages.lastNameRequired"),
    (v) => (v && v.length >= 2) || i18n.t("auth.messages.min2Chars"),
  ];
}

export function usernameValidation() {
  const defaultRules = [
    (v) => !!v || i18n.t("auth.messages.usernameRequired"), // Check if the username is present

    // Check length between 2 and 30 characters
    (v) =>
      (v && v.length >= 2 && v.length <= 30) ||
      i18n.t("auth.messages.usernameLength"),

    // Check if it starts with a valid character
    (v) => !/^[_.-]/.test(v) || i18n.t("auth.messages.usernameInvalidStart"),

    // Check if it contains two consecutive underscores, periods, or hyphens
    (v) =>
      !/.*[_.-]{2}/.test(v) ||
      i18n.t("auth.messages.usernameConsecutiveInvalid"),

    // Check if it ends with a valid character
    (v) => !/[_.-]$/.test(v) || i18n.t("auth.messages.usernameInvalidEnd"),

    // Check for valid characters (letters, numbers, underscore, period, and hyphen)
    (v) =>
      /^[a-zA-Z0-9_-]+$/.test(v) ||
      i18n.t("auth.messages.usernameInvalidCharacters"),
  ];
  if (i18n.handleError) {
    return [...defaultRules];
  }
  return defaultRules;
}

export function requiredAndLengthRangeRules(minLength = 2, maxLength = 64) {
  return [
    (v) => !!v || i18n.t("auth.messages.requiredField"),
    (v) =>
      (v && v.length >= minLength && v.length <= maxLength) ||
      i18n.t("auth.messages.tokenNameLength", {
        min: minLength,
        max: maxLength,
      }),
  ];
}

export function validateTokenNameCharacters(value) {
  return (
    /^[a-zA-Z0-9-_~]+$/.test(value) ||
    i18n.t("auth.messages.tokenNameInvalidCharacters")
  );
}

export function requiredRule() {
  return (value) => !!value || i18n.t("auth.messages.fieldRequired");
}

export function min2CharsRule() {
  return (value) =>
    (value && value.length >= 2) || i18n.t("auth.messages.min2Chars");
}
