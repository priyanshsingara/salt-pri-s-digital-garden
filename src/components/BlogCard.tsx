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
            className="group flex items-center px-[16px] py-[10px] transition-colors bg-[#F2F0E5] hover:bg-[#DAD8CE] dark:bg-[#151414] dark:hover:bg-[#1c1b1a]"
            style={{ textDecoration: 'none' }}
        >
            <div className="flex items-center gap-[20px] grow">
                <span
                    className="shrink-0 text-[16px] text-[#878580] dark:text-[#575653] leading-[1.4]"
                    style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 400 }}
                >
                    {year} • {month}
                </span>
                <span
                    className="text-[18px] text-[#100F0F] group-hover:text-[#6F6E69] dark:text-[#cecdc3] dark:group-hover:text-[#878580] transition-colors leading-[1.4] grow"
                    style={{ fontFamily: "'Geist', sans-serif", fontWeight: 400 }}
                >
                    {title}
                </span>
            </div>
        </a>
    );
}
