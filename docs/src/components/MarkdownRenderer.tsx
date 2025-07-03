import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                        <SyntaxHighlighter
                            language={match[1]}
                            PreTag="div"
                            {...props}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
                a({ href, children }) {
                    // Handle internal links
                    if (href?.startsWith('#')) {
                        return (
                            <a href={href} onClick={(e) => {
                                e.preventDefault();
                                const element = document.querySelector(href);
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}>
                                {children}
                            </a>
                        );
                    }

                    // External links open in new tab
                    if (href?.startsWith('http')) {
                        return (
                            <a href={href} target="_blank" rel="noopener noreferrer">
                                {children}
                            </a>
                        );
                    }

                    // Default link behavior
                    return <a href={href}>{children}</a>;
                }
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer; 