import { marked } from 'marked';

/**
 * Parses markdown content and transforms [[Wiki Links]] to internal links.
 * Format: [[Page Title]] -> <a href="/slug-of-page-title">Page Title</a>
 */
export async function parseContent(content: string, allPosts: { title: string; slug: string }[]) {
    // 1. Convert Markdown to HTML first
    let html = await marked.parse(content);

    // 2. transform [[Wiki Links]]
    // Regex matches [[Link Text]] or [[Link Text|Display Text]]
    html = html.replace(/\[\[(.*?)\]\]/g, (match, text) => {
        let linkTarget = text;
        let linkDisplay = text;

        // Handle alias: [[Target|Display]]
        if (text.includes('|')) {
            const parts = text.split('|');
            linkTarget = parts[0];
            linkDisplay = parts[1];
        }

        // Find the slug for the target title
        // This is a simple case-insensitive lookup
        const targetPost = allPosts.find(p => p.title.toLowerCase() === linkTarget.toLowerCase());

        if (targetPost) {
            // If found, link to the slug
            return `<a href="/${targetPost.slug}" class="wiki-link" data-slug="${targetPost.slug}">${linkDisplay}</a>`;
        } else {
            // If not found, keep it as text or make it a "dead link" style
            return `<span class="wiki-link-dead" title="Page not found">${linkDisplay}</span>`;
        }
    });

    return html;
}
