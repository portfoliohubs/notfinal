export function getCleanDoctorSlug(input: string): string {
  if (!input) return '';
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+\/+/, '')
    .replace(/^dr[\/-]?/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function publicDoctorUrl(slugOrDoctor: string | { slug?: string; username?: string; fullName?: string; id?: string }): string {
  if (!slugOrDoctor) return 'https://portfoliohubs.github.io';
  
  if (typeof slugOrDoctor === 'string') {
    const trimmed = slugOrDoctor.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      // If someone has an old pages.dev or non-dr URL, normalize to github.io/dr/
      if (trimmed.includes('portfoliohubs.pages.dev') || trimmed.includes('portfoliohubs.github.io')) {
        const slug = trimmed.split('/').filter(Boolean).pop() || '';
        const clean = getCleanDoctorSlug(slug);
        if (clean === 'drmichaelnabil' || clean === 'michaelnabil') {
          return 'https://portfoliohubs.github.io/drmichaelnabil';
        }
        return `https://portfoliohubs.github.io/dr/${clean}`;
      }
      return trimmed;
    }
    const clean = getCleanDoctorSlug(trimmed);
    if (clean === 'drmichaelnabil' || clean === 'michaelnabil') {
      return 'https://portfoliohubs.github.io/drmichaelnabil';
    }
    return `https://portfoliohubs.github.io/dr/${clean}`;
  }

  const raw = slugOrDoctor.slug || slugOrDoctor.username || slugOrDoctor.fullName || slugOrDoctor.id || '';
  const clean = getCleanDoctorSlug(raw);
  if (clean === 'drmichaelnabil' || clean === 'michaelnabil') {
    return 'https://portfoliohubs.github.io/drmichaelnabil';
  }
  return `https://portfoliohubs.github.io/dr/${clean}`;
}

