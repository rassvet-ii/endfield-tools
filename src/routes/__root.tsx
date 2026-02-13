/// <reference types="vite/client" />
import { HeadContent, Link, Outlet, Scripts, createRootRoute} from '@tanstack/react-router'
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
      { rel: 'stylesheet', href: css },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'manifest', href: '/site.webmanifest', color: '#ffffff' },
      { rel: 'icon', href: '/favicon.ico' },
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
})

function RootComponent() {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  )
}

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ja'>
      <head>
        <HeadContent />
      </head>
      <body className='max-w-screen grid c1-1fr c2-auto/lg c3-1fr gap-x-4 r1-auto r2-1fr relative overflow-x-hidden'>
        <div className="sticky top-0 area-span-full/1 grid grid-cols-subgrid z-50 font-sans text-4xl font-black bg-endfield  border-black border-b-4 shadow-md">
          <div className='area-span-full/1 h-16 bg-stripe stripe-gray-300/50 bg-size-8px/8px place-self-stretch/center' />
          <hgroup className='area-2/1 w-max py-1 font-sans font-black bg-endfield px-4 -mx-4 place-self-start/center'>
            <div className='font-novecento-sans text-sm'><span className='tracking-[-0.2em]'>//</span> WEAPONS</div>
            <h1 className='-mt-1'>武器選択</h1>
            <div className='font-sarkaz text-sm'>WEAPONS</div>
          </hgroup>
        </div>
        <div className='area-3/span-full place-self-start/stretch px-8 -z-10 overflow-hidden'>
          <div className='h-full flex flex-nowrap font-novecento-sans font-black tracking-[-1rem] text-nowrap writing-sideways-lr text-[8rem] text-transparent leading-none stripe-black stripe-20 bg-stripe bg-repeat bg-size-4px/4px opacity-60 bg-clip-text before:content before:min-h-18 before:grow before:bg-stripe before:stripe-20 before:bg-repeat before:bg-size-4px/4px after:content after:min-h-18 after:grow-3 after:bg-stripe after:stripe-20 after:bg-repeat after:bg-size-4px/4px'>
            <div className='px-8 ml-[calc(8rem*-52/256)] mr-[calc(8rem*-16/256)]'>WEAPONS</div>
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
