import { ArrowLeft, Bell, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import Header from '../components/Header';
import type { ServiceDefinition } from '../services';

interface ComingSoonServiceProps {
  service: ServiceDefinition;
}

export default function ComingSoonService({ service }: ComingSoonServiceProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center px-6 py-16 text-center">
        <section className="w-full rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Coming soon
          </p>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">{service.title}</h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-7 text-muted-foreground">
            {service.description} We are preparing the experience carefully and will announce
            the launch when it is ready.
          </p>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" aria-hidden="true" />
            Launch updates will appear here
          </div>
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to services
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
