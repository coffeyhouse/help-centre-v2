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
 * Converts Bootstrap grid classes to Tailwind CSS equivalents
 */
function convertBootstrapToTailwind(className: string): string {
  if (!className) return '';

  let tailwindClasses = className;

  // Bootstrap container/row classes
  tailwindClasses = tailwindClasses.replace(/\bcontainer-fluid\b/g, 'w-full px-4');
  tailwindClasses = tailwindClasses.replace(/\bcontainer\b/g, 'container mx-auto px-4');
  tailwindClasses = tailwindClasses.replace(/\brow\b/g, 'flex flex-wrap -mx-2');

  // Bootstrap column classes - xs (default, no prefix in Tailwind)
  tailwindClasses = tailwindClasses.replace(/\bcol-xs-12\b/g, 'w-full px-2');
  tailwindClasses = tailwindClasses.replace(/\bcol-xs-11\b/g, 'w-11/12 px-2');
  tailwindClasses = tailwindClasses.replace(/\bcol-xs-10\b/g, 'w-10/12 px-2');
  tailwindClasses = tailwindClasses.replace(/\bcol-xs-9\b/g, 'w-9/12 px-2');
  tailwindClasses = tailwindClasses.replace(/\bcol-xs-8\b/g, 'w-8/12 px-2');
  tailwindClasses = tailwindClasses.replace(/\bcol-xs-7\b/g, 'w-7/12 px-2');
  tailwindClasses = tailwindClasses.replace(/\bcol-xs-6\b/g, 'w-6/12 px-2');
  tailwindClasses = tailwindClasses.replace(/\bcol-xs-5\b/g, 'w-5/12 px-2');
  tailwindClasses = tailwindClasses.replace(/\bcol-xs-4\b/g, 'w-4/12 px-2');
  tailwindClasses = tailwindClasses.replace(/\bcol-xs-3\b/g, 'w-3/12 px-2');
  tailwindClasses = tailwindClasses.replace(/\bcol-xs-2\b/g, 'w-2/12 px-2');
  tailwindClasses = tailwindClasses.replace(/\bcol-xs-1\b/g, 'w-1/12 px-2');

  // Bootstrap column classes - sm (640px in Tailwind)
  tailwindClasses = tailwindClasses.replace(/\bcol-sm-12\b/g, 'sm:w-full');
  tailwindClasses = tailwindClasses.replace(/\bcol-sm-11\b/g, 'sm:w-11/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-sm-10\b/g, 'sm:w-10/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-sm-9\b/g, 'sm:w-9/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-sm-8\b/g, 'sm:w-8/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-sm-7\b/g, 'sm:w-7/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-sm-6\b/g, 'sm:w-6/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-sm-5\b/g, 'sm:w-5/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-sm-4\b/g, 'sm:w-4/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-sm-3\b/g, 'sm:w-3/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-sm-2\b/g, 'sm:w-2/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-sm-1\b/g, 'sm:w-1/12');

  // Bootstrap column classes - md (768px in Tailwind)
  tailwindClasses = tailwindClasses.replace(/\bcol-md-12\b/g, 'md:w-full');
  tailwindClasses = tailwindClasses.replace(/\bcol-md-11\b/g, 'md:w-11/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-md-10\b/g, 'md:w-10/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-md-9\b/g, 'md:w-9/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-md-8\b/g, 'md:w-8/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-md-7\b/g, 'md:w-7/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-md-6\b/g, 'md:w-6/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-md-5\b/g, 'md:w-5/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-md-4\b/g, 'md:w-4/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-md-3\b/g, 'md:w-3/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-md-2\b/g, 'md:w-2/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-md-1\b/g, 'md:w-1/12');

  // Bootstrap column classes - lg (1024px in Tailwind)
  tailwindClasses = tailwindClasses.replace(/\bcol-lg-12\b/g, 'lg:w-full');
  tailwindClasses = tailwindClasses.replace(/\bcol-lg-11\b/g, 'lg:w-11/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-lg-10\b/g, 'lg:w-10/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-lg-9\b/g, 'lg:w-9/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-lg-8\b/g, 'lg:w-8/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-lg-7\b/g, 'lg:w-7/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-lg-6\b/g, 'lg:w-6/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-lg-5\b/g, 'lg:w-5/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-lg-4\b/g, 'lg:w-4/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-lg-3\b/g, 'lg:w-3/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-lg-2\b/g, 'lg:w-2/12');
  tailwindClasses = tailwindClasses.replace(/\bcol-lg-1\b/g, 'lg:w-1/12');

  // Bootstrap offset classes
  tailwindClasses = tailwindClasses.replace(/\bcol-xs-offset-(\d+)\b/g, 'ml-auto');
  tailwindClasses = tailwindClasses.replace(/\bcol-sm-offset-(\d+)\b/g, 'sm:ml-auto');
  tailwindClasses = tailwindClasses.replace(/\bcol-md-offset-(\d+)\b/g, 'md:ml-auto');
  tailwindClasses = tailwindClasses.replace(/\bcol-lg-offset-(\d+)\b/g, 'lg:ml-auto');

  return tailwindClasses;
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
  // Remove entire mceNonEditable span wrapper with image and title
  let cleaned = html.replace(
    /<span[^>]*?class="[^"]*mceNonEditable[^"]*"[^>]*?>.*?<\/span>\s*/gi,
    ''
  );

  // Remove attention block images (ra-att-img class or content_*.gif)
  cleaned = cleaned.replace(/<img[^>]*?class="[^"]*ra-att-img[^"]*"[^>]*?>/gi, '');
  cleaned = cleaned.replace(/<img[^>]*?content_(tip|caution|info|warning|note)\.gif[^>]*?>/gi, '');

  // Remove title markup with ra-att-title class or plain strong tags
  cleaned = cleaned.replace(/<strong[^>]*?class="[^"]*ra-att-title[^"]*"[^>]*?>.*?<\/strong>\s*/gi, '');
  cleaned = cleaned.replace(/<strong>\s*(TIP|CAUTION|INFO|WARNING|NOTE)\s*:?\s*<\/strong>\s*/gi, '');

  // Remove leading &nbsp; entities
  cleaned = cleaned.replace(/^(&nbsp;|\s)+/, '');

  // Trim any leading/trailing whitespace
  return cleaned.trim();
}

/**
 * Filters out attention block title-related elements from children
 */
function filterAttentionBlockTitleElements(children: any[]): any[] {
  if (!children) return [];

  return children.filter((child) => {
    if (!(child instanceof Element)) return true;

    const element = child as Element;

    // Filter out mceNonEditable spans (contain title and image)
    if (element.name === 'span' && element.attribs?.class?.includes('mceNonEditable')) {
      return false;
    }

    // Filter out attention block images
    if (element.name === 'img' && element.attribs?.class?.includes('ra-att-img')) {
      return false;
    }

    // Filter out attention block title images
    if (element.name === 'img' && element.attribs?.src?.includes('content_tip.gif')) {
      return false;
    }
    if (element.name === 'img' && element.attribs?.src?.includes('content_caution.gif')) {
      return false;
    }
    if (element.name === 'img' && element.attribs?.src?.includes('content_info.gif')) {
      return false;
    }
    if (element.name === 'img' && element.attribs?.src?.includes('content_warning.gif')) {
      return false;
    }
    if (element.name === 'img' && element.attribs?.src?.includes('content_note.gif')) {
      return false;
    }

    // Filter out strong tags with ra-att-title class
    if (element.name === 'strong' && element.attribs?.class?.includes('ra-att-title')) {
      return false;
    }

    return true;
  });
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
  // First, remove broken internal links with empty text like [[|article_id]]
  let processed = content.replace(/\[\[(?:(?:>|&gt;)\||\|)(\d{15})\]\]/g, '');

  // Match both formats:
  // - [[text >|15-digit-id]] or [[text &gt;|15-digit-id]] (with >)
  // - [[text|15-digit-id]] (without >)
  const linkRegex = /\[\[([^\]]+?)(?:(?:>|&gt;)\||\|)(\d{15})\]\]/g;

  return processed.replace(linkRegex, (match, linkText, articleId) => {
    const url = getArticleUrl(articleId, region);
    const isExternal = shouldOpenInNewTab(url);

    const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${url}"${targetAttr} data-internal-link="true">${linkText}</a>`;
  });
}

