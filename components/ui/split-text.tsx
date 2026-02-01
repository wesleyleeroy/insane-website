"use client";

import { motion, Variants, useAnimation, type Easing } from "framer-motion";
import { useEffect, forwardRef, useImperativeHandle } from "react";

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: Easing;
    splitType?: "chars" | "words";
    from?: { opacity?: number; y?: number; x?: number; rotateX?: number; scale?: number };
    to?: { opacity?: number; y?: number; x?: number; rotateX?: number; scale?: number };
    textAlign?: "left" | "center" | "right";
    onAnimationComplete?: () => void;
    trigger?: boolean; // External trigger to start animation
    style?: React.CSSProperties;
}

export interface SplitTextRef {
    triggerAnimation: () => void;
    resetAnimation: () => void;
}

const SplitText = forwardRef<SplitTextRef, SplitTextProps>(({
    text,
    className = "",
    delay = 50,
    duration = 0.8,
    ease = "easeOut",
    splitType = "chars",
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    textAlign = "center",
    onAnimationComplete,
    trigger = false,
    style = {},
}, ref) => {
    const controls = useAnimation();

    // Split text into chars or words
    const elements = splitType === "chars"
        ? text.split("")
        : text.split(" ");

    // Container animation variants
    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: delay / 1000,
                delayChildren: 0,
            },
        },
    };

    // Individual element animation variants
    const elementVariants: Variants = {
        hidden: {
            opacity: from.opacity ?? 0,
            y: from.y ?? 0,
            x: from.x ?? 0,
            rotateX: from.rotateX ?? 0,
            scale: from.scale ?? 1,
        },
        visible: {
            opacity: to.opacity ?? 1,
            y: to.y ?? 0,
            x: to.x ?? 0,
            rotateX: to.rotateX ?? 0,
            scale: to.scale ?? 1,
            transition: {
                duration,
                ease,
            },
        },
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        triggerAnimation: () => {
            controls.start("visible");
        },
        resetAnimation: () => {
            controls.start("hidden");
        },
    }));

    // React to external trigger prop
    useEffect(() => {
        if (trigger) {
            controls.start("visible");
        } else {
            controls.set("hidden");
        }
    }, [trigger, controls]);

    return (
        <motion.span
            className={`split-text-container ${className}`}
            style={{
                display: "inline-block",
                textAlign,
                overflow: "visible",
                whiteSpace: "nowrap",
                perspective: "1000px",
                ...style,
            }}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            onAnimationComplete={() => {
                onAnimationComplete?.();
            }}
        >
            {elements.map((element, index) => (
                <motion.span
                    key={index}
                    className="split-text-element"
                    style={{
                        display: "inline-block",
                        willChange: "transform, opacity",
                        transformStyle: "preserve-3d",
                    }}
                    variants={elementVariants}
                >
                    {element === " " ? "\u00A0" : element}
                    {splitType === "words" && index < elements.length - 1 ? "\u00A0" : ""}
                </motion.span>
            ))}
        </motion.span>
    );
});

SplitText.displayName = "SplitText";

export default SplitText;
