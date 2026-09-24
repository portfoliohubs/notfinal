import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { 
  MessageCircle, 
  X, 
  Send, 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  ExternalLink, 
  ArrowUpRight,
  ChevronDown,
  RotateCcw,
  User as UserIcon,
  Bot
} from 'lucide-react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  CHATBOT_DECISION_TREE, 
  ChatbotNode, 
  SuggestedAction 
} from '../data/chatbotTree';
import CONFIG from '../config';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  title?: string;
  docSlug?: string;
  actions?: SuggestedAction[];
  isFallback?: boolean;
  timestamp: string;
}

// Arabic normalization helper for robust keyword matching
function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // remove arabic diacritics
    .trim();
}

export default function ContextAwareChatbot() {
  const [location, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeStep, setActiveStep] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Auth Listener: user must be logged in for chatbot to display
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // 2. Real-time Step Detection across Portfolio and CV Wizards
  useEffect(() => {
    const detectActiveStep = () => {
      // Check DOM attribute first
      const stepElem = document.querySelector('[data-wizard-step]');
      if (stepElem) {
        const stepVal = stepElem.getAttribute('data-wizard-step');
        if (stepVal) {
          setActiveStep(stepVal);
          return;
        }
      }

      // Fallback: check the tab-scoped portfolio step index
      if (location.startsWith('/portfolio') || location.startsWith('/website')) {
        const STEPS_LIST = ['intro', 'personal', 'contact', 'photo', 'skills', 'timeline', 'cases'];
        const savedStep = sessionStorage.getItem('portfolio_step');
        if (savedStep) {
          const idx = parseInt(savedStep, 10);
          if (!isNaN(idx) && STEPS_LIST[idx]) {
            setActiveStep(STEPS_LIST[idx]);
            return;
          }
        }
      }

      setActiveStep('');
    };

    detectActiveStep();
    const interval = setInterval(detectActiveStep, 1000);
    return () => clearInterval(interval);
  }, [location]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // 3. Contextual Greeting: Initialize messages on open or route/step change
  const currentContextNode = useMemo((): ChatbotNode => {
    // 1. Match route and step if present
    if (location.startsWith('/portfolio') || location.startsWith('/website')) {
      if (activeStep) {
        const matched = CHATBOT_DECISION_TREE.contextualNodes.find(
          n => (n.routePattern === '/portfolio' || n.routePattern === '/website') && n.stepPattern === activeStep
        );
        if (matched) return matched;
      }
      // Default portfolio node (step intro or cases)
      return CHATBOT_DECISION_TREE.contextualNodes.find(n => n.id === 'ctx-portfolio-intro') || 
             CHATBOT_DECISION_TREE.contextualNodes.find(n => n.id === 'ctx-portfolio-cases') || 
             CHATBOT_DECISION_TREE.contextualNodes[0];
    }

    if (location.startsWith('/cv')) {
      if (activeStep) {
        const matched = CHATBOT_DECISION_TREE.contextualNodes.find(
          n => n.routePattern === '/cv' && n.stepPattern === activeStep
        );
        if (matched) return matched;
      }
      return CHATBOT_DECISION_TREE.contextualNodes.find(n => n.id === 'ctx-cv') || CHATBOT_DECISION_TREE.contextualNodes[0];
    }

    if (location.startsWith('/dashboard')) {
      return CHATBOT_DECISION_TREE.contextualNodes.find(n => n.routePattern === '/dashboard') || CHATBOT_DECISION_TREE.contextualNodes[0];
    }

    if (location.startsWith('/docs')) {
      return CHATBOT_DECISION_TREE.contextualNodes.find(n => n.routePattern === '/docs') || CHATBOT_DECISION_TREE.contextualNodes[0];
    }

    if (location.startsWith('/login')) {
      return CHATBOT_DECISION_TREE.contextualNodes.find(n => n.routePattern === '/login') || CHATBOT_DECISION_TREE.contextualNodes[0];
    }

    // Default general context
    return CHATBOT_DECISION_TREE.contextualNodes[0];
  }, [location, activeStep]);

  // Ref to track last proactive context shown
  const lastContextIdRef = useRef<string>('');

  // Proactive Context Sync: update message if user changes wizard steps
  useEffect(() => {
    const contextKey = `${currentContextNode.id}-${activeStep}`;
    if (lastContextIdRef.current !== contextKey) {
      lastContextIdRef.current = contextKey;
      
      const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      const doctorName = currentUser?.displayName || currentUser?.email?.split('@')[0] || '';
      const personalizedGreeting = doctorName ? `مرحباً دكتور ${doctorName}! ` : 'مرحباً دكتور! ';

      const newGreetingMsg: ChatMessage = {
        id: `ctx-step-${Date.now()}`,
        sender: 'bot',
        title: currentContextNode.titleAr,
        text: `${personalizedGreeting}${currentContextNode.responseAr}`,
        docSlug: currentContextNode.docSlug,
        actions: currentContextNode.suggestedActions,
        timestamp: now
      };

      // If user hasn't typed anything yet or conversation is fresh, replace with current step context
      setMessages(prev => {
        const hasUserMessages = prev.some(m => m.sender === 'user');
        if (!hasUserMessages) {
          return [newGreetingMsg];
        }
        // If user already chatted, append a gentle context transition notification
        return [...prev, newGreetingMsg];
      });
    }
  }, [currentUser, currentContextNode, activeStep]);

  // Reset conversation to current context
  const handleReset = () => {
    const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const doctorName = currentUser?.displayName || currentUser?.email?.split('@')[0] || '';
    const greeting = doctorName ? `مرحباً دكتور ${doctorName}! ` : 'مرحباً دكتور! ';

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        title: currentContextNode.titleAr,
        text: `${greeting}${currentContextNode.responseAr}`,
        docSlug: currentContextNode.docSlug,
        actions: currentContextNode.suggestedActions,
        timestamp: now
      }
    ]);
  };

  // 4. Keyword Matching Engine (Free-text query processing)
  const processUserQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: time
    };

    const normQuery = normalizeText(trimmed);

    // Search against both generalNodes and contextualNodes
    const allNodes = [...CHATBOT_DECISION_TREE.generalNodes, ...CHATBOT_DECISION_TREE.contextualNodes];
    let bestNode: ChatbotNode | null = null;
    let maxScore = 0;

    allNodes.forEach(node => {
      let score = 0;
      node.keywords.forEach(kw => {
        const normKw = normalizeText(kw);
        if (normQuery === normKw) {
          score += 10;
        } else if (normQuery.includes(normKw)) {
          score += 5;
        } else {
          // Check words
          const words = normQuery.split(/\s+/);
          if (words.includes(normKw)) {
            score += 4;
          }
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestNode = node;
      }
    });

    // Create Bot Response
    let botMsg: ChatMessage;

    if (bestNode && maxScore >= 4) {
      botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        title: (bestNode as ChatbotNode).titleAr,
        text: (bestNode as ChatbotNode).responseAr,
        docSlug: (bestNode as ChatbotNode).docSlug,
        actions: (bestNode as ChatbotNode).suggestedActions,
        timestamp: time
      };
    } else {
      // Fallback: direct WhatsApp escalation with prefilled context
      botMsg = {
        id: `bot-fallback-${Date.now()}`,
        sender: 'bot',
        title: 'الدعم الطبي المباشر',
        text: CHATBOT_DECISION_TREE.fallback.messageAr,
        isFallback: true,
        actions: [
          {
            labelAr: 'محادثة الدعم الفني عبر واتساب',
            actionType: 'whatsapp',
            payload: trimmed
          },
          {
            labelAr: 'تصفح مركز التوثيق الشامل',
            actionType: 'navigate',
            payload: '/docs'
          }
        ],
        timestamp: time
      };
    }

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInputText('');
  };

  // 5. Suggested Action Handler
  const handleActionClick = (action: SuggestedAction) => {
    if (action.actionType === 'doc') {
      setLocation(`/docs/${action.payload}`);
      setIsOpen(false);
    } else if (action.actionType === 'navigate') {
      setLocation(action.payload);
      setIsOpen(false);
    } else if (action.actionType === 'query') {
      processUserQuery(action.payload);
    } else if (action.actionType === 'whatsapp') {
      const doctorName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'طبيب أسنان';
      const pageInfo = `${location}${activeStep ? ` (خطوة: ${activeStep})` : ''}`;
      const userText = action.payload;

      const rawMsg = `مرحباً، أنا الدكتور ${doctorName}، أستخدم منصة PortfolioHubs في صفحة ${pageInfo}. ${userText}`;
      const url = `https://wa.me/${CHATBOT_DECISION_TREE.fallback.whatsappNumber}?text=${encodeURIComponent(rawMsg)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Only render for authenticated users (as specified in requirements)
  if (!currentUser) {
    return null;
  }

  return (
    <>
      {/* ── Floating Launcher Bubble (Hotmart style in PortfolioHubs Teal) ── */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="المساعد المهني الذكي"
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-brand hover:bg-brand-dark text-white font-bold text-xs shadow-xl hover:shadow-2xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <div className="relative">
              <MessageCircle className="h-5 w-5 fill-current" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-brand animate-pulse" />
              )}
            </div>
            
            <span className="hidden sm:inline font-bold">
              مساعد PortfolioHubs
            </span>

            {/* Context Badge */}
            {activeStep && (
              <span className="hidden md:inline text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-medium">
                {activeStep}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── Chat Window Modal / Drawer ────────────────────────────────────── */}
      {isOpen && (
        <div 
          className="fixed bottom-5 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[580px] h-[520px] bg-card border border-border/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200"
          dir="rtl"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-brand text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs flex items-center gap-1.5">
                  <span>مساعد PortfolioHubs</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-white/80 font-medium">
                  مساعد سياقي فوري • بدون انتظار
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="إعادة ضبط المحادثة حسب سياق الصفحة"
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="إغلاق المساعد"
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          <div className="px-3.5 py-1.5 bg-brand/10 border-b border-brand/20 flex items-center justify-between text-[11px] text-brand font-semibold">
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {activeStep ? `السياق الحالي: خطوة ${activeStep}` : `الصفحة الحالية: ${location}`}
              </span>
            </div>
            <button
              onClick={() => {
                setLocation('/docs');
                setIsOpen(false);
              }}
              className="text-[10px] text-brand underline hover:opacity-80 shrink-0"
            >
              دليل التوثيق
            </button>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs bg-card-subtle/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`
                    max-w-[88%] p-3.5 rounded-2xl space-y-2 shadow-xs
                    ${msg.sender === 'user'
                      ? 'bg-brand text-white rounded-br-xs'
                      : 'bg-card border border-border text-foreground rounded-bl-xs'
                    }
                  `}
                >
                  {msg.title && (
                    <div className="font-bold text-[11px] text-brand pb-1 border-b border-border/40">
                      {msg.title}
                    </div>
                  )}

                  <div className="leading-relaxed whitespace-pre-line text-xs font-normal">
                    {msg.text}
                  </div>

                  {/* Deep Link to Doc Article if present */}
                  {msg.docSlug && (
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setLocation(`/docs/${msg.docSlug}`);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand hover:underline p-1 rounded-md hover:bg-brand/5 transition-colors"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span>فتح المقال الكامل في مركز التوثيق</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Suggested Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5 border-t border-border/40 mt-1">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(act)}
                          className={`
                            inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all
                            ${act.actionType === 'whatsapp'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              : 'bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20'
                            }
                          `}
                        >
                          {act.actionType === 'whatsapp' && <MessageCircle className="h-3 w-3" />}
                          {act.actionType === 'doc' && <BookOpen className="h-3 w-3" />}
                          <span>{act.labelAr}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-muted-foreground mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              processUserQuery(inputText);
            }}
            className="p-2.5 bg-card border-t border-border flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب سؤالك (مثال: رفع الصور، الرابط، السيو...)"
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-xs"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-brand hover:bg-brand-dark disabled:opacity-40 text-white transition-colors shadow-xs shrink-0"
              aria-label="إرسال"
            >
              <Send className="h-3.5 w-3.5 rotate-180" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
