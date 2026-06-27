import { useMemo, useState } from 'react';

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
 * The home feed: a scrollable list of posts (number · tag chip · title)
 * with a bottom "search my mind..." bar that live-filters across the
 * post title and its tags.
 */
export default function Garden({ posts }: GardenProps) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return posts;
        return posts.filter(
            (p) =>
                p.title.toLowerCase().includes(q) ||
                p.tags.some((t) => t.toLowerCase().includes(q))
        );
    }, [query, posts]);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Scrollable post list */}
            <main className="flex-1 min-h-0 overflow-y-auto px-[32px] py-[32px] max-sm:px-5 max-sm:py-6">
                <div className="flex flex-col gap-[6px]">
                    {filtered.map((post) => (
                        <a
                            key={post.slug}
                            href={`/${post.slug}`}
                            data-audio-click="true"
                            style={{ ['--tag' as string]: post.color }}
                            className="group flex items-center gap-[16px] py-[2px] !no-underline hover:!no-underline focus:!no-underline max-sm:flex-wrap max-sm:gap-x-[12px] max-sm:gap-y-1"
                        >
                            {/* Index badge */}
                            <span
                                className="shrink-0 flex items-center justify-center rounded-full border-[3px] border-white/10 p-[8px] text-[14px] leading-none text-white/80"
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 600,
                                    letterSpacing: '-0.02em',
                                    fontFeatureSettings: '"tnum" 1',
                                }}
                            >
                                {post.number}
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
                        </a>
                    ))}

                    {filtered.length === 0 && (
                        <p className="text-text-muted text-[18px] leading-[1.5]">
                            nothing matches “{query.trim()}”.
                        </p>
                    )}
                </div>
            </main>

            {/* Search bar */}
            <div className="shrink-0 border-t-[3px] border-dashed border-flexoki-900 px-[32px] py-[24px] max-sm:px-5 max-sm:py-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="search my mind..."
                    aria-label="Search posts by title or tag"
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full bg-transparent border-0 outline-none text-white caret-white placeholder:text-white/25 font-semibold tracking-[-0.01em] leading-[1.1] text-[24px]"
                />
            </div>
        </div>
    );
}