/**
 * Removes script tags and their contents from HTML content
 */
function stripScriptTags(content: string): string {
  // Remove script tags and their contents
  return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Preprocesses expand-collapse sections by wrapping them in a container
 * This makes it easier to detect and convert them to Accordion components
 */
function preprocessExpandCollapse(content: string): string {
  // Match expand-collapse headers followed by collapse divs
  // More flexible pattern that handles attributes in any order
  const pattern = /(<(?:h4|div)[^>]*\bclass="[^"]*expand-collapse[^"]*"[^>]*>(?:(?!<\/(?:h4|div)>).)*<\/(?:h4|div)>)\s*(<div[^>]*\bclass="[^"]*collapse[^"]*"[^>]*>)/gi;

  let result = content;
  let match;
  const regex = new RegExp(pattern);

  // We need to find matching pairs and wrap them
  // This is tricky because we need to find the closing </div> for the collapse div
  // Let's use a different approach - find all occurrences and build wrapper

  const matches: Array<{ header: string; collapseStart: number; collapseEnd: number; id: string }> = [];

  // Find all expand-collapse headers and their corresponding collapse divs
  const headerRegex = /<(h4|div)[^>]*\bclass="[^"]*expand-collapse[^"]*"[^>]*>((?:(?!<\/\1>).)*)<\/\1>/gi;
  let headerMatch;

  while ((headerMatch = headerRegex.exec(content)) !== null) {
    const headerHTML = headerMatch[0];
    const headerEnd = headerMatch.index + headerHTML.length;

    // Look for the next collapse div after this header
    const afterHeader = content.slice(headerEnd);
    const collapseDivRegex = /<div[^>]*\bclass="[^"]*collapse[^"]*"[^>]*>/i;
    const collapseDivMatch = collapseDivRegex.exec(afterHeader);

    if (collapseDivMatch) {
      const collapseStart = headerEnd + collapseDivMatch.index;
      const collapseDivTag = collapseDivMatch[0];

      // Extract id from collapse div if present
      const idMatch = /\bid="([^"]*)"/.exec(collapseDivTag);
      const collapseId = idMatch ? idMatch[1] : '';

      // Find the closing </div> for this collapse div (handle nesting)
      const collapseEnd = findClosingTag(content, collapseStart, 'div');

      if (collapseEnd > collapseStart) {
        matches.push({
          header: headerHTML,
          collapseStart: headerMatch.index,
          collapseEnd: collapseEnd,
          id: collapseId
        });
      }
    }
  }

  // Replace from end to start to maintain indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const before = content.slice(0, m.collapseStart);
    const section = content.slice(m.collapseStart, m.collapseEnd);
    const after = content.slice(m.collapseEnd);

    result = before + `<div class="accordion-wrapper" data-collapse-id="${m.id}">${section}</div>` + after;
  }

  return result;
}

