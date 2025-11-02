import bcrypt from 'bcryptjs';
import { P as PAGINATION_DEFAULTS } from './error-handler_KWzIATZF.mjs';

const SALT_ROUNDS = 10;
async function hashPin(pin) {
  return bcrypt.hash(pin, SALT_ROUNDS);
}
async function verifyPin(pin, hash) {
  return bcrypt.compare(pin, hash);
}

const password = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  hashPin,
  verifyPin
}, Symbol.toStringTag, { value: 'Module' }));

function parsePaginationParams(params) {
  const page = Math.max(1, params.page ?? PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(
    Math.max(1, params.limit ?? PAGINATION_DEFAULTS.LIMIT),
    PAGINATION_DEFAULTS.MAX_LIMIT
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export { password as a, hashPin as h, parsePaginationParams as p, verifyPin as v };
