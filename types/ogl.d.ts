declare module 'ogl' {
    export class Renderer {
        constructor(options?: {
            canvas?: HTMLCanvasElement;
            width?: number;
            height?: number;
            dpr?: number;
            alpha?: boolean;
            depth?: boolean;
            stencil?: boolean;
            antialias?: boolean;
            premultipliedAlpha?: boolean;
            preserveDrawingBuffer?: boolean;
            powerPreference?: string;
            autoClear?: boolean;
            webgl?: number;
        });
        gl: any;
        setSize(width: number, height: number): void;
        render(options: { scene: any; camera?: any; target?: any; update?: boolean; sort?: boolean; frustumCull?: boolean; clear?: boolean }): void;
    }

    export class Program {
        constructor(gl: any, options?: {
            vertex?: string;
            fragment?: string;
            uniforms?: Record<string, { value: any }>;
            transparent?: boolean;
            cullFace?: number | boolean;
            frontFace?: number;
            depthTest?: boolean;
            depthWrite?: boolean;
            depthFunc?: number;
        });
        uniforms: Record<string, { value: any }>;
    }

    export class Mesh {
        constructor(gl: any, options?: {
            geometry?: any;
            program?: Program;
            mode?: number;
            frustumCulled?: boolean;
            renderOrder?: number;
        });
    }

    export class Triangle {
        constructor(gl: any);
    }

    export class Texture {
        constructor(gl: any, options?: {
            image?: any;
            target?: number;
            type?: number;
            format?: number;
            internalFormat?: number;
            wrapS?: number;
            wrapT?: number;
            generateMipmaps?: boolean;
            minFilter?: number;
            magFilter?: number;
            premultiplyAlpha?: boolean;
            unpackAlignment?: number;
            flipY?: boolean;
            anisotropy?: number;
            level?: number;
            width?: number;
            height?: number;
        });
        image: any;
        width: number;
        height: number;
        minFilter: number;
        magFilter: number;
        wrapS: number;
        wrapT: number;
        flipY: boolean;
        generateMipmaps: boolean;
        format: number;
        internalFormat: number;
        type: number;
        needsUpdate: boolean;
        update(textureUnit?: number): void;
    }

    export class Camera {
        constructor(gl: any, options?: any);
    }

    export class Transform {
        constructor();
    }

    export class Geometry {
        constructor(gl: any, attributes?: any);
    }

    export class Plane {
        constructor(gl: any, options?: any);
    }

    export class Vec2 {
        constructor(x?: number, y?: number);
        x: number;
        y: number;
        set(x: number, y: number): this;
    }

    export class Vec3 {
        constructor(x?: number, y?: number, z?: number);
        x: number;
        y: number;
        z: number;
        set(x: number, y: number, z: number): this;
    }

    export class Vec4 {
        constructor(x?: number, y?: number, z?: number, w?: number);
        x: number;
        y: number;
        z: number;
        w: number;
    }

    export class Mat4 {
        constructor();
    }

    export class Color {
        constructor(color?: string | number | number[]);
        r: number;
        g: number;
        b: number;
    }
}
