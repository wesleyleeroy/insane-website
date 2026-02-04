import { CSSProperties } from 'react';

interface LiquidEtherProps {
    colors?: string[];
    mouseForce?: number;
    cursorSize?: number;
    isViscous?: boolean;
    viscous?: number;
    iterationsViscous?: number;
    iterationsPoisson?: number;
    resolution?: number;
    isBounce?: boolean;
    autoDemo?: boolean;
    autoSpeed?: number;
    autoIntensity?: number;
    takeoverDuration?: number;
    autoResumeDelay?: number;
    autoRampDuration?: number;
    isActive?: boolean;
    style?: CSSProperties;
    className?: string;
}

declare const LiquidEther: React.FC<LiquidEtherProps>;
export default LiquidEther;
