/// <reference types="vite/client" />
import { HeadContent, Link, Outlet, Scripts, createRootRoute, useMatches } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import css from '~/styles/app.css?url'
import { seo } from '~/utils/seo'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...seo({
        title: 'Main | Essences Tools',
        description: ``,
      }),
    ],
    links: [
      { rel: 'preload', href: css, as: 'style' },
      { rel: 'stylesheet', href: css },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'manifest', href: '/site.webmanifest', color: '#ffffff' },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double:wght@100..900&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&family=Noto+Sans+JP:wght@100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootLayout>
        <DefaultCatchBoundary {...props} />
      </RootLayout>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
  staticData: { title: '', title_en: '' }
})

function RootComponent() {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  )
}

function RootLayout({ children }: { children: React.ReactNode }) {
  const page = useMatches().at(-1)?.staticData
  return (
    <html lang='ja'>
      <head>
        <HeadContent />
        <style>{':root { opacity: 0; }'}</style>
      </head>
      <body className='max-w-screen grid c1-1fr c2-auto/lg c3-1fr gap-x-4 r1-auto r2-1fr'>
        <div className="sticky top-0 area-span-full/1 grid grid-cols-subgrid z-50 font-sans text-4xl font-black bg-endfield  border-black border-b-4 shadow-md">
          <div className='area-span-full/1 h-16 bg-stripe stripe-gray-300/50 bg-size-8px/8px place-self-stretch/center' />
          <hgroup className='area-2/1 w-max py-1 font-sans font-black bg-endfield px-4 -mx-4 place-self-start/center'>
            <div className='comment-chip text-sm'>{page?.title_en}</div>
            <h1 className='-mt-1'>{page?.title}</h1>
            <div className='font-sarkaz text-sm'>{page?.title_en}</div>
          </hgroup>
        </div>
        <div className='max-md:hidden relative area-3/span-full place-self-stretch px-8 -z-10 overflow-hidden'>
          <div className='absolute top-0 bottom-0 flex font-novecento-sans font-black writing-sideways-lr text-[8rem]/none tracking-tightest text-transparent stripe-black stripe-20 bg-stripe bg-size-4px/4px bg-clip-text opacity-60'>
            <div className='min-h-36 bg-stripe stripe-20 bg-size-4px/4px ml-[0.02em] mr-[0.02em]' />
            <div className='px-8 ml-[-0.2em] mr-[-0.06em]'>{page?.title_en}</div>
            <div className='min-h-36 grow bg-stripe stripe-20 bg-size-4px/4px ml-[0.02em] mr-[0.02em]' />
          </div>
        </div>

        <div className='area-2/2 w-full max-w-lg min-h-screen py-8'>
          {children}
        </div>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