/**
 * Helper function to find the closing tag for an opening tag, handling nesting
 */
function findClosingTag(html: string, startPos: number, tagName: string): number {
  let depth = 1;
  let pos = startPos;

  // Skip past the opening tag
  const openTagEnd = html.indexOf('>', pos);
  if (openTagEnd === -1) return -1;
  pos = openTagEnd + 1;

  const openRegex = new RegExp(`<${tagName}[\\s>]`, 'gi');
  const closeRegex = new RegExp(`</${tagName}>`, 'gi');

  while (depth > 0 && pos < html.length) {
    // Find next occurrence of either opening or closing tag
    openRegex.lastIndex = pos;
    closeRegex.lastIndex = pos;

    const openMatch = openRegex.exec(html);
    const closeMatch = closeRegex.exec(html);

    if (!closeMatch) return -1; // No closing tag found

    if (openMatch && openMatch.index < closeMatch.index) {
      // Found nested opening tag
      depth++;
      pos = openMatch.index + 1;
    } else {
      // Found closing tag
      depth--;
      if (depth === 0) {
        return closeMatch.index + closeMatch[0].length;
      }
      pos = closeMatch.index + closeMatch[0].length;
    }
  }

  return -1;
}

/**
 * Processes article HTML content and replaces patterns with React components
 */
