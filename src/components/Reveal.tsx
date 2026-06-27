import { motion, useReducedMotion } from 'motion/react';

interface RevealProps {
    /** Pre-rendered HTML to reveal (e.g. the parsed markdown body). */
    html: string;
    className?: string;
}

/**
 * Reveals article content on load with a subtle, fast blur + rise — the text
 * eases up from slightly below while blur clears. Honors reduced-motion.
 */
export default function Reveal({ html, className }: RevealProps) {
    const reduce = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={reduce ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
