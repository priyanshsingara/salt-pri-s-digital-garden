import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

/**
 * The shimmering status word in the homepage header ("priyansh is //thinking...").
 *
 * Starts on "thinking" and then cycles forever through the word pool at random,
 * never showing the same word twice in a row. Words crossfade with a blur — the
 * outgoing word blurs out while the incoming word blurs in at the same time, so
 * the text is never empty — while the `.thinking` shimmer keeps sweeping.
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

const INTERVAL_MS = 2500;

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
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (reduceMotion) return; // stay on a static "thinking…"
        const id = setInterval(() => setWord((w) => pickNext(w)), INTERVAL_MS);
        return () => clearInterval(id);
    }, [reduceMotion]);

    if (reduceMotion) {
        return <span className="thinking">thinking…</span>;
    }

    return (
        <span className="relative inline-block align-baseline">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={word}
                    className="thinking inline-block"
                    initial={{ opacity: 0, filter: 'blur(10px)', y: '0.14em' }}
                    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                    exit={{ opacity: 0, filter: 'blur(10px)', y: '-0.14em' }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                    {word}…
                </motion.span>
            </AnimatePresence>
        </span>
    );
}
