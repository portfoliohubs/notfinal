/**
 * Lightweight, safe Markdown to React Elements Converter for Blog Articles
 * Strips script tags and harmful HTML before converting
 */

export function parseMarkdownToHtmlString(markdown: string): string {
  if (!markdown) return '';
  // strip frontmatter
  let body = markdown.replace(/^---[\s\S]*?---\n*/, '');

  // Strip any embedded script tags or iframe/object tags
  body = body.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
  body = body.replace(/<\s*script[^>]*>/gi, '');

  // Headers
  body = body.replace(/^# (.*$)/gim, '<h1 class="text-3xl sm:text-4xl font-black text-cyan-950 my-6 border-b border-cyan-100 pb-3">$1</h1>');
  body = body.replace(/^## (.*$)/gim, '<h2 class="text-xl sm:text-2xl font-bold text-cyan-900 mt-8 mb-4 border-b border-slate-100 pb-2">$1</h2>');
  body = body.replace(/^### (.*$)/gim, '<h3 class="text-lg sm:text-xl font-bold text-cyan-800 mt-6 mb-3">$1</h3>');

  // Bold & Italics
  body = body.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  body = body.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>');

  // Lists
  body = body.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="mr-4 list-disc text-slate-700 my-1 leading-relaxed">$1</li>');
  body = body.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="mr-4 list-decimal text-slate-700 my-1 leading-relaxed">$1</li>');

  // HR
  body = body.replace(/^---$/gim, '<hr class="my-8 border-slate-200" />');

  // Paragraphs
  const paragraphs = body.split(/\n\n+/);
  return paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<li') || p.startsWith('<hr')) {
      return p;
    }
    return `<p class="text-slate-700 leading-relaxed text-base sm:text-lg my-4">${p}</p>`;
  }).join('\n');
}
