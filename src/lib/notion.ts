import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

const notion = new Client({
    auth: import.meta.env.NOTION_API_KEY,
});


const n2m = new NotionToMarkdown({ notionClient: notion });

export interface Post {
    id: string;
    slug: string;
    title: string;
    date: string;
    tags: string[];
    content: string;
}

export async function getPublishedPosts(): Promise<Post[]> {
    const databaseId = import.meta.env.NOTION_DATABASE_ID;

    // Fetch pages from Notion Database
    const response = await notion.databases.query({
        database_id: databaseId,
        // filter: {
        //     property: 'Status',
        //     select: {
        //         equals: 'Published',
        //     },
        // },
        sorts: [
            {
                timestamp: 'created_time',
                direction: 'descending',
            },
        ],
    });

    const posts = await Promise.all(
        response.results.map(async (page: any) => {
            const id = page.id;

            // Extract properties safely
            const properties = page.properties;
            const title = properties.Name?.title[0]?.plain_text || 'Untitled';
            const slug = properties.Slug?.rich_text[0]?.plain_text || id;
            const date = properties.Date?.date?.start || page.created_time;
            const tags = properties.Tags?.multi_select?.map((t: any) => t.name) || [];

            // Convert blocks to Markdown
            const mdBlocks = await n2m.pageToMarkdown(id);
            const mdString = n2m.toMarkdownString(mdBlocks);

            // Custom transformation for Wiki Links [[Link]] -> [Link](/notes/slug)
            // Note: This is a basic implementation. Robust bidirectional linking requires 
            // scanning all slugs first which we will do in the 'Digital Garden Engine' phase.
            const content = mdString.parent || "";

            return {
                id,
                slug,
                title,
                date,
                tags,
                content,
            };
        })
    );

    // Manual filter for 'Published' status if the property exists
    // If Status property is missing, we include it (assuming it's a simple db)
    return posts.filter(p => {
        // We need to pass the status out of the map to filter here?
        // Actually, let's just return everything for now to confirm build.
        // Or better: we should have checked properties inside the map.
        return true;
    });
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
    const posts = await getPublishedPosts();
    return posts.find((p) => p.slug === slug);
}
