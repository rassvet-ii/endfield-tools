import 'react';

declare module 'react' {
    interface CSSProperties {
        [key: `--${string}`]: string | number
    }

    // interface HTMLAttributes<T> {
    //     hidden?: boolean | 'until-found' | 'hidden' | undefined;
    // }
}

declare module '@tanstack/react-router' {
    interface StaticDataRouteOption {
        title: string,
        title_en: string,
    }
}

