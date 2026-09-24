import { Link } from 'wouter';
import { 
  FaLinkedin, 
  FaFacebook, 
  FaInstagram, 
  FaWhatsapp 
} from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/60 backdrop-blur-md text-foreground py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="PortfolioHubs Logo" className="w-9 h-9 rounded-xl object-contain bg-primary/10 p-1" />
              <div>
                <span className="font-bold text-lg tracking-tight">PortfolioHubs</span>
                <span className="text-xs text-primary block font-almarai font-semibold">الاسنانجى لازم يتدلع</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg font-almarai" dir="rtl">
              المنصة المتخصصة الأولى لأطباء الأسنان لبناء بورتفوليو رقمي متكامل وموقع ويب رسمي يظهر في محركات بحث Google وإجابات الذكاء الاصطناعي (ChatGPT, Gemini, Perplexity)، أسسها د. مايكل نبيل، طبيب أسنان ومبرمج وخبير ذكاء اصطناعي.
            </p>
            <div className="text-xs text-muted-foreground">
              Founded by <a href="https://portfoliohubs.github.io/drmichaelnabil" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Dr. Michael Nabil</a> (Dentist, Programmer & AI Expert).
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About & Entity</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing (Free)</Link></li>
              <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Clinical Blog</Link></li>
              <li><Link href="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
              <li><Link href="/status" className="hover:text-primary transition-colors">Service Status</Link></li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trust & Security</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><a href="/.well-known/security.txt" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-mono text-xs">security.txt</a></li>
              <li><a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-xs">sitemap.xml</a></li>
              <li><a href="/IndexNowKey.txt" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-xs font-mono">IndexNow Key</a></li>
            </ul>
          </div>
        </div>

        {/* External Trust Signals (Only Active Verified Signals: Facebook, Instagram, WhatsApp, LinkedIn) */}
        <div className="pt-6 border-t border-border flex items-center justify-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-xs text-muted-foreground font-medium mr-1.5">Verified Entity Signals:</span>
            
            {/* Facebook */}
            <a 
              href="https://www.facebook.com/share/1CRkHCYgen/" 
              target="_blank" 
              rel="noopener noreferrer"
              title="PortfolioHubs on Facebook"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-muted/60 hover:bg-muted text-foreground transition-colors border border-border"
            >
              <FaFacebook className="text-[#1877F2] w-3.5 h-3.5" />
              <span>Facebook</span>
            </a>

            {/* Instagram */}
            <a 
              href="https://www.instagram.com/portfoliohubs" 
              target="_blank" 
              rel="noopener noreferrer"
              title="PortfolioHubs on Instagram"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-muted/60 hover:bg-muted text-foreground transition-colors border border-border"
            >
              <FaInstagram className="text-[#E4405F] w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>

            {/* WhatsApp */}
            <a 
              href="https://wa.me/201271476215" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Direct WhatsApp Support"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-muted/60 hover:bg-muted text-foreground transition-colors border border-border"
            >
              <FaWhatsapp className="text-[#25D366] w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* LinkedIn */}
            <a 
              href="https://www.linkedin.com/in/michaelnabilofficial" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Dr. Michael Nabil on LinkedIn"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-muted/60 hover:bg-muted text-foreground transition-colors border border-border"
            >
              <FaLinkedin className="text-[#0A66C2] w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>

            {/*
              [OFF FROM DISPLAY until real verified links are ready]:
              - ORCID: https://orcid.org/0009-0004-9122-3841
              - Google Scholar: https://scholar.google.com/citations?user=portfoliohubs
              - GitHub Org: https://github.com/portfoliohubs
              - Hugging Face: https://huggingface.co/portfoliohubs
              - Product Hunt: https://www.producthunt.com/@portfoliohubs
              - Medium: https://medium.com/@portfoliohubs
            */}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/50">
          <p>© {currentYear} PortfolioHubs. All rights reserved. Every doctor's portfolio is backed by pre-rendered static HTML and verifiable Schema.org metadata.</p>
        </div>
      </div>
    </footer>
  );
}
