import { Link } from 'wouter';
import Header from '../components/Header';

type PlatformPageKind =
  | 'about'
  | 'pricing'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'changelog'
  | 'status';

const PAGE_CONTENT: Record<PlatformPageKind, {
  label: string;
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
}> = {
  about: {
    label: 'Entity home',
    title: 'PortfolioHubs',
    intro: 'PortfolioHubs helps dental professionals create a credible digital presence, publish clinical work, and prepare professional CVs.',
    sections: [
      { heading: 'The founder', body: 'Michael is a dentist, programmer, and AI expert building practical tools for dental professionals and students.' },
      { heading: 'Our promise', body: 'The platform keeps each service maintainable, clear, and focused: a searchable website experience, a protected CV workflow, and future specialist workspaces.' },
      { heading: 'Brand message', body: 'PortfolioHubs is the home for professional dental identity online — الاسنانجى لازم يتدلع.' },
    ],
  },
  pricing: {
    label: 'Pricing',
    title: 'Start free',
    intro: 'Build your first professional presence without a subscription barrier.',
    sections: [
      { heading: 'Website', body: 'The free website experience includes a configured case allowance. Promo codes can increase the allowance when provided by PortfolioHubs.' },
      { heading: 'CV', body: 'The CV builder is available for free and supports PDF and editable PPTX export.' },
      { heading: 'Future services', body: 'DSD للطلبة and Professional DSD will receive separate pricing and access terms when launched.' },
    ],
  },
  contact: {
    label: 'Contact',
    title: 'Let’s stay connected',
    intro: 'For support, security reports, partnerships, or account questions, contact the PortfolioHubs team.',
    sections: [
      { heading: 'General support', body: 'Email portfoliohubs.contact@gmail.com with your account email, service, and a concise description of the issue.' },
      { heading: 'Security reports', body: 'Please use the security contact listed in /.well-known/security.txt. Do not include passwords, private keys, or unnecessary patient information.' },
    ],
  },
  privacy: {
    label: 'Privacy',
    title: 'Privacy Policy',
    intro: 'We collect only the information required to provide the selected PortfolioHubs service.',
    sections: [
      { heading: 'Information we process', body: 'Account identifiers, profile content, website content, uploaded media, and operational events such as save or download actions may be processed to provide the service.' },
      { heading: 'Storage and access', body: 'Website media is stored in Firebase Storage and metadata is stored in Firestore. Access is controlled by account ownership and administrative rules.' },
      { heading: 'Your responsibility', body: 'Do not upload identifiable patient information unless you have the necessary consent and legal basis. Remove sensitive data before uploading clinical cases.' },
      { heading: 'Requests', body: 'Contact portfoliohubs.contact@gmail.com to ask about access, correction, or deletion of your account data.' },
    ],
  },
  terms: {
    label: 'Terms',
    title: 'Terms of Service',
    intro: 'By using PortfolioHubs, you agree to use the platform lawfully and responsibly.',
    sections: [
      { heading: 'Acceptable use', body: 'You are responsible for your account, uploaded content, professional claims, patient permissions, and the accuracy of published information.' },
      { heading: 'Publishing', body: 'PortfolioHubs may review, delay, reject, or unpublish content that violates the law, privacy rights, platform safety, or these terms.' },
      { heading: 'Availability', body: 'We work to keep the service reliable but cannot guarantee uninterrupted availability or search-engine ranking.' },
      { heading: 'Changes', body: 'Material changes will be reflected on this page with an updated publication date.' },
    ],
  },
  changelog: {
    label: 'Changelog',
    title: 'Product updates',
    intro: 'A transparent record of meaningful PortfolioHubs changes.',
    sections: [
      { heading: 'September 2026', body: 'Introduced the Firebase Hosting architecture, /website service route, Storage-backed clinical media staging, public doctor website lookup, service placeholders, and configurable CV download advertising.' },
      { heading: 'Next', body: 'The next release will expand the public SEO content surface, improve static doctor-page generation, and complete production route verification.' },
    ],
  },
  status: {
    label: 'Status',
    title: 'PortfolioHubs service status',
    intro: 'Current operational status for public PortfolioHubs services.',
    sections: [
      { heading: 'Website builder', body: 'Operational in the current release. Firebase Authentication, Firestore, and Storage availability may affect individual actions.' },
      { heading: 'CV builder', body: 'Operational in the current release. PDF and PPTX generation runs in the browser.' },
      { heading: 'Public websites', body: 'Operational for published records and available when the associated Firebase data is published.' },
      { heading: 'Report an incident', body: 'Contact portfoliohubs.contact@gmail.com with the affected route and approximate time.' },
    ],
  },
};

interface PlatformPageProps {
  kind: PlatformPageKind;
}

export default function PlatformPage({ kind }: PlatformPageProps) {
  const content = PAGE_CONTENT[kind];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{content.label}</p>
        <h1 className="mb-5 text-4xl font-bold tracking-tight sm:text-6xl">{content.title}</h1>
        <p className="mb-12 max-w-2xl text-lg leading-8 text-muted-foreground">{content.intro}</p>
        <div className="space-y-5">
          {content.sections.map((section) => (
            <section key={section.heading} className="rounded-3xl border border-border bg-card p-6 sm:p-8">
              <h2 className="mb-3 text-xl font-bold">{section.heading}</h2>
              <p className="leading-7 text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-3 text-sm">
          <Link href="/" className="rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground">Back home</Link>
          <Link href="/docs" className="rounded-full border border-border px-5 py-3 font-semibold">Read documentation</Link>
          <Link href="/contact" className="rounded-full border border-border px-5 py-3 font-semibold">Contact</Link>
        </div>
      </main>
    </div>
  );
}
