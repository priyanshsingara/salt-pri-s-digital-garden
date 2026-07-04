import { useEffect, useRef, useState } from 'react';
import { FunkyShadow } from 'funky-shadow';

/**
 * Decorative dithered gradient shadow behind the homepage hero header,
 * powered by `funky-shadow` (canvas-rendered, Bayer-dithered gradients).
 *
 * `funky-shadow` needs explicit pixel dimensions, so this island measures the
 * parent <header> with a ResizeObserver and repaints the shadow to match. It
 * sits absolutely behind the header content (pointer-events: none), so the
 * Astro markup and the <ThinkingStatus> island above it are untouched.
 *
 * ── Tuning ──────────────────────────────────────────────────────────────────
 * Swap the vibe in ONE line by changing PRESET below.
 *
 *   Available presets:
 *     'noir'      – neutral grey (most "subtle")   'deep-scan'  – muted teal
 *     'ocean'     – calm blue                       'forest'     – muted green
 *     'crt-night' – dim green CRT                    'synthwave'  – pink/purple
 *     'vaporwave' – pink/cyan                        'galaxy'     – purple (default lib)
 *     'plasma'    – magenta/blue                     'thermal'    – red/orange
 *     'magma'     – deep red/orange                  'sunset-strip' – warm sunset
 *
 * OPACITY dials subtle↔loud (0 = invisible, 1 = full). BLUR softens the edge.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Mid-intensity default: a calm blue that reads as a soft glow, not neon.
// Try 'noir' for barely-there subtle, or 'synthwave'/'vaporwave' for loud & cool.
const PRESET = 'ocean';
const OPACITY = 0.35; // subtle. Bump toward 0.6–0.7 for a bolder shadow.
const BLUR = 34; // px — soft, contained spread
const OFFSET_Y = 22; // px — biases the glow downward, like a drop shadow

export default function HeaderShadow() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{ w: number; h: number } | null>(null);

    useEffect(() => {
        const host = hostRef.current;
        // Astro wraps this island in an <astro-island> element that is
        // `display: contents` (a 0x0 box), so measure the real <header>.
        const header = host?.closest('header');
        if (!header) return;

        const update = () => {
            const rect = header.getBoundingClientRect();
            // Round to whole pixels; skip zero-size (pre-layout) frames.
            const w = Math.round(rect.width);
            const h = Math.round(rect.height);
            if (w > 0 && h > 0) setSize({ w, h });
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(header);
        return () => ro.disconnect();
    }, []);

    return (
        <div
            ref={hostRef}
            aria-hidden="true"
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                // Center the FunkyShadow box; its canvas overflows to cast the glow.
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {size && (
                <FunkyShadow
                    width={size.w}
                    height={size.h}
                    preset={PRESET}
                    opacity={OPACITY}
                    blur={BLUR}
                    offsetY={OFFSET_Y}
                />
            )}
        </div>
    );
}
