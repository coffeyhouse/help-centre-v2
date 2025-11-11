/**
 * Article Content Processor
 *
 * Processes HTML content from articles and replaces specific patterns with React components:
 * - Expand/collapse divs → Accordion components
 * - Attention blocks (caution, tip, info, warning) → AttentionBlock components
 * - Internal article links [[text >|id]] → proper links
 */

import parse, { Element, domToReact, HTMLReactParserOptions } from 'html-react-parser';
import Accordion from '../components/article/Accordion';
import AttentionBlock, { AttentionType } from '../components/article/AttentionBlock';
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
 * Processes article HTML content and replaces patterns with React components
 */
export function processArticleContent(
  content: string,
  options: ProcessorOptions = {}
): JSX.Element | JSX.Element[] | string {
  const { region = 'gb' } = options;

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

      // Process internal article links [[text >|article_id]]
      if (element.name === 'a' && element.children) {
        const textContent = element.children
          .map((child: any) => (child.type === 'text' ? child.data : ''))
          .join('');

        // Match pattern: [[link text >|article_id]]
        const linkMatch = textContent.match(/\[\[([^\]]+?)(?:>|&gt;)\|(\d{15})\]\]/);

        if (linkMatch) {
          const [, linkText, articleId] = linkMatch;
          const url = getArticleUrl(articleId, region);
          const isExternal = shouldOpenInNewTab(url);

          return (
            <a
              href={url}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              {linkText}
            </a>
          );
        }
      }

      // Return undefined to let html-react-parser handle normally
      return undefined;
    },
  };

  return parse(content, parserOptions);
}
