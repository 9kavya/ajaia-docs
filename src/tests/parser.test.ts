import { describe, it, expect } from 'vitest';
import { parseMarkdownToHtml, parsePlainTextToHtml } from '../lib/parser/fileParser';

describe('File Parser', () => {
  it('parses basic markdown headings and formatting into HTML', () => {
    const md = `# Project Alpha\n\nThis is **bold** and *italic* text.\n\n## Subheading\n\nParagraph text.`;
    const html = parseMarkdownToHtml(md);

    expect(html).toContain('<h1>Project Alpha</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
    expect(html).toContain('<h2>Subheading</h2>');
    expect(html).toContain('<p>Paragraph text.</p>');
  });

  it('parses bullet and numbered lists', () => {
    const md = `- Item one\n- Item two\n- Item three`;
    const html = parseMarkdownToHtml(md);

    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Item one</li>');
    expect(html).toContain('<li>Item two</li>');
    expect(html).toContain('<li>Item three</li>');
    expect(html).toContain('</ul>');
  });

  it('parses task checklists', () => {
    const md = `- [x] Completed task\n- [ ] Pending task`;
    const html = parseMarkdownToHtml(md);

    expect(html).toContain('data-type="taskList"');
    expect(html).toContain('data-checked="true"');
    expect(html).toContain('Completed task');
    expect(html).toContain('data-checked="false"');
    expect(html).toContain('Pending task');
  });

  it('parses plain text with double newlines into paragraphs', () => {
    const text = `First paragraph here.\n\nSecond paragraph with multiple\nlines inside.`;
    const html = parsePlainTextToHtml(text);

    expect(html).toContain('<p>First paragraph here.</p>');
    expect(html).toContain('<p>Second paragraph with multiple<br>lines inside.</p>');
  });
});

