import { useEffect, useRef, useState } from 'react';

/**
 * The shimmering status word in the homepage header ("priyansh is //thinking...").
 *
 * Starts on "thinking" and then cycles forever through the word pool at random,
 * never showing the same word twice in a row. Each word crossfades into the next
 * while the shimmer (the `.thinking` background animation) keeps running on the
 * outer span, so the light sweep never restarts.
 */

// "thinking" first, then the word list. All lowercase to match the brand.
const WORDS = [
    'thinking',
    'brewing', 'marinating', 'distilling', 'percolating', 'simmering',
    'incubating', 'germinating', 'crystallizing', 'weaving', 'philosophizing',
    'ruminating', 'cogitating', 'contemplating', 'interrogating', 'meandering',
    'calibrating', 'orchestrating', 'synthesizing', 'untangling', 'wrangling',
    'assembling', 'noodling', 'conjuring', 'herding', 'sprinkling',
    'choreographing', 'waltzing',
];

const INTERVAL_MS = 2200;
const FADE_MS = 260;

/** Pick a random word from the pool, never the one currently shown. */
function pickNext(current: string): string {
    let next = current;
    while (next === current) {
        next = WORDS[Math.floor(Math.random() * WORDS.length)];
    }
    return next;
}

export default function ThinkingStatus() {
    const [word, setWord] = useState('thinking');
    const [visible, setVisible] = useState(true);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        // Respect reduced-motion: stay on a static "thinking" (no cycling).
        const reduce =
            typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduce) return;

        const interval = setInterval(() => {
            setVisible(false); // fade current word out
            const swap = setTimeout(() => {
                setWord((w) => pickNext(w)); // swap while invisible
                setVisible(true); // fade next word in
            }, FADE_MS);
            timers.current.push(swap);
        }, INTERVAL_MS);

        return () => {
            clearInterval(interval);
            timers.current.forEach(clearTimeout);
            timers.current = [];
        };
    }, []);

    return (
        <span className="thinking">
            <span
                className="transition-opacity ease-in-out"
                style={{ transitionDuration: `${FADE_MS}ms`, opacity: visible ? 1 : 0 }}
            >
                {word}
            </span>
            …
        </span>
    );
}
