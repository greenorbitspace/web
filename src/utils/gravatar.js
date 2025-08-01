import { createHash } from 'crypto';

export function getGravatarUrl(email, size = 80) {
  const hash = createHash('md5').update(email.trim().toLowerCase()).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}