export function processArticleContent(
  content: string,
  options: ProcessorOptions = {}
): React.ReactNode {
  const { region = 'gb' } = options;

  // Remove script tags for security
  let processedContent = stripScriptTags(content);

  // Pre-process expand-collapse sections
  processedContent = preprocessExpandCollapse(processedContent);

  // Pre-process internal links before parsing
  processedContent = preprocessInternalLinks(processedContent, region);

  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (!(domNode instanceof Element)) return;

      const element = domNode as Element;

      // Replace accordion-wrapper divs (created by preprocessing) with Accordion component
      if (element.name === 'div' && element.attribs?.class?.includes('accordion-wrapper')) {
        // Find the header element (h4 or div with expand-collapse class)
        const headerElement = element.children?.find(
          (child) =>
            child instanceof Element &&
            (child as Element).attribs?.class?.includes('expand-collapse')
        ) as Element | undefined;

        // Find the collapse div
        const contentDiv = element.children?.find(
          (child) =>
            child instanceof Element &&
            (child as Element).name === 'div' &&
            (child as Element).attribs?.class?.includes('collapse')
        ) as Element | undefined;

        if (headerElement && contentDiv) {
          // Find the anchor tag within the header
          const anchor = headerElement.children?.find(
            (child) => child instanceof Element && (child as Element).name === 'a'
          ) as Element | undefined;

          if (anchor) {
            // Extract title from the anchor (either from span or directly from text)
            const titleSpan = anchor.children?.find(
              (child) => child instanceof Element && (child as Element).name === 'span'
            ) as Element | undefined;

            // If there's a span, extract from it; otherwise extract directly from anchor
            const title = titleSpan
              ? extractTextContent(titleSpan)
              : extractTextContent(anchor) || 'Show more';

            // Process the content div's children with the same parser options
            const processedContent = contentDiv.children
              ? domToReact(contentDiv.children as DOMNode[], parserOptions)
              : null;

            return <Accordion key={element.attribs?.['data-collapse-id'] || Math.random()} title={title} content={processedContent} />;
          }
        }
      }

      // Replace content-block-uki divs with ContentCard component
      if (element.name === 'div' && element.attribs?.class?.includes('content-block-uki')) {
        const cardChildren = element.children ? domToReact(element.children as DOMNode[], parserOptions) : null;
        return <Typography.ContentCard key={Math.random()}>{cardChildren}</Typography.ContentCard>;
      }

      // Replace video-container divs with VideoEmbed component
      if (element.name === 'div' && element.attribs?.class?.includes('video-container')) {
        const videoChildren = element.children ? domToReact(element.children as DOMNode[], parserOptions) : null;
        return <Typography.VideoEmbed key={Math.random()}>{videoChildren}</Typography.VideoEmbed>;
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
          const contentElement = descSpan || element;

          // Filter out title-related elements from children
          const filteredChildren = filterAttentionBlockTitleElements(contentElement.children || []);

          // Process the filtered children with parser options
          const processedContent = filteredChildren.length > 0
            ? domToReact(filteredChildren as DOMNode[], parserOptions)
            : null;

          return <AttentionBlock key={Math.random()} type={type} title={title} content={processedContent} />;
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

          // Filter out title-related elements from children
          const filteredChildren = filterAttentionBlockTitleElements(element.children || []);

          // Process the filtered children with parser options
          const processedContent = filteredChildren.length > 0
            ? domToReact(filteredChildren as DOMNode[], parserOptions)
            : null;

          return <AttentionBlock key={Math.random()} type={type} title={title} content={processedContent} />;
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
          // But keep paragraphs with images, iframes, or other elements
          const textContent = extractTextContent(element);
          const hasImageOrElements = element.children?.some(
            (child) => child instanceof Element && ['img', 'iframe', 'video', 'audio'].includes((child as Element).name)
          );

          if (!hasImageOrElements && (!textContent || textContent.trim() === '' || textContent.trim() === '\u00A0')) {
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
          // Remove empty links (no text content)
          const linkTextContent = extractTextContent(element);
          if (!linkTextContent || linkTextContent.trim() === '') {
            return <React.Fragment key={Math.random()}></React.Fragment>;
          }

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
        case 'iframe':
          // Handle iframes (especially for video embeds)
          const iframeSrc = element.attribs?.src || '';
          const isVideoEmbed =
            iframeSrc.includes('youtube.com') ||
            iframeSrc.includes('youtu.be') ||
            iframeSrc.includes('brightcove.net') ||
            iframeSrc.includes('vimeo.com') ||
            iframeSrc.includes('wistia.com');

          // Check if parent is already a video-container
          const parentIsVideoContainer = (element as any).parent?.attribs?.class?.includes('video-container');

          if (isVideoEmbed && !parentIsVideoContainer) {
            // Wrap standalone video embeds in responsive container
            return (
              <Typography.VideoEmbed key={Math.random()}>
                <iframe
                  src={iframeSrc}
                  frameBorder={element.attribs?.frameborder || '0'}
                  allowFullScreen={element.attribs?.allowfullscreen === 'allowfullscreen'}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </Typography.VideoEmbed>
            );
          } else if (parentIsVideoContainer) {
            // Already in a video-container, use absolute positioning
            return (
              <iframe
                src={iframeSrc}
                frameBorder={element.attribs?.frameborder || '0'}
                allowFullScreen={element.attribs?.allowfullscreen === 'allowfullscreen'}
                className="absolute top-0 left-0 w-full h-full"
              />
            );
          } else {
            // Regular iframe (not a video), preserve original dimensions
            return (
              <iframe
                src={iframeSrc}
                width={element.attribs?.width}
                height={element.attribs?.height}
                frameBorder={element.attribs?.frameborder || '0'}
                allowFullScreen={element.attribs?.allowfullscreen === 'allowfullscreen'}
                className="my-4"
              />
            );
          }
        case 'div':
          // Only replace divs that don't have special classes (like expand-collapse, content-block-uki, video-container)
          if (!className.includes('expand-collapse') && !className.includes('collapse') && !className.includes('content-block-uki') && !className.includes('video-container')) {
            // Convert Bootstrap grid classes to Tailwind equivalents
            const convertedClassName = convertBootstrapToTailwind(className);
            return <Typography.Div className={convertedClassName}>{children}</Typography.Div>;
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
