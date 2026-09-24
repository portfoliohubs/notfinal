export type ServiceStatus = 'available' | 'coming-soon';

export interface ServiceDefinition {
  id: 'cv' | 'website' | 'dsd-students' | 'professional-dsd';
  route: string;
  title: string;
  description: string;
  status: ServiceStatus;
  authScope: string;
}

export const SERVICES: readonly ServiceDefinition[] = [
  {
    id: 'cv',
    route: '/cv',
    title: 'CV Builder',
    description: 'Create and download a professional dental CV.',
    status: 'available',
    authScope: 'cv',
  },
  {
    id: 'website',
    route: '/website',
    title: 'Doctor Website',
    description: 'Build a searchable personal website for your clinical work.',
    status: 'available',
    authScope: 'website',
  },
  {
    id: 'dsd-students',
    route: '/dsd-students',
    title: 'DSD للطلبة',
    description: 'A dedicated student DSD workspace is coming soon.',
    status: 'coming-soon',
    authScope: 'dsd-students',
  },
  {
    id: 'professional-dsd',
    route: '/professional-dsd',
    title: 'Professional DSD',
    description: 'A professional DSD workspace is coming soon.',
    status: 'coming-soon',
    authScope: 'professional-dsd',
  },
];

export function getServiceById(id: ServiceDefinition['id']) {
  return SERVICES.find((service) => service.id === id);
}
