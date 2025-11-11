/**
 * Article Content Processor
 *
 * Processes HTML content from articles and replaces specific patterns with React components:
 * - Expand/collapse divs → Accordion components
 * - Attention blocks (caution, tip, info, warning) → AttentionBlock components
 * - Internal article links [[text >|id]] → proper links
 */

import React from 'react';
import parse, { Element, domToReact, type HTMLReactParserOptions, type DOMNode } from 'html-react-parser';
import Accordion from '../components/article/Accordion';
import AttentionBlock, { type AttentionType } from '../components/article/AttentionBlock';
import Typography from '../components/article/Typography';
import { getArticleUrl, shouldOpenInNewTab } from './articleAPI';

interface ProcessorOptions {
  region?: string;
}

/**
 * Extracts text content from an element (span, anchor, etc.)
 * Removes the down arrow prefix (▼) if present
 */
function extractTextContent(element: Element): string {
  if (!element.children) return '';

  const text = element.children
    .map((child) => {
      if (child.type === 'text') {
        return (child as any).data || '';
      }
      if (child instanceof Element) {
        return extractTextContent(child);
      }
      return '';
    })
    .join('')
    .trim();

  // Remove the down arrow prefix and extra whitespace
  return text.replace(/^[▼▽]\s*/, '').trim();
}

/**
 * Extracts text content from a span element that contains article links
 * @deprecated Use extractTextContent instead
 */
function extractTextFromSpan(element: Element): string {
  return extractTextContent(element);
}

/**
 * Removes attention block title markup from HTML content
 * Strips out <img>, <strong>TITLE:</strong> patterns
 */
function stripAttentionBlockTitle(html: string): string {
  // Remove attention block images
  let cleaned = html.replace(/<img[^>]*?content_(tip|caution|info|warning|note)\.gif[^>]*?>/gi, '');

  // Remove title markup like <strong>TIP:</strong> or <strong>NOTE:</strong>
  cleaned = cleaned.replace(/<strong>\s*(TIP|CAUTION|INFO|WARNING|NOTE)\s*:?\s*<\/strong>\s*/gi, '');

  // Trim any leading/trailing whitespace
  return cleaned.trim();
}

/**
 * Extracts inner HTML from an element as a string
 */
function getInnerHTML(element: Element): string {
  if (!element.children) return '';

  // Convert children back to HTML string
  const childrenHTML = element.children
    .map((child: any) => {
      if (child.type === 'text') {
        return child.data || '';
      }
      if (child.type === 'tag') {
        const attrs = Object.entries(child.attribs || {})
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');
        const attrsStr = attrs ? ` ${attrs}` : '';
        const innerHTML = getInnerHTML(child);
        return `<${child.name}${attrsStr}>${innerHTML}</${child.name}>`;
      }
      return '';
    })
    .join('');

  return childrenHTML;
}

/**
 * Pre-processes content to convert internal article link patterns to HTML anchors
 * Converts [[link text >|article_id]] or [[link text|article_id]] to <a href="...">link text</a>
 */
function preprocessInternalLinks(content: string, region: string): string {
  // Match both formats:
  // - [[text >|15-digit-id]] or [[text &gt;|15-digit-id]] (with >)
  // - [[text|15-digit-id]] (without >)
  const linkRegex = /\[\[([^\]]+?)(?:(?:>|&gt;)\||\|)(\d{15})\]\]/g;

  return content.replace(linkRegex, (match, linkText, articleId) => {
    const url = getArticleUrl(articleId, region);
    const isExternal = shouldOpenInNewTab(url);

    const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${url}"${targetAttr} data-internal-link="true">${linkText}</a>`;
  });
}

/**
 * Processes article HTML content and replaces patterns with React components
 */
