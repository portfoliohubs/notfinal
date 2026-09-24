export function publicDoctorUrl(slugOrUrl: string): string {
  const value = slugOrUrl.trim();
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  const slug = value
    .replace(/^https?:\/\/[^/]+\/+/, '')
    .replace(/^\/+|\/+$/g, '');
  const doctorPath = slug.startsWith('dr') ? slug : `dr${slug.replace(/^dr\/?/, '')}`;

  if (doctorPath === 'drmichaelnabil') {
    return 'https://portfoliohubs.github.io/drmichaelnabil';
  }

  return `https://portfoliohubs.github.io/${doctorPath}`;
}
