import React, { useState, useEffect, useRef } from 'react';

interface TabsProps {
    activeTab: 'thoughts' | 'topics';
    onTabChange: (tab: 'thoughts' | 'topics') => void;
}

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
    const [isDark, setIsDark] = useState(true);
    const thoughtsRef = useRef<HTMLButtonElement>(null);
    const topicsRef = useRef<HTMLButtonElement>(null);

    // Initialize with null to hidden until measured
    const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);

    useEffect(() => {
        // Check initial theme and listen for changes
        const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
        checkTheme();

        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const updatePosition = () => {
            const activeRef = activeTab === 'thoughts' ? thoughtsRef : topicsRef;
            if (activeRef.current) {
                setPillStyle({
                    left: activeRef.current.offsetLeft,
                    width: activeRef.current.offsetWidth
                });
            }
        };

        // Update immediately and after a brief timeout to ensure layout stability
        updatePosition();
        const timeoutId = setTimeout(updatePosition, 50);

        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('resize', updatePosition);
            clearTimeout(timeoutId);
        };
    }, [activeTab]);

    // Design Tokens based on Figma node 89:2937
    // Dark Mode: Pill #151414, Active Text #CECDC3, Inactive Text #878580
    // Light Mode: Pill #CECDC3, Active Text #100F0F, Inactive Text #6F6E69
    const pillColor = isDark ? '#151414' : '#E6E4D9';

    return (
        <div className="relative flex items-center gap-[12px] w-fit p-1">
            {/* Animated Pill Background */}
            <div
                className="absolute top-0 bottom-0 my-auto h-[43px] rounded-[56px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[left,width]"
                style={{
                    left: `${pillStyle?.left ?? 0}px`,
                    width: `${pillStyle?.width ?? 0}px`,
                    backgroundColor: pillColor,
                    opacity: pillStyle ? 1 : 0, // Prevent FOUS (Flash of Unstyled Style)
                }}
            />

            <TabButton
                ref={thoughtsRef}
                isActive={activeTab === 'thoughts'}
                onClick={() => onTabChange('thoughts')}
                isDark={isDark}
            >
                thoughts
            </TabButton>

            <TabButton
                ref={topicsRef}
                isActive={activeTab === 'topics'}
                onClick={() => onTabChange('topics')}
                isDark={isDark}
            >
                topics
            </TabButton>
        </div>
    );
}

interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isActive: boolean;
    isDark: boolean;
}

const TabButton = React.forwardRef<HTMLButtonElement, TabButtonProps>(
    ({ isActive, isDark, children, ...props }, ref) => {
        // Determine text colors
        let textColor;
        if (isActive) {
            textColor = isDark ? '#CECDC3' : '#100F0F';
        } else {
            textColor = isDark ? '#878580' : '#6F6E69';
        }

        return (
            <button
                ref={ref}
                type="button"
                className="relative z-10 px-[16px] py-[8px] text-[18px] leading-[1.5] rounded-[56px] transition-colors duration-200 focus:outline-none focus:ring-0 active:outline-none border-0 bg-transparent cursor-pointer select-none"
                style={{
                    fontFamily: "'Geist', sans-serif",
                    color: textColor,
                    WebkitTapHighlightColor: 'transparent', // Remove mobile highlight
                }}
                {...props}
            >
                {children}
            </button>
        );
    }
);
