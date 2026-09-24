import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Link, useRoute } from 'wouter';
import Header from '../components/Header';
import { db } from '../lib/firebase';
import { cloudflareApi } from '../lib/cloudflareApiClient';
import type { PortfolioData } from '../types';

interface PublicWebsiteData extends Omit<Partial<PortfolioData>, 'cases'> {
  sameAs?: string[];
  cases?: Array<{
    id?: string;
    title?: string;
    titleAr?: string;
    category?: string;
    description?: string;
    descriptionAr?: string;
    photos?: Array<{ url?: string; previewUrl?: string; label?: string; labelAr?: string }>;
    beforePhoto?: { url?: string; previewUrl?: string };
    afterPhoto?: { url?: string; previewUrl?: string };
  }>;
}

export default function PublicWebsite() {
  const [, compactParams] = useRoute('/dr:slug');
  const [, slashParams] = useRoute('/dr/:slug');
  const slug = compactParams?.slug || slashParams?.slug || '';
  const [website, setWebsite] = useState<PublicWebsiteData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadWebsite = async () => {
      try {
        // Prefer the Worker public endpoint, while retaining Firestore as a
        // backwards-compatible fallback for existing published websites.
        try {
          const response = await cloudflareApi.getPublishedWebsite(slug);
          if (active) setWebsite(response.data);
          return;
        } catch (apiError) {
          console.warn('[PublicWebsite] Cloudflare API unavailable; using Firebase fallback.', apiError);
        }
        const slugSnapshot = await getDoc(doc(db, 'slugs', slug));
        if (!slugSnapshot.exists()) {
          throw new Error('This website could not be found.');
        }
        const uid = slugSnapshot.data().uid;
        if (typeof uid !== 'string' || !uid) {
          throw new Error('This website has an invalid owner record.');
        }
        const websiteSnapshot = await getDoc(doc(db, 'published_portfolios', uid));
        if (!websiteSnapshot.exists()) {
          throw new Error('This website is not published yet.');
        }
        if (active) setWebsite(websiteSnapshot.data() as PublicWebsiteData);
      } catch (loadError) {
        console.error('[PublicWebsite] Failed to load website:', loadError);
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load this website.');
        }
      }
    };

    if (slug) void loadWebsite();
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!website) return;
    const displayName = website.fullName || 'Dental professional';
    document.title = `${displayName} | PortfolioHubs`;
    const description = website.title || 'Dental professional website powered by PortfolioHubs';
    let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.name = 'description';
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.content = description;
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://portfoliohubs.pages.dev/dr${slug}`;
    const existingSchema = document.querySelector<HTMLScriptElement>('script[data-public-website-schema]');
    const schema = existingSchema || document.createElement('script');
    schema.type = 'application/ld+json';
    schema.dataset.publicWebsiteSchema = 'true';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: displayName,
      jobTitle: website.title || 'Dental professional',
      url: canonical.href,
      image: website.profilePhoto || website.profilePreview,
      sameAs: website.sameAs,
    });
    if (!existingSchema) document.head.appendChild(schema);
  }, [slug, website]);

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-3 text-3xl font-bold">Website unavailable</h1>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <Link href="/" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Back to PortfolioHubs
          </Link>
        </main>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 text-muted-foreground">
          Loading website...
        </main>
      </div>
    );
  }

  const cases = website.cases || [];
  const displayName = website.fullName || 'Dental professional';
  const profilePhoto = website.profilePhoto || website.profilePreview;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-24">
          {profilePhoto && (
            <img
              src={profilePhoto}
              alt={displayName}
              className="mx-auto mb-6 h-28 w-28 rounded-full object-cover ring-4 ring-primary/10"
            />
          )}
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {website.title || 'Dental professional'}
          </p>
          <h1 className="mb-5 text-4xl font-bold tracking-tight sm:text-6xl">{displayName}</h1>
          {website.university && <p className="text-lg text-muted-foreground">{website.university}</p>}
          {website.locationAddress && (
            <p className="mt-2 text-sm text-muted-foreground">{website.locationAddress}</p>
          )}
        </section>

        {cases.length > 0 && (
          <section className="bg-muted/40 px-6 py-16 sm:py-20" aria-labelledby="cases-heading">
            <div className="mx-auto max-w-5xl">
              <h2 id="cases-heading" className="mb-8 text-3xl font-bold">
                Clinical cases
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {cases.map((item, index) => {
                  const photo = item.photos?.[0]?.url || item.photos?.[0]?.previewUrl ||
                    item.afterPhoto?.url || item.beforePhoto?.url;
                  return (
                    <article key={item.id || index} className="overflow-hidden rounded-3xl bg-card shadow-sm">
                      {photo && <img src={photo} alt={item.title || `Clinical case ${index + 1}`} className="aspect-[4/3] w-full object-cover" />}
                      <div className="p-6">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                          {item.category || 'Clinical case'}
                        </p>
                        <h3 className="text-xl font-semibold">{item.title || item.titleAr || 'Clinical case'}</h3>
                        {(item.description || item.descriptionAr) && (
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {item.description || item.descriptionAr}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        PortfolioHubs · {displayName}
      </footer>
    </div>
  );
}
