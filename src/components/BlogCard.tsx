import React from 'react';

interface BlogCardProps {
    slug: string;
    title: string;
    date: string;
}

export default function BlogCard({ slug, title, date }: BlogCardProps) {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');

    return (
        <a
            href={`/${slug}`}
            className="group flex items-center px-[16px] py-[10px] transition-colors bg-[#151414] border-y border-ui-border first:border-t-0 last:border-b-0 hover:bg-[#1c1b1a]"
            style={{ textDecoration: 'none' }}
            data-audio-click="true"
        >
            <div className="flex items-center gap-[20px] grow max-sm:flex-col max-sm:items-start max-sm:gap-[8px]">
                <span
                    className="shrink-0 text-[16px] text-[#575653] leading-[1.5]"
                    style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 400, fontFeatureSettings: '"tnum" 1' }}
                >
                    {year} • {month}
                </span>
                <span
                    className="text-[18px] text-[#cecdc3] transition-colors leading-[1.5] grow"
                    style={{ fontFamily: "'Geist', sans-serif", fontWeight: 400, fontFeatureSettings: '"ss02" 1' }}
                >
                    {title}
                </span>
            </div>
        </a>
    );
}
