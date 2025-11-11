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
 * Extracts text content from a span element that contains article links
 */
function extractTextFromSpan(element: Element): string {
  if (!element.children) return '';

  return element.children
    .map((child) => {
      if (child.type === 'text') {
        return (child as any).data || '';
      }
      return '';
    })
    .join('')
    .replace(/^▼\s*/, ''); // Remove the down arrow prefix
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
 * Converts [[link text >|article_id]] to <a href="...">link text</a>
 */
function preprocessInternalLinks(content: string, region: string): string {
  // Match [[text >|15-digit-id]] or [[text &gt;|15-digit-id]]
  const linkRegex = /\[\[([^\]]+?)(?:>|&gt;)\|(\d{15})\]\]/g;

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

      // Replace expand-collapse divs with Accordion component
      if (
        element.name === 'div' &&
        element.attribs?.class?.includes('expand-collapse')
      ) {
        // Find the anchor tag with the title
        const anchor = element.children?.find(
          (child) => child instanceof Element && (child as Element).name === 'a'
        ) as Element | undefined;

        // Find the content div (the collapsible part)
        const contentDiv = element.children?.find(
          (child) =>
            child instanceof Element &&
            (child as Element).name === 'div' &&
            (child as Element).attribs?.class?.includes('collapse')
        ) as Element | undefined;

        if (anchor && contentDiv) {
          // Extract title from the span inside the anchor
          const titleSpan = anchor.children?.find(
            (child) => child instanceof Element && (child as Element).name === 'span'
          ) as Element | undefined;

          const title = titleSpan ? extractTextFromSpan(titleSpan) : 'Show more';
          const contentHTML = getInnerHTML(contentDiv);

          return <Accordion key={element.attribs?.id} title={title} content={contentHTML} />;
        }
      }

      // Replace attention blocks (caution, tip, info, warning)
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
        }

        if (type) {
          // Find the title and description spans
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

          const title = titleSpan
            ? extractTextFromSpan(titleSpan).replace(':', '')
            : defaultTitle;
          const content = descSpan ? getInnerHTML(descSpan) : getInnerHTML(element);

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
          // Only replace divs that don't have special classes (like expand-collapse)
          if (!className.includes('expand-collapse') && !className.includes('collapse')) {
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
