import { useState } from 'react';
import { Link } from 'wouter';
import { FileText, Search, CheckCircle, ArrowRight, UserCheck, PlusCircle } from 'lucide-react';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import Header from '../components/Header';
import CONFIG from '../config';
import { gtagEvent } from '../lib/gtag';
import { SERVICES } from '../services';
import { publicDoctorUrl } from '../lib/publicSiteUrl';

const localExamplePhotos = [
  '/examples/dr-michael-nabil.jpg',
  '/examples/dr-hanan-sakr.jpg',
  '/examples/dr-roaa-adel.jpg',
  '/examples/dr-hossam-lotfy.jpg',
  '/examples/dr-rawan-mahmoud.jpg',
  '/examples/dr-abanoub-nageh.jpg',
  '/examples/dr-abrar-kamal.jpg',
  '/examples/dr-youstina-elkes.jpg',
  '/examples/dr-eslam-anas.jpg',
];

export default function HomePage() {
  const [showPortfolioOptions, setShowPortfolioOptions] = useState(false);
  const hasSocial =
    CONFIG.social.facebook || CONFIG.social.instagram || CONFIG.social.whatsapp;

  return (
    <div className="site-shell flex min-h-screen flex-col transition-colors duration-200">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* Hero */}
        <div className="max-w-4xl mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Free · No registration required
          </div>

          <h1 className="display-heading mb-5">
            {CONFIG.home.headline}
          </h1>

          <p className="text-base text-muted-foreground font-almarai" dir="rtl">
            {CONFIG.home.subheadline}
          </p>
        </div>

        {/* Two big pathway cards */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Portfolio */}
          {!showPortfolioOptions ? (
            <button
              onClick={() => {
                gtagEvent('portfolio_start', { source: 'homepage' });
                setShowPortfolioOptions(true);
              }}
              className="group w-full text-left rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/15 dark:from-primary/10 dark:to-primary/20 p-6 hover:shadow-lg hover:border-primary/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer h-full flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-1 leading-tight">
                  {CONFIG.home.portfolioButtonTitle}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {CONFIG.home.portfolioButtonSubtitle}
                </p>
              </div>
            </button>
          ) : (
            <div className="w-full rounded-2xl border-2 border-primary bg-card p-4 sm:p-5 flex flex-col justify-between shadow-lg animate-in fade-in zoom-in-95 duration-150 min-h-[190px]">
              <div>
                <h3 className="font-bold text-sm text-foreground mb-2.5 px-1">Choose Option</h3>
                <div className="space-y-2">
                  <Link href="/website">
                    <button className="w-full text-left p-2.5 rounded-xl border border-border bg-background hover:bg-muted/80 transition flex items-center gap-2.5 cursor-pointer group">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white text-primary transition-colors">
                        <PlusCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-foreground leading-snug">I want to create my portfolio</div>
                        <div className="text-[11px] text-muted-foreground">Start the step-by-step wizard</div>
                      </div>
                    </button>
                  </Link>
                  <Link href="/login?mode=signin&service=website">
                    <button className="w-full text-left p-2.5 rounded-xl border border-border bg-background hover:bg-muted/80 transition flex items-center gap-2.5 cursor-pointer group">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white text-primary transition-colors">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-foreground leading-snug">I already have a portfolio</div>
                        <div className="text-[11px] text-muted-foreground">Sign in to your dashboard</div>
                      </div>
                    </button>
                  </Link>
                </div>
              </div>
              <button 
                onClick={() => setShowPortfolioOptions(false)}
                className="text-xs text-center text-muted-foreground hover:text-foreground pt-2 cursor-pointer font-medium"
              >
                Cancel
              </button>
            </div>
          )}

          {/* CV PDF */}
          <Link href="/cv">
            <button
              onClick={() => gtagEvent('cv_start', { source: 'homepage' })}
              className="group w-full text-left rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-200 p-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer h-full flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/90 flex items-center justify-center shadow-md">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-1 leading-tight">
                  {CONFIG.home.cvButtonTitle}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {CONFIG.home.cvButtonSubtitle}
                </p>
              </div>
            </button>
          </Link>
        </div>

        <section className="w-full max-w-2xl mb-10" aria-labelledby="services-heading">
          <h2 id="services-heading" className="mb-4 text-center text-lg font-bold text-foreground">
            PortfolioHubs Smika services
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SERVICES.filter((service) => service.id !== 'cv' && service.id !== 'website').map((service) => (
              <Link key={service.id} href={service.route}>
                <span className="flex h-full items-center justify-between rounded-2xl border border-border bg-card p-4 transition hover:border-primary/50 hover:bg-muted/40">
                  <span>
                    <span className="block font-semibold text-foreground">{service.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{service.description}</span>
                  </span>
                  <span className="ml-3 shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    Coming soon
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Features list */}
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-10">
          {CONFIG.home.features.map((f) => (
            <li key={f} className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* User counter */}
        <div className="mb-8 flex flex-col items-center gap-1">
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            <span className="text-4xl font-extrabold bg-gradient-to-r from-cyan-600 to-cyan-800 dark:from-cyan-400 dark:to-cyan-300 bg-clip-text text-transparent leading-none tabular-nums">
              {CONFIG.home.usersCount}
            </span>
            <span className="text-sm text-muted-foreground leading-tight max-w-[120px]">
              {CONFIG.home.usersCountLabel}
            </span>
          </div>
        </div>

        {/* Live Examples */}
        {(CONFIG.portfolioIntro.liveExamples ?? []).filter(ex => ex.name.trim() !== '').length > 0 && (
          <div className="w-full max-w-2xl mb-10 space-y-4">
            <h3 className="text-base font-bold text-foreground text-center">
              Live Examples, Click and see live
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              {(CONFIG.portfolioIntro.liveExamples ?? [])
                .filter(ex => ex.name.trim() !== '')
                .map((ex, i) => {
                  const initialPhoto = localExamplePhotos[i] || ex.photo;
                  return (
                    <a
                      key={i}
                      href={publicDoctorUrl(ex.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 group w-20"
                      onClick={() => gtagEvent('live_example_click', { name: ex.name, source: 'homepage' })}
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-colors bg-muted flex items-center justify-center shrink-0 relative shadow-xs">
                        {initialPhoto ? (
                          <img
                            src={initialPhoto}
                            alt={ex.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // If local fails, try original remote url
                              if (e.currentTarget.src.includes('/examples/') && ex.photo) {
                                e.currentTarget.src = ex.photo;
                              } else {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.avatar-initial');
                                if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                              }
                            }}
                          />
                        ) : null}
                        <span className={`avatar-initial text-2xl font-bold text-primary/40 ${initialPhoto ? 'hidden' : ''}`}>
                          {ex.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-foreground text-center leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {ex.name}
                      </span>
                    </a>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-4 px-4 flex flex-col items-center gap-2">
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground" aria-label="Platform">
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link href="/docs" className="hover:text-foreground">Docs</Link>
          <Link href="/changelog" className="hover:text-foreground">Changelog</Link>
          <Link href="/status" className="hover:text-foreground">Status</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
        </nav>
        <div className="text-xs text-muted-foreground text-center">
          <span className="font-semibold text-foreground">{CONFIG.brand.name}</span>
          {' · '}
          <span className="font-almarai" dir="rtl">{CONFIG.brand.slogan}</span>
        </div>

        {/* Social icons */}
        {hasSocial && (
          <div className="flex items-center gap-4">
            {CONFIG.social.facebook && (
              <a
                href={CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted-foreground hover:text-blue-600 transition-colors"
                onClick={() => gtagEvent('social_click', { platform: 'facebook', source: 'homepage' })}
              >
                <FaFacebook size={20} />
              </a>
            )}
            {CONFIG.social.instagram && (
              <a
                href={CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-pink-500 transition-colors"
                onClick={() => gtagEvent('social_click', { platform: 'instagram', source: 'homepage' })}
              >
                <FaInstagram size={20} />
              </a>
            )}
            {CONFIG.social.whatsapp && (
              <a
                href={CONFIG.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-muted-foreground hover:text-green-500 transition-colors"
                onClick={() => gtagEvent('social_click', { platform: 'whatsapp', source: 'homepage' })}
              >
                <FaWhatsapp size={20} />
              </a>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