export function processArticleContent(
  content: string,
  options: ProcessorOptions = {}
): React.ReactNode {
  const { region = 'gb' } = options;

  // Pre-process internal links before parsing
  const processedContent = preprocessInternalLinks(content, region);

  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (!(domNode instanceof Element)) return;

      const element = domNode as Element;

      // Replace expand-collapse elements with Accordion component
      // Can be on div, h4, or other elements
      if (element.attribs?.class?.includes('expand-collapse')) {
        // Find the anchor tag with the title (usually a direct child)
        const anchor = element.children?.find(
          (child) => child instanceof Element && (child as Element).name === 'a'
        ) as Element | undefined;

        // Find the content div (the collapsible part)
        // First try to find it as a child
        let contentDiv = element.children?.find(
          (child) =>
            child instanceof Element &&
            (child as Element).name === 'div' &&
            (child as Element).attribs?.class?.includes('collapse')
        ) as Element | undefined;

        // If not found in children, try to find it as a sibling
        if (!contentDiv && (domNode as any).parent) {
          const parent = (domNode as any).parent;
          if (parent.children) {
            // Find the next sibling that is a collapse div
            let foundCurrent = false;
            for (const sibling of parent.children) {
              if (sibling === domNode) {
                foundCurrent = true;
                continue;
              }
              if (
                foundCurrent &&
                sibling instanceof Element &&
                (sibling as Element).name === 'div' &&
                (sibling as Element).attribs?.class?.includes('collapse')
              ) {
                contentDiv = sibling as Element;
                break;
              }
            }
          }
        }

        if (anchor && contentDiv) {
          // Extract title from the anchor (either from span or directly from text)
          const titleSpan = anchor.children?.find(
            (child) => child instanceof Element && (child as Element).name === 'span'
          ) as Element | undefined;

          // If there's a span, extract from it; otherwise extract directly from anchor
          const title = titleSpan
            ? extractTextContent(titleSpan)
            : extractTextContent(anchor) || 'Show more';

          const contentHTML = getInnerHTML(contentDiv);

          // Return accordion and mark the collapse div as processed so it doesn't render separately
          if ((domNode as any).parent) {
            (contentDiv as any)._processed = true;
          }

          return <Accordion key={element.attribs?.id || Math.random()} title={title} content={contentHTML} />;
        }
      }

      // Skip rendering collapse divs that were already processed as part of an accordion
      if (
        element.name === 'div' &&
        element.attribs?.class?.includes('collapse') &&
        (element as any)._processed
      ) {
        return <React.Fragment key={Math.random()}></React.Fragment>;
      }

      // Replace content-block-uki divs with ContentCard component
      if (element.name === 'div' && element.attribs?.class?.includes('content-block-uki')) {
        const cardChildren = element.children ? domToReact(element.children as DOMNode[], parserOptions) : null;
        return <Typography.ContentCard key={Math.random()}>{cardChildren}</Typography.ContentCard>;
      }

      // Replace attention blocks (caution, tip, info, warning, note)
      // Format 1: <span class="ra-content-*">
      if (element.name === 'span' && element.attribs?.class) {
        const className = element.attribs.class;
        let type: AttentionType | null = null;
        let defaultTitle = '';

        if (className.includes('ra-content-caution')) {
          type = 'caution';
          defaultTitle = 'CAUTION';
        } else if (className.includes('ra-content-tip')) {
          type = 'tip';
          defaultTitle = 'TIP';
        } else if (className.includes('ra-content-info')) {
          type = 'info';
          defaultTitle = 'INFO';
        } else if (className.includes('ra-content-warning')) {
          type = 'warning';
          defaultTitle = 'WARNING';
        } else if (className.includes('ra-content-note')) {
          type = 'note';
          defaultTitle = 'NOTE';
        }

        if (type) {
          // Find the title and description spans (for older format)
          const titleSpan = element.children?.find(
            (child) =>
              child instanceof Element &&
              (child as Element).attribs?.class?.includes('ra-att-title')
          ) as Element | undefined;

          const descSpan = element.children?.find(
            (child) =>
              child instanceof Element &&
              (child as Element).attribs?.class?.includes('ra-att-desc')
          ) as Element | undefined;

          // Also check for <strong> tag (used in NOTE format)
          const strongTag = element.children?.find(
            (child) => child instanceof Element && (child as Element).name === 'strong'
          ) as Element | undefined;

          // Extract title - prefer titleSpan, then strongTag, then default
          let title = defaultTitle;
          if (titleSpan) {
            title = extractTextContent(titleSpan).replace(':', '');
          } else if (strongTag) {
            title = extractTextContent(strongTag).replace(':', '');
          }

          // Extract content - prefer descSpan, otherwise get all content from element
          let content = descSpan ? getInnerHTML(descSpan) : getInnerHTML(element);

          // Strip duplicate title markup and images from content
          content = stripAttentionBlockTitle(content);

          return <AttentionBlock key={Math.random()} type={type} title={title} content={content} />;
        }
      }

      // Format 2: <p style="color: #..."> with content images
      if (element.name === 'p' && element.attribs?.style) {
        const style = element.attribs.style;
        let type: AttentionType | null = null;
        let defaultTitle = '';

        // Detect type by color code
        if (style.includes('#b94a48') || style.includes('rgb(185, 74, 72)')) {
          type = 'caution';
          defaultTitle = 'CAUTION';
        } else if (style.includes('#3a87ad') || style.includes('rgb(58, 135, 173)')) {
          type = 'tip';
          defaultTitle = 'TIP';
        } else if (style.includes('#2d6987') || style.includes('rgb(45, 105, 135)')) {
          type = 'info';
          defaultTitle = 'INFO';
        } else if (style.includes('#c09853') || style.includes('rgb(192, 152, 83)')) {
          type = 'warning';
          defaultTitle = 'WARNING';
        } else if (style.includes('#468847') || style.includes('rgb(70, 136, 71)')) {
          type = 'note';
          defaultTitle = 'NOTE';
        }

        if (type) {
          // Check for <strong> tag with title
          const strongTag = element.children?.find(
            (child) => child instanceof Element && (child as Element).name === 'strong'
          ) as Element | undefined;

          // Extract title - prefer strongTag, then default
          let title = defaultTitle;
          if (strongTag) {
            title = extractTextContent(strongTag).replace(':', '');
          }

          // Extract content from element
          let content = getInnerHTML(element);

          // Strip duplicate title markup and images from content
          content = stripAttentionBlockTitle(content);

          return <AttentionBlock key={Math.random()} type={type} title={title} content={content} />;
        }
      }

      // Replace standard HTML elements with Typography components
      const children = element.children ? domToReact(element.children as DOMNode[], parserOptions) : null;
      const className = element.attribs?.class || '';

      switch (element.name) {
        case 'h1':
          return <Typography.H1 className={className}>{children}</Typography.H1>;
        case 'h2':
          return <Typography.H2 className={className}>{children}</Typography.H2>;
        case 'h3':
          return <Typography.H3 className={className}>{children}</Typography.H3>;
        case 'h4':
          return <Typography.H4 className={className}>{children}</Typography.H4>;
        case 'h5':
          return <Typography.H5 className={className}>{children}</Typography.H5>;
        case 'h6':
          return <Typography.H6 className={className}>{children}</Typography.H6>;
        case 'p':
          // Filter out empty paragraphs (only containing &nbsp; or whitespace)
          const textContent = extractTextContent(element);
          if (!textContent || textContent.trim() === '' || textContent.trim() === '\u00A0') {
            return <React.Fragment key={Math.random()}></React.Fragment>;
          }
          return <Typography.P className={className}>{children}</Typography.P>;
        case 'ul':
          return <Typography.UL className={className}>{children}</Typography.UL>;
        case 'ol':
          return <Typography.OL className={className}>{children}</Typography.OL>;
        case 'li':
          return <Typography.LI className={className}>{children}</Typography.LI>;
        case 'strong':
        case 'b':
          return <Typography.Strong className={className}>{children}</Typography.Strong>;
        case 'em':
        case 'i':
          return <Typography.Em className={className}>{children}</Typography.Em>;
        case 'a':
          // Check if this is a button link (has 'btn' class or button styling)
          const isButton = className.includes('btn') || className.includes('button');

          if (isButton) {
            return (
              <Typography.Button
                href={element.attribs?.href}
                target={element.attribs?.target}
                rel={element.attribs?.rel}
                className={className}
              >
                {children}
              </Typography.Button>
            );
          }

          return (
            <Typography.A
              href={element.attribs?.href}
              target={element.attribs?.target}
              rel={element.attribs?.rel}
              className={className}
            >
              {children}
            </Typography.A>
          );
        case 'code':
          return <Typography.Code className={className}>{children}</Typography.Code>;
        case 'pre':
          return <Typography.Pre className={className}>{children}</Typography.Pre>;
        case 'blockquote':
          return <Typography.Blockquote className={className}>{children}</Typography.Blockquote>;
        case 'hr':
          return <Typography.HR className={className} />;
        case 'img':
          return (
            <Typography.Img
              src={element.attribs?.src}
              alt={element.attribs?.alt}
              className={className}
            />
          );
        case 'table':
          return <Typography.Table className={className}>{children}</Typography.Table>;
        case 'thead':
          return <Typography.Thead className={className}>{children}</Typography.Thead>;
        case 'tbody':
          return <Typography.Tbody className={className}>{children}</Typography.Tbody>;
        case 'tr':
          return <Typography.Tr className={className}>{children}</Typography.Tr>;
        case 'th':
          return <Typography.Th className={className}>{children}</Typography.Th>;
        case 'td':
          return <Typography.Td className={className}>{children}</Typography.Td>;
        case 'div':
          // Only replace divs that don't have special classes (like expand-collapse, content-block-uki)
          if (!className.includes('expand-collapse') && !className.includes('collapse') && !className.includes('content-block-uki')) {
            return <Typography.Div className={className}>{children}</Typography.Div>;
          }
          break;
        case 'span':
          // Only replace spans that aren't attention blocks
          if (!className.includes('ra-content-')) {
            return <Typography.Span className={className}>{children}</Typography.Span>;
          }
          break;
      }

      // Return undefined to let html-react-parser handle normally
      return undefined;
    },
  };

  return parse(processedContent, parserOptions);
}
