const TEMPLATE_STYLE = {
  global: {
    lineHeight: '2',
    fontSize: '16px',
    color: '#3f3f3f',
    letterSpacing: '0.5px'
  },
  title: {
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#000',
    marginBottom: '20px'
  },
  paragraph: {
    marginBottom: '16px',
    textIndent: '0',
    textAlign: 'justify'
  },
  quote: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '17px',
    padding: '15px',
    margin: '20px 0',
    backgroundColor: '#f7f7f7',
    borderLeft: '3px solid #000'
  }
};

export function formatArticle(title, content) {
  const paragraphs = content
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);

  let html = '';

  html += `<section style="text-align:${TEMPLATE_STYLE.title.textAlign};">
  <h2 style="font-size:${TEMPLATE_STYLE.title.fontSize}; font-weight:${TEMPLATE_STYLE.title.fontWeight}; color:${TEMPLATE_STYLE.title.color}; margin-bottom:${TEMPLATE_STYLE.title.marginBottom};">
    ${escapeHtml(title)}
  </h2>
</section>\n\n`;

  for (const para of paragraphs) {
    if (isQuote(para)) {
      html += formatQuote(para);
    } else {
      html += formatParagraph(para);
    }
  }

  return html;
}

function isQuote(text) {
  if (text.startsWith('【') && text.endsWith('】')) {
    return true;
  }
  if (text.length < 30 && !text.includes('，') && !text.includes('。')) {
    return true;
  }
  return false;
}

function formatParagraph(text) {
  return `<p style="line-height:${TEMPLATE_STYLE.global.lineHeight}; font-size:${TEMPLATE_STYLE.global.fontSize}; color:${TEMPLATE_STYLE.global.color}; margin-bottom:${TEMPLATE_STYLE.paragraph.marginBottom}; text-align:${TEMPLATE_STYLE.paragraph.textAlign};">
  ${escapeHtml(text)}
</p>\n\n`;
}

function formatQuote(text) {
  const cleanText = text.replace(/^【|】$/g, '');
  
  return `<section style="text-align:${TEMPLATE_STYLE.quote.textAlign}; font-weight:${TEMPLATE_STYLE.quote.fontWeight}; font-size:${TEMPLATE_STYLE.quote.fontSize}; padding:${TEMPLATE_STYLE.quote.padding}; margin:${TEMPLATE_STYLE.quote.margin}; background-color:${TEMPLATE_STYLE.quote.backgroundColor}; border-left:${TEMPLATE_STYLE.quote.borderLeft};">
  ${escapeHtml(cleanText)}
</section>\n\n`;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

export function generatePreview(content, maxLength = 200) {
  return content
    .replace(/【|】/g, '')
    .substring(0, maxLength) + (content.length > maxLength ? '...' : '');
}

export function formatCompleteArticle(article) {
  const formattedHtml = formatArticle(article.title, article.content);
  const preview = generatePreview(article.content);
  
  return {
    title: article.title,
    content: article.content,
    formattedContent: formattedHtml,
    preview,
    wordCount: article.content.length,
    estimatedReadTime: Math.ceil(article.content.length / 400)
  };
}
