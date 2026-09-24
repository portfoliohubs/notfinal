export function publicDoctorUrl(slugOrUrl: string): string {
  const value = slugOrUrl.trim();
  const slug = value
    .replace(/^https?:\/\/[^/]+\/+/, '')
    .replace(/^\/+|\/+$/g, '');
  const doctorPath = slug.startsWith('dr') ? slug : `dr${slug.replace(/^dr\/?/, '')}`;

  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL.slice(0, -1)
    : import.meta.env.BASE_URL;

  return `${window.location.origin}${basePath}/${doctorPath}`;
}
