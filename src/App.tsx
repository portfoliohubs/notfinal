import { Route, Router, Switch } from 'wouter';
import { ThemeProvider } from './components/ThemeProvider';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import PortfolioWizard from './pages/PortfolioWizard';
import CVWizard from './pages/CVWizard';
import PublicBlog from './pages/PublicBlog';
import PublicArticle from './pages/PublicArticle';
import DocumentationCenter from './pages/DocumentationCenter';
import ComingSoonService from './pages/ComingSoonService';
import PublicWebsite from './pages/PublicWebsite';
import { getServiceById } from './services';
import PlatformPage from './pages/PlatformPage';
import ContextAwareChatbot from './components/ContextAwareChatbot';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Router>
        <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/website" component={PortfolioWizard} />
        {/* Backward-compatible alias for existing bookmarks and shared links. */}
        <Route path="/portfolio" component={PortfolioWizard} />
        <Route path="/cv" component={CVWizard} />
        <Route path="/dsd-students">
          <ComingSoonService service={getServiceById('dsd-students')!} />
        </Route>
        <Route path="/professional-dsd">
          <ComingSoonService service={getServiceById('professional-dsd')!} />
        </Route>
        <Route path="/blog" component={PublicBlog} />
        <Route path="/blog/:slug" component={PublicArticle} />
        <Route path="/docs" component={DocumentationCenter} />
        <Route path="/docs/:slug" component={DocumentationCenter} />
        <Route path="/about"><PlatformPage kind="about" /></Route>
        <Route path="/pricing"><PlatformPage kind="pricing" /></Route>
        <Route path="/contact"><PlatformPage kind="contact" /></Route>
        <Route path="/privacy"><PlatformPage kind="privacy" /></Route>
        <Route path="/terms"><PlatformPage kind="terms" /></Route>
        <Route path="/changelog"><PlatformPage kind="changelog" /></Route>
        <Route path="/status"><PlatformPage kind="status" /></Route>
        <Route path="/dr:slug" component={PublicWebsite} />
        <Route path="/dr/:slug" component={PublicWebsite} />
        {/* Direct doctor vanity path fallback (e.g., /michael1 or /dr-michael1) */}
        <Route path="/:slug" component={PublicWebsite} />
        {/* Fallback route */}
        <Route component={HomePage} />
        </Switch>
      </Router>

      {/* Lazy-loaded Hotmart-style Context-Aware Chatbot (appears across pages after auth) */}
      <ContextAwareChatbot />
    </ThemeProvider>
  );
}
