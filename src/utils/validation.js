const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value) {
  return EMAIL_PATTERN.test(String(value).trim());
}

/**
 * Runs a map of validators against form values.
 * Each rule returns an error message, or an empty string when valid.
 */
export function validate(values, rules) {
  return Object.entries(rules).reduce((errors, [field, rule]) => {
    const message = rule(values[field] ?? '', values);
    if (message) errors[field] = message;
    return errors;
  }, {});
}

export const rules = {
  required: (label) => (value) => (String(value).trim() ? '' : `Enter ${label}.`),
  email: (value) => {
    if (!String(value).trim()) return 'Enter your email address.';
    return isEmail(value) ? '' : 'Enter an email address like name@company.com.';
  },
  maxLength: (label, max) => (value) =>
    String(value).length > max ? `Keep ${label} under ${max} characters.` : '',
  combine:
    (...validators) =>
    (value, values) => {
      for (const validator of validators) {
        const message = validator(value, values);
        if (message) return message;
      }
      return '';
    },
};
