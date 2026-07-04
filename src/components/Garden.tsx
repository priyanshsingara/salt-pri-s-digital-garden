import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { NumberTicker } from '@/components/motion/number-ticker';
import { CommandPalette, type CommandItem } from '@/components/motion/command-palette';

export interface GardenPost {
    /** Display index, e.g. "007". Newest post has the highest number. */
    number: string;
    title: string;
    slug: string;
    tags: string[];
    /** Pre-computed tag-chip color (hex) so SSR and client match. */
    color: string;
}

interface GardenProps {
    posts: GardenPost[];
}

/**
 * The home feed: a scrollable list of posts (number · tag chip · title).
 * A bottom "Search my mind" pill (not typeable) opens a command-palette
 * overlay that live-filters the posts by title and tags. The palette can
 * also be opened with Cmd/Ctrl+K, or by simply starting to type on the pill.
 */
export default function Garden({ posts }: GardenProps) {
    // Slug of the row currently hovered; when set, every other row dims.
    const [hovered, setHovered] = useState<string | null>(null);
    // Command-palette (search) open state.
    const [paletteOpen, setPaletteOpen] = useState(false);

    // Each post becomes a searchable palette entry. `keywords: tags` gives the
    // palette's fuzzy match the same title+tag coverage the old search bar had.
    const items = useMemo<CommandItem[]>(
        () =>
            posts.map((post) => ({
                id: post.slug,
                label: post.title,
                keywords: post.tags,
                badge: (
                    <span
                        className="text-[11px] leading-none text-text-faint"
                        style={{ fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}
                    >
                        {post.number}
                    </span>
                ),
                onSelect: () => {
                    window.location.href = `/${post.slug}`;
                },
            })),
        [posts]
    );

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Scrollable post list */}
            <main className="flex-1 min-h-0 overflow-y-auto px-[32px] py-[32px] max-sm:px-5 max-sm:py-6">
                <div
                    className="flex flex-col gap-[6px]"
                    onMouseLeave={() => setHovered(null)}
                >
                    {posts.map((post) => (
                        <motion.a
                            key={post.slug}
                            href={`/${post.slug}`}
                            data-audio-click="true"
                            onMouseEnter={() => setHovered(post.slug)}
                            style={{ ['--tag' as string]: post.color }}
                            initial={false}
                            animate={{ opacity: hovered && hovered !== post.slug ? 0.2 : 1 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="group flex items-center gap-[16px] py-[2px] !no-underline hover:!no-underline focus:!no-underline max-sm:flex-wrap max-sm:gap-x-[12px] max-sm:gap-y-1"
                        >
                            {/* Index badge — number rolls up when the row enters view */}
                            <span
                                className="shrink-0 flex items-center justify-center rounded-full border-[3px] border-white/10 p-[8px] text-[14px] leading-none text-white/80"
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 600,
                                    letterSpacing: '-0.02em',
                                    fontFeatureSettings: '"tnum" 1',
                                }}
                            >
                                <NumberTicker
                                    value={Number(post.number)}
                                    pad={3}
                                    duration={0.8}
                                    className="leading-none"
                                />
                            </span>

                            {/* Tag chip (comma-joined tags, one color per post) */}
                            {post.tags.length > 0 && (
                                <span
                                    className="shrink-0 p-[2px] text-[18px] leading-[18px] text-flexoki-black"
                                    style={{
                                        fontFamily: 'var(--font-tag)',
                                        fontWeight: 900,
                                        backgroundColor: post.color,
                                    }}
                                >
                                    {post.tags.join(', ')}
                                </span>
                            )}

                            {/* Title — on hover, highlight with this post's tag color */}
                            <span className="-mx-[6px] px-[6px] py-[1px] text-white font-semibold tracking-[-0.02em] leading-[1.1] text-[clamp(20px,2.2vw,32px)] transition-colors group-hover:text-flexoki-black group-hover:[background-color:var(--tag)] max-sm:basis-full">
                                {post.title}
                            </span>
                        </motion.a>
                    ))}
                </div>
            </main>

            {/* Search — a non-typeable pill that opens the command palette */}
            <div className="shrink-0 border-t-[3px] border-dashed border-flexoki-900 px-[32px] py-[24px] max-sm:px-5 max-sm:py-4">
                <button
                    type="button"
                    onClick={() => setPaletteOpen(true)}
                    onKeyDown={(e) => {
                        // Start typing to open — any printable single character.
                        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
                            setPaletteOpen(true);
                        }
                    }}
                    aria-label="Search"
                    aria-haspopup="dialog"
                    className="group inline-flex items-center gap-[12px] rounded-full border border-flexoki-800 bg-flexoki-950 pl-[18px] pr-[10px] py-[10px] text-left transition-colors hover:border-flexoki-700 hover:bg-flexoki-900 focus:outline-none focus-visible:border-flexoki-600 max-sm:w-full"
                >
                    <Search className="h-[18px] w-[18px] shrink-0 text-text-muted transition-colors group-hover:text-text-main" />
                    <span className="text-[18px] font-medium tracking-[-0.01em] text-text-muted transition-colors group-hover:text-text-main max-sm:flex-1">
                        Search my mind
                    </span>
                    <kbd
                        className="ml-[8px] shrink-0 rounded-full border border-flexoki-800 px-[8px] py-[3px] text-[12px] leading-none text-text-faint"
                        style={{ fontFamily: 'var(--font-mono)' }}
                    >
                        ⌘K
                    </kbd>
                </button>
            </div>

            {/* Search overlay (portaled to <body>) */}
            <CommandPalette
                open={paletteOpen}
                onOpenChange={setPaletteOpen}
                shortcut="k"
                placeholder="Search my mind…"
                emptyMessage="nothing matches."
                items={items}
            />
        </div>
    );
}
