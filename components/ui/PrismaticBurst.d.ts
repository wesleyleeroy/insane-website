import { CSSProperties } from 'react';

interface PrismaticBurstProps {
    intensity?: number;
    speed?: number;
    animationType?: 'rotate' | 'rotate3d' | 'hover';
    colors?: string[];
    distort?: number;
    paused?: boolean;
    offset?: { x: number | string; y: number | string };
    hoverDampness?: number;
    rayCount?: number;
    mixBlendMode?: string;
    isActive?: boolean;
    style?: CSSProperties;
    className?: string;
}

declare const PrismaticBurst: React.FC<PrismaticBurstProps>;
export default PrismaticBurst;
