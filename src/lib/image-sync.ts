/**
 * Image Sync Script for Notion Blog
 * Downloads all images from Notion posts and saves them locally.
 * Run this before build to ensure images work after static generation.
 * 
 * Features:
 * - MD5 hashing for deduplication (same image = same filename)
 * - Only downloads new/changed images (smart caching)
 * - Cleans up orphaned images
 */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync, copyFileSync } from 'fs';
import { join } from 'path';

// Use process.cwd() to get project root (works during build)
const PROJECT_ROOT = process.cwd();
const IMAGES_DIR = join(PROJECT_ROOT, 'public', 'images');
const MANIFEST_PATH = join(IMAGES_DIR, 'manifest.json');

// Additional output directories to ensure images are in final build
const OUTPUT_DIRS = [
    join(PROJECT_ROOT, 'dist', 'images'),
    join(PROJECT_ROOT, '.vercel', 'output', 'static', 'images'),
];

// Regex patterns to find image URLs in markdown content
const NOTION_IMAGE_PATTERNS = [
    // Notion S3 URLs
    /https:\/\/prod-files-secure\.s3\.[^"'\s)]+/g,
    /https:\/\/s3\.us-west-2\.amazonaws\.com\/secure\.notion-static\.com[^"'\s)]+/g,
    // General S3 patterns from Notion
    /https:\/\/[^"'\s)]*amazonaws\.com[^"'\s)]+/g,
];

interface ImageManifest {
    [notionUrlHash: string]: {
        localFilename: string;
        originalUrl: string;
        downloadedAt: string;
    };
}

/**
 * Generate MD5 hash of a URL for consistent filename
 */
function hashUrl(url: string): string {
    return createHash('md5').update(url).digest('hex').slice(0, 16);
}

/**
 * Extract extension from URL or default to jpg
 */
function getExtension(url: string): string {
    const cleanUrl = url.split('?')[0];
    const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/);
    if (match) {
        const ext = match[1].toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)) {
            return ext;
        }
    }
    return 'jpg';
}

/**
 * Download an image from URL and save locally + to output dirs
 */
async function downloadImage(url: string, localPath: string, filename: string): Promise<boolean> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`[Image Sync] Failed to download: ${url} (${response.status})`);
            return false;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save to public/images
        writeFileSync(localPath, buffer);
        console.log(`[Image Sync] Downloaded: ${localPath}`);

        // Also copy to output directories (dist and .vercel/output)
        for (const outputDir of OUTPUT_DIRS) {
            if (existsSync(outputDir.replace('/images', ''))) {
                if (!existsSync(outputDir)) {
                    mkdirSync(outputDir, { recursive: true });
                }
                const outputPath = join(outputDir, filename);
                writeFileSync(outputPath, buffer);
                console.log(`[Image Sync] Copied to: ${outputPath}`);
            }
        }

        return true;
    } catch (error) {
        console.error(`[Image Sync] Error downloading ${url}:`, error);
        return false;
    }
}

/**
 * Find all Notion image URLs in content
 */
export function findNotionImageUrls(content: string): string[] {
    const urls = new Set<string>();

    for (const pattern of NOTION_IMAGE_PATTERNS) {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            urls.add(match[0]);
        }
    }

    return Array.from(urls);
}

/**
 * Get or create the image manifest
 */
function loadManifest(): ImageManifest {
    if (existsSync(MANIFEST_PATH)) {
        try {
            return JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
        } catch {
            return {};
        }
    }
    return {};
}

/**
 * Save the image manifest
 */
function saveManifest(manifest: ImageManifest): void {
    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

/**
 * Sync images from content - download new, rewrite URLs
 * Returns the content with rewritten URLs
 */
export async function syncImages(content: string): Promise<string> {
    // Ensure images directory exists
    if (!existsSync(IMAGES_DIR)) {
        mkdirSync(IMAGES_DIR, { recursive: true });
    }

    const manifest = loadManifest();
    const imageUrls = findNotionImageUrls(content);

    let rewrittenContent = content;

    for (const url of imageUrls) {
        const urlHash = hashUrl(url);
        // Track this hash globally for orphan cleanup
        usedHashesThisBuild.add(urlHash);

        // Check if we already have this image
        if (manifest[urlHash] && existsSync(join(IMAGES_DIR, manifest[urlHash].localFilename))) {
            // Image exists, just rewrite URL
            const localUrl = `/images/${manifest[urlHash].localFilename}`;
            rewrittenContent = rewrittenContent.split(url).join(localUrl);
            continue;
        }

        // Need to download this image
        const ext = getExtension(url);
        const filename = `${urlHash}.${ext}`;
        const localPath = join(IMAGES_DIR, filename);

        const success = await downloadImage(url, localPath, filename);

        if (success) {
            manifest[urlHash] = {
                localFilename: filename,
                originalUrl: url.slice(0, 100) + '...', // Truncate for readability
                downloadedAt: new Date().toISOString(),
            };

            const localUrl = `/images/${filename}`;
            rewrittenContent = rewrittenContent.split(url).join(localUrl);
        }
    }

    saveManifest(manifest);
    return rewrittenContent;
}

/**
 * Global set to track all image hashes used in this build
 * Call markBuildComplete() after all pages are built to clean up orphans
 */
const usedHashesThisBuild = new Set<string>();

/**
 * Clean up orphaned images not used in this build
 * Should be called after all posts have been processed
 */
export function cleanupOrphanedImages(): void {
    if (!existsSync(IMAGES_DIR)) return;
    if (usedHashesThisBuild.size === 0) {
        console.log('[Image Sync] No images used in this build, skipping cleanup');
        return;
    }

    const manifest = loadManifest();
    const files = readdirSync(IMAGES_DIR);
    let cleanedCount = 0;

    for (const file of files) {
        if (file === 'manifest.json') continue;

        const hash = file.split('.')[0];

        // If this hash wasn't used in this build, delete it
        if (!usedHashesThisBuild.has(hash)) {
            const filePath = join(IMAGES_DIR, file);
            try {
                unlinkSync(filePath);
                // Also remove from manifest
                delete manifest[hash];
                cleanedCount++;
                console.log(`[Image Sync] Cleaned up orphaned image: ${file}`);
            } catch (err) {
                console.error(`[Image Sync] Failed to delete ${file}:`, err);
            }
        }
    }

    if (cleanedCount > 0) {
        saveManifest(manifest);
        console.log(`[Image Sync] Removed ${cleanedCount} orphaned image(s)`);
    }
}

/**
 * Get the set of used hashes (for external tracking if needed)
 */
export function getUsedHashes(): Set<string> {
    return usedHashesThisBuild;
}

/**
 * Mark an image hash as used in this build
 */
export function markHashUsed(hash: string): void {
    usedHashesThisBuild.add(hash);
}
