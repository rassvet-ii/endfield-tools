import 'react';

declare module 'react' {
    interface CSSProperties {
        [key: `--${string}`]: string | number
    }
}

declare module '@tanstack/react-router' {
    interface StaticDataRouteOption {
        title: string,
        title_en: string,
    }
}
