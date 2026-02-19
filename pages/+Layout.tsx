import './app.css';
import { useData } from 'vike-react/useData';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { title = '基質補助', title_en = 'ESSENCE' } =
    useData<{ title?: string; title_en?: string }>() ?? {};

  return (
    <div className='max-w-screen grid c1-1fr c2-auto/lg c3-1fr gap-x-4 r1-auto r2-1fr bg-grid-gray-200 bg-size-5/5'>
      <div className='sticky top-0 area-span-full/1 grid grid-cols-subgrid z-50 font-sans text-4xl font-black bg-endfield  border-black border-b-4 shadow-md'>
        <div className='area-span-full/1 h-16 bg-stripe-gray-300/50 bg-size-8px/8px place-self-stretch/center' />
        <hgroup className='area-2/1 w-max py-1 font-sans font-black bg-endfield px-4 -mx-4 place-self-start/center'>
          <div className='comment-chip text-sm'>{title_en}</div>
          <h1 className='-mt-1 flex flex-row gap-1'>
            {title}
            <div className='place-self-end size-min aspect-square border-4 border-current after:block after:size-4 after:bg-current after:clip-path-arrow-se-4px/invert' />
          </h1>
          <div className='font-sarkaz text-sm'>{title_en}</div>
        </hgroup>
      </div>
      <div className='max-md:hidden relative area-3/span-full place-self-stretch px-8 overflow-hidden select-none'>
        <div className='absolute top-0 bottom-0 flex font-novecento-sans font-black writing-sideways-lr text-[8rem]/none tracking-tightest text-transparent bg-stripe-black bg-stripe-20 bg-size-4px/4px bg-clip-text opacity-40'>
          <div className='min-h-36 bg-stripe-black bg-stripe-20 bg-size-4px/4px ml-[0.02em] mr-[0.02em]' />
          <div className='px-8 ml-[-0.2em] mr-[-0.06em]'>{title_en}</div>
          <div className='min-h-36 grow bg-stripe-black bg-stripe-20 bg-size-4px/4px ml-[0.02em] mr-[0.02em]' />
        </div>
      </div>

      <div className='area-2/2 w-full max-w-lg min-h-screen py-8'>{children}</div>
    </div>
  );
}
