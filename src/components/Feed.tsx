import React, { useState } from 'react';
import Tabs from './Tabs';
import BlogCard from './BlogCard';
import TopicCard from './TopicCard';

interface Post {
    title: string;
    slug: string;
    date: string;
}

interface Topic {
    name: string;
    count: number;
}

interface FeedProps {
    posts: Post[];
    topics: Topic[];
}

export default function Feed({ posts, topics }: FeedProps) {
    const [activeTab, setActiveTab] = useState<'thoughts' | 'topics'>('thoughts');

    return (
        <div className="flex flex-col gap-[24px] items-start w-full">
            <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Card Container - Figma: border, rounded-12, overflow-clip */}
            <div className="border border-ui-border rounded-[12px] overflow-hidden flex flex-col gap-[6px] w-full">
                {activeTab === 'thoughts' && (
                    <>
                        {posts.map((post) => (
                            <BlogCard
                                key={post.slug}
                                slug={post.slug}
                                title={post.title}
                                date={post.date}
                            />
                        ))}
                    </>
                )}

                {activeTab === 'topics' && (
                    <>
                        {topics.map((topic) => (
                            <TopicCard
                                key={topic.name}
                                name={topic.name}
                                count={topic.count}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
