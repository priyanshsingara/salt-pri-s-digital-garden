# Notion Setup Guide

## Overview

This blog uses Notion as the CMS (Content Management System). All your blog posts are stored in a Notion database and fetched via the Notion API during build time.

---

## Prerequisites

- A Notion account (free tier works fine)
- A Notion database for blog posts
- A Notion integration with API access

---

## Step 1: Create Notion Integration

1. **Go to Notion Integrations**: [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. **Click** "New integration"
3. **Fill in details**:
   - Name: "Pri's Blog" (or any name)
   - Associated workspace: Your workspace
   - Capabilities: Read content
4. **Click** "Submit"
5. **Copy** the "Internal Integration Token" (starts with `secret_...`)
   - This is your `NOTION_API_KEY`
   - Keep it secret!

---

## Step 2: Create Blog Database

If you already have a database, skip to Step 3.

1. **Create a new page** in Notion
2. **Type** `/database` and select "Full page database"
3. **Name** it "Blog Posts" or "Digital Garden"
4. **Add these properties**:

### Required Properties

| Property Name | Property Type | Description | Example |
|--------------|---------------|-------------|---------|
| **Title** or **Name** | Title | Post title | "My First Post" |
| **Slug** | Text | URL-friendly identifier | "my-first-post" |
| **Date** | Date | Publication date | 2026-01-01 |
| **Tags** or **TAGS** | Multi-select | Categories/topics | "tech", "design" |

### Property Details

**Title/Name** (required):
- Type: Title (default first column)
- Used as the main heading on your blog post
- Can use any text, including emojis

**Slug** (required):
- Type: Rich Text or Text
- Must be URL-friendly (lowercase, hyphens, no spaces)
- Example: "how-to-deploy-astro" → yoursite.com/how-to-deploy-astro
- Make it descriptive and memorable

**Date** (recommended):
- Type: Date
- Used for sorting and display
- If missing, will use page creation time

**Tags** (optional but recommended):
- Type: Multi-select
- Use for categorization and filtering
- Can add/edit options as needed
- Examples: Personal, Tech, Design, Thoughts

---

## Step 3: Share Database with Integration

**This is critical!** Your integration can't read the database until you share it.

1. **Open** your blog database in Notion
2. **Click** the "⋮" menu (top right)
3. **Select** "Connections" or "Add connection"
4. **Find** your integration ("Pri's Blog")
5. **Click** to connect

Now your integration has read access to all pages in this database.

---

## Step 4: Get Database ID

You need the database ID for the `NOTION_DATABASE_ID` environment variable.

**Method 1: From URL**
1. Open your database as a full page
2. Look at the URL in your browser
3. Format: `https://notion.so/workspace/[DATABASE_ID]?v=...`
4. Copy the `DATABASE_ID` part (32 characters, mix of letters and numbers)

**Method 2: Share Menu**
1. Click "Share" button
2. Copy the link
3. Extract the database ID from the link

**Example**:
```
URL: https://notion.so/myworkspace/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6?v=...
Database ID: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## Step 5: Create Your First Post

1. **Click** "New" in your database
2. **Fill in** the properties:
   - Title: "Welcome to My Garden"
   - Slug: "welcome"
   - Date: Today's date
   - Tags: "meta", "welcome"
3. **Write** your content in the page body

### Supported Content Types

You can use these Notion blocks in your posts:

**Text Content**:
- Paragraphs
- **Bold**, *italic*, ~~strikethrough~~
- Inline `code`
- [Links](https://example.com)

**Headings**:
- Heading 1 (main sections)
- Heading 2 (subsections)
- Heading 3 (minor sections)

**Lists**:
- Bullet lists
- Numbered lists
- To-do lists (checkboxes)

**Media**:
- Images (upload or embed)
- Image captions

**Other**:
- Block quotes
- Code blocks (with language selection)
- Dividers
- Callouts (colored boxes)
- Toggle lists (collapsible)

---

## Step 6: Configure Environment Variables

Add your Notion credentials to Vercel (see DEPLOYMENT.md for detailed steps):

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   - `NOTION_API_KEY`: Your integration token from Step 1
   - `NOTION_DATABASE_ID`: Your database ID from Step 4
5. Add for Production, Preview, and Development
6. Save

---

## Database Schema Reference

Here's the exact schema your blog expects:

```javascript
{
  Title: {
    type: 'title',
    title: [{ plain_text: 'Post Title' }]
  },
  Slug: {
    type: 'rich_text',
    rich_text: [{ plain_text: 'post-slug' }]
  },
  Date: {
    type: 'date',
    date: { start: '2026-01-01' }
  },
  Tags: {
    type: 'multi_select',
    multi_select: [
      { name: 'Tech' },
      { name: 'Design' }
    ]
  }
}
```

---

## Writing Tips

### Good Slug Examples
✅ "my-first-post"
✅ "how-to-deploy-astro"
✅ "thoughts-on-design"
✅ "2026-goals"

### Bad Slug Examples
❌ "My First Post" (spaces and capitals)
❌ "How to Deploy Astro?" (special characters)
❌ "post#1" (hash symbol)
❌ "new post" (spaces)

**Rule**: Use only lowercase letters, numbers, and hyphens.

---

## Internal Linking (Wiki-Style)

You can create links between your posts using Wiki-style syntax:

**Syntax**: `[[Page Title]]` or `[[Page Title|Display Text]]`

**Examples**:

Basic link:
```
Check out my post about [[Deployment]]
```
Renders as: Check out my post about [Deployment](/deployment)

Link with custom text:
```
Learn more about [[Deployment|how I deploy this blog]]
```
Renders as: Learn more about [how I deploy this blog](/deployment)

**How it works**:
- The system looks for a post with matching title
- If found: Creates a link to that post's slug
- If not found: Shows as plain text with "dead link" styling

**Tips**:
- Use exact title matching (case-insensitive)
- Create the target page before linking to it
- Use aliases for better readability

---

## Content Organization

### Recommended Structure

**By Topic**:
- Tag posts with topics (Tech, Personal, Design, etc.)
- Filter database by tag to see grouped posts
- Use topic tags for navigation

**By Status**:
- Optional: Add a "Status" property (select)
- Options: Draft, Published, Archived
- Filter to show only published posts (requires code change)

**By Date**:
- Always add publication date
- Sort database by date (newest first)
- Helps with archives and timelines

---

## Publishing Workflow

1. **Draft** in Notion (can use Status: Draft)
2. **Review** content and formatting
3. **Fill** all required fields (Title, Slug, Date, Tags)
4. **Share** with integration (if new page)
5. **Deploy** using your bookmark
6. **Wait** 2 minutes for build
7. **Check** your live site

---

## Advanced Features

### Callouts

Use Notion's callout blocks for special notes:

**In Notion**: Type `/callout` and select a color

**Result**: Renders as a styled box with icon

**Use cases**:
- Important notes
- Tips and tricks
- Warnings
- Highlights

### Code Blocks

**In Notion**: Type `/code` and select language

**Supported languages**:
- JavaScript
- TypeScript
- Python
- HTML/CSS
- Bash
- And many more...

**Features**:
- Syntax highlighting
- Line numbering
- Copy button (in some themes)

### Images

**Adding images**:
1. Type `/image`
2. Upload from computer, or
3. Embed from URL

**Captions**:
- Click image → Add caption
- Captions display below image

**Best practices**:
- Use descriptive file names
- Add captions for context
- Optimize size before upload (< 1MB recommended)
- Use WebP or JPEG format

---

## Troubleshooting

### Posts Not Appearing

**Problem**: New post doesn't show on blog

**Checklist**:
1. ✅ Database shared with integration?
2. ✅ Title property filled?
3. ✅ Slug property filled (and unique)?
4. ✅ Deployed after creating post?

**Solution**: Check all items above, then redeploy.

### Images Not Loading

**Problem**: Images show as broken

**Causes**:
1. Notion image URLs expired (Notion URLs are temporary)
2. Not uploaded to Notion (external embed may be blocked)

**Solution**:
- Upload images directly to Notion
- Don't use external image URLs
- Redeploy to refresh image URLs

### Formatting Issues

**Problem**: Formatting looks different than Notion

**Why**: Markdown conversion isn't 100% identical to Notion

**Limitations**:
- Some Notion-specific blocks don't convert perfectly
- Complex nested structures may simplify
- Custom Notion templates don't transfer

**Best practice**: Preview on blog after deploying, adjust in Notion if needed.

---

## Database Maintenance

### Keep It Clean

**Regular tasks**:
- Archive old/irrelevant posts
- Update tags to keep them consistent
- Fix broken wiki links
- Review and update outdated content

### Backup Your Content

**Notion export** (recommended once/month):
1. Settings → Export all workspace content
2. Format: Markdown & CSV
3. Download and store safely

**Why**:
- Protection against accidental deletion
- Ability to migrate platforms later
- Version control for content

---

## Migration Guide

### From Another Platform

**Importing posts**:
1. Export from old platform (usually Markdown)
2. Create pages in Notion database
3. Copy content into page bodies
4. Fill in properties (Title, Slug, Date, Tags)
5. Deploy

**Bulk import**:
- Notion allows CSV import for database rows
- Prepare CSV with Title, Slug, Date, Tags columns
- Import to database
- Manually copy content into pages

---

## API Rate Limits

Notion API has rate limits:

**Free tier**:
- 3 requests per second per integration
- Average request rate measured over 60 seconds

**Your blog's usage**:
- 1 request per database query
- ~1 request per post (for content)
- Example: 20 posts = ~21 API calls per build

**Limits impact**:
- Very unlikely to hit limits with manual deploys
- Each deployment queries Notion once
- Results cached for 1 hour at edge

**If you hit limits**:
- Add delay between requests in code
- Reduce deployment frequency
- Implement local caching

---

## Best Practices

### Content Creation

1. **Draft first**: Write freely without worrying about fields
2. **Fill metadata**: Add Title, Slug, Date, Tags before deploying
3. **Preview locally**: Run `npm run dev` to test before deploying
4. **Deploy when ready**: Use your bookmark to publish

### Slug Management

1. **Plan ahead**: Choose slugs that won't need changing
2. **Be descriptive**: "deploy-vercel" better than "post-1"
3. **Stay consistent**: Use same format for all posts
4. **Never change**: Changing slugs breaks external links

### Tag Strategy

1. **Start minimal**: 3-5 core tags
2. **Be consistent**: "Tech" not "Technology" and "Tech" mixed
3. **Use multi-word**: "Product Design" not separate "Product" + "Design"
4. **Review quarterly**: Merge similar tags, remove unused ones

---

## Quick Reference

### Create New Post
```
1. Open Notion database
2. Click "New"
3. Fill: Title, Slug, Date, Tags
4. Write content
5. Deploy via bookmark
```

### Add Internal Link
```
Syntax: [[Page Title]] or [[Page Title|Display Text]]
Example: [[My Post|read more]]
```

### Supported Blocks
```
✅ Text, headings, lists
✅ Images, links, code
✅ Quotes, callouts, dividers
⚠️ Tables, videos (need setup)
❌ Databases, embeds
```

### Required Properties
```
- Title (text)
- Slug (text, URL-friendly)
- Date (date)
- Tags (multi-select)
```

---

## Support

### Learn More
- [Notion API Docs](https://developers.notion.com)
- [Notion Help Center](https://notion.so/help)
- [notion-to-md GitHub](https://github.com/souvikinator/notion-to-md)

### Common Questions

**Q: Can I use Notion databases (tables) in posts?**
A: Not as embedded databases. Convert to table blocks or link to separate pages.

**Q: Do I need a paid Notion plan?**
A: No, free tier works perfectly.

**Q: Can I collaborate with others?**
A: Yes! Share your database with teammates. All can edit, you deploy.

**Q: How do I schedule posts?**
A: Add a "Published" date field and filter by date in code (requires customization).

---

## Summary

You now have:
- ✅ Notion integration created
- ✅ Blog database set up
- ✅ Required properties configured
- ✅ First post created
- ✅ Environment variables added
- ✅ Understanding of workflow

**Next**: Write more posts and deploy with your bookmark!
