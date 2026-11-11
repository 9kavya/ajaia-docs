import mammoth from 'mammoth';

export interface ParsedFileResult {
  title: string;
  content: string;
  fileType: string;
}

/**
 * Parses Markdown into HTML for TipTap
 */
export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '<p></p>';

  const lines = markdown.split(/\r?\n/);
  const htmlParts: string[] = [];
  let inList = false;
  let inOrderedList = false;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        htmlParts.push(`<pre><code>${codeBuffer.join('\n')}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        if (inList) {
          htmlParts.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          htmlParts.push('</ol>');
          inOrderedList = false;
        }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(escapeHtml(line));
      continue;
    }

    // Close open lists if blank line or non-list line
    if (!line.trim().startsWith('- ') && !line.trim().startsWith('* ') && inList) {
      htmlParts.push('</ul>');
      inList = false;
    }
    if (!/^\d+\.\s/.test(line.trim()) && inOrderedList) {
      htmlParts.push('</ol>');
      inOrderedList = false;
    }

    if (!line.trim()) {
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      htmlParts.push(`<h1>${formatInline(line.slice(2))}</h1>`);
    } else if (line.startsWith('## ')) {
      htmlParts.push(`<h2>${formatInline(line.slice(3))}</h2>`);
    } else if (line.startsWith('### ')) {
      htmlParts.push(`<h3>${formatInline(line.slice(4))}</h3>`);
    } else if (line.startsWith('#### ')) {
      htmlParts.push(`<h4>${formatInline(line.slice(5))}</h4>`);
    }
    // Blockquote
    else if (line.startsWith('> ')) {
      htmlParts.push(`<blockquote><p>${formatInline(line.slice(2))}</p></blockquote>`);
    }
    // Task list items
    else if (line.trim().startsWith('- [x] ') || line.trim().startsWith('- [ ] ')) {
      const checked = line.trim().startsWith('- [x] ');
      const text = line.trim().slice(6);
      htmlParts.push(
        `<ul data-type="taskList"><li data-checked="${checked}"><label><input type="checkbox" ${
          checked ? 'checked="checked"' : ''
        }><span></span></label><div><p>${formatInline(text)}</p></div></li></ul>`
      );
    }
    // Bullet list
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      const itemText = line.trim().replace(/^[-*]\s+/, '');
      htmlParts.push(`<li>${formatInline(itemText)}</li>`);
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line.trim())) {
      if (!inOrderedList) {
        htmlParts.push('<ol>');
        inOrderedList = true;
      }
      const itemText = line.trim().replace(/^\d+\.\s+/, '');
      htmlParts.push(`<li>${formatInline(itemText)}</li>`);
    }
    // Standard paragraph
    else {
      htmlParts.push(`<p>${formatInline(line)}</p>`);
    }
  }

  if (inList) htmlParts.push('</ul>');
  if (inOrderedList) htmlParts.push('</ol>');
  if (inCodeBlock && codeBuffer.length > 0) {
    htmlParts.push(`<pre><code>${codeBuffer.join('\n')}</code></pre>`);
  }

  return htmlParts.join('') || '<p></p>';
}

/**
 * Format inline markdown tokens: bold, italic, underline/strikethrough, inline code
 */
function formatInline(text: string): string {
  let res = escapeHtml(text);

  // Bold & Italic: ***text***
  res = res.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');

  // Bold: **text** or __text__
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  res = res.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
  res = res.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Strikethrough: ~~text~~
  res = res.replace(/~~(.*?)~~/g, '<s>$1</s>');

  // Inline code: `text`
  res = res.replace(/`([^`]+)`/g, '<code>$1</code>');

  return res;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Parses Plaintext into paragraphs
 */
export function parsePlainTextToHtml(text: string): string {
  if (!text) return '<p></p>';
  const paragraphs = text.split(/\r?\n\r?\n/);
  return paragraphs
    .map((para) => {
      const escaped = escapeHtml(para.trim());
      return escaped ? `<p>${escaped.replace(/\r?\n/g, '<br>')}</p>` : '';
    })
    .filter(Boolean)
    .join('');
}

/**
 * Parses uploaded file buffer or string based on extension
 */
export async function parseUploadedFile(
  filename: string,
  buffer: Buffer | string
): Promise<ParsedFileResult> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const baseTitle = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const title = baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1);

  if (ext === 'md' || ext === 'markdown') {
    const text = typeof buffer === 'string' ? buffer : buffer.toString('utf-8');
    return {
      title,
      content: parseMarkdownToHtml(text),
      fileType: 'markdown',
    };
  }

  if (ext === 'txt') {
    const text = typeof buffer === 'string' ? buffer : buffer.toString('utf-8');
    return {
      title,
      content: parsePlainTextToHtml(text),
      fileType: 'plaintext',
    };
  }

  if (ext === 'docx') {
    const rawBuffer = typeof buffer === 'string' ? Buffer.from(buffer, 'base64') : buffer;
    const result = await mammoth.convertToHtml({ buffer: rawBuffer });
    return {
      title,
      content: result.value || '<p></p>',
      fileType: 'docx',
    };
  }

  if (ext === 'json') {
    const text = typeof buffer === 'string' ? buffer : buffer.toString('utf-8');
    try {
      const parsed = JSON.parse(text);
      return {
        title: parsed.title || title,
        content: parsed.content || `<p>${escapeHtml(text)}</p>`,
        fileType: 'json',
      };
    } catch {
      return {
        title,
        content: `<p>${escapeHtml(text)}</p>`,
        fileType: 'json',
      };
    }
  }

  // Fallback for other plain text types (e.g. .csv, .log)
  const text = typeof buffer === 'string' ? buffer : buffer.toString('utf-8');
  return {
    title,
    content: parsePlainTextToHtml(text),
    fileType: 'text',
  };
}
