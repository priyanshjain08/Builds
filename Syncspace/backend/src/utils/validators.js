const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value, maxLen = 500) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLen;
}

function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_RE.test(value.trim());
}

function isOneOf(value, allowed) {
  return allowed.includes(value);
}

module.exports = { isNonEmptyString, isValidEmail, isOneOf };
