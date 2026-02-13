import { createFileRoute } from '@tanstack/react-router'
import { id, data } from '~/database'
import lang from '../data/ja.const.toml';
import React, { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

export const Route = createFileRoute('/weapons')({
  component: RouteComponent,
})

function RouteComponent() {
  const [columns, setColumns] = useState(6);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const listener = () => {
      if (ref.current == null) return;

      const columns = window.getComputedStyle(ref.current)
        .getPropertyValue('grid-template-columns')
        .split(' ').length;
      setColumns(columns);
    }

    listener()
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, []);

  const [activeIndex, setActiveIndex] = useState(-2);
  const [activeX, activeY] = [Math.floor(activeIndex % columns), Math.floor(activeIndex / columns)]

  const {register, control, setValue} = useForm<{
    rarity: Record<`star${3 | 4 | 5 | 6}`, boolean>,
    stats: Record<typeof data.stats.attribute[number]['id'], boolean> & Record<typeof data.stats.secondary[number]['id'], boolean> & Record<typeof data.stats.skill[number]['id'], boolean>,
    attribute: Record<typeof data.stats.attribute[number]['id'], boolean>,
    secondary: Record<typeof data.stats.secondary[number]['id'], boolean>,
    skill: Record<typeof data.stats.skill[number]['id'], boolean>,
  }>({
    defaultValues: {
      rarity: { star3: false, star4: false, star5: false, star6: false },
      stats: Object.fromEntries([
        ...data.stats.attribute,
        ...data.stats.secondary,
        ...data.stats.skill,
      ].map((it) => [it.id, false] as const)),
      attribute: Object.fromEntries(data.stats.attribute.map(it => [it.id, false] as const)),
      secondary: Object.fromEntries(data.stats.secondary.map(it => [it.id, false] as const)),
      skill: Object.fromEntries(data.stats.skill.map(it => [it.id, false] as const)),
    }
  })

  const { rarity, attribute, secondary, skill } = useWatch({ control });

  const weapons = data.weapons.filter((item) => (
    (!(rarity && Object.values(rarity).some(it => it)) || (rarity[`star${item.rarity}`]))
      && (!(attribute && Object.values(attribute).some(it => it)) || (item.attribute && attribute[item.attribute]))
      && (!(secondary && Object.values(secondary).some(it => it)) || (item.secondary && secondary[item.secondary]))
      && (!(skill && Object.values(skill).some(it => it)) || (item.skill && skill[item.skill]))
  ))

  const chip = {
    wrapper: 'flex flex-row flex-wrap gap-2 text-xs leading-none',
    label: 'relative h-4 px-2 rounded-full bg-gray-300 has-checked:bg-gray-100 transition flex items-center text-xs shadow-sm before:content before:absolute before:inset-0 before:bg-white/40 before:transition not-hover:before:opacity-0 after:content after:place-self-center/stretch after:border-l-1 after:border-gray-400 after:mx-1',
    input: 'absolute appearance-none inset-0 rounded-full',
    count: '-translate-y-px order-last',
  };

  return <main className='flex flex-col gap-2 col-1-auto'>
    {[
      ([3, 4, 5, 6] as const).map((rarity) => ({
        key: `rarity.star${rarity}`,
        label: Array.from({ length: rarity }, (_, i) => (
          <img key={i} src='/star.png' alt='star' className='h-3 -translate-x-px' />
        )),
        count: data.weapons.filter((it) => it.rarity == rarity).length,
      } as const)),
      id.stats.attribute.map((stat) => ({
        key: `attribute.${stat}`,
        label: <span className='-translate-y-px'>{lang.stats[stat]}</span>,
        count: data.weapons.filter((it) => it.attribute === stat).length,
      } as const)),
      id.stats.secondary.map((stat) => ({
        key: `secondary.${stat}`,
        label: <span className='-translate-y-px'>{lang.stats[stat]}</span>,
        count: data.weapons.filter((it) => it.secondary === stat).length,
      } as const)),
      id.stats.skill.map((stat) => ({
        key: `skill.${stat}`,
        label: <span className='-translate-y-px'>{lang.stats[stat]}</span>,
        count: data.weapons.filter((it) => it.skill === stat).length,
      } as const)),
    ].map((items) => (
      <div className={chip.wrapper}>
        {items.map(({ key, label, count }) => (
          <label key={key} className={chip.label}>
            <input type='checkbox' {...register(key) } className={chip.input} />
            {label}
            <span className={chip.count}>{count}</span>
          </label>
        ))}
      </div>
    ))}

    <div ref={ref} className='grid grid-cols-fill-20 gap-x-1 gap-y-0.5 grid-flow-dense'>
      {weapons.map((it, i) => {
        const [x, y] = [Math.floor(i % columns), Math.floor(i / columns)];
        const slide = activeIndex < 0 || y != activeY
          ? 'group-not-open:-translate-y-60 starting:-translate-y-60'
          : x < activeX
          ? 'group-not-open:-translate-x-80'
          : x > activeX
          ? 'group-not-open:translate-x-80'
          : '';

        const color = {
          3: 'border-rarity-3 inset-shadow-rarity-3',
          4: 'border-rarity-4 inset-shadow-rarity-4',
          5: 'border-rarity-5 inset-shadow-rarity-5',
          6: 'border-rarity-6 inset-shadow-rarity-6',
        }[it.rarity] ?? '';
        const beforeColor = {
          3: 'before:bg-rarity-3',
          4: 'before:bg-rarity-4',
          5: 'before:bg-rarity-5',
          6: 'before:bg-rarity-6',
        }[it.rarity] ?? '';

        return <details key={it.id} name='weapons'
            onToggle={(it) => setActiveIndex(old => it.newState == 'open' ? i : i == old ? -1 : old)}
            className={`group contents anchor-scope/button details-content:col-span-full details-content:row-start-(--row) details-content:overflow-hidden details-content:transition-extra details-content:duration-500 details-content:ease-in-out not-open:details-content:opacity-0 details-content:content-visibility-auto ${y == activeY ? 'details-content:h-auto' : 'not-open:details-content:h-0'} not-any-pointer-fine:details-content:transition not-any-pointer-fine:details-content:h-auto not-any-pointer-fine:not-open:details-content:h-0`}
            style={{ '--row': 2 * y + 2 }}>
          <summary  className={`relative size-full aspect-square rounded-sm overflow-hidden grid *:area-1/1 anchor/button`}>
            <div className={`size-full bg-gray-900 stripe-gray-800/40 bg-stripe bg-repeat bg-size-4px/4px border-b-4 inset-shadow-[0px_-20px_20px_-20px] ${color}`}></div>
            <img src={`/endfield-res/weapons/${it.id}.webp`} alt={lang.weapons[it.id]} width={256} height={256} className='size-full mask-b-from-white mask-b-from-60% mask-b-to-transparent mask-b-to-85%'/>
            <div className='max-w-full text-white place-self-center/end p-1 text-xs text-ellipsis overflow-hidden drop-shadow-sm drop-shadow-black text-balance text-center'>{lang.weapons[it.id]}</div>
            <input type='checkbox' className='accent-endfield text-gray-700 size-4 z-10 m-1 place-self-end/start not-checked:appearance-none' />
          </summary>
          {/* <div className='size-4 anchored-bottom-center/button clip-path-triangle-up bg-black'/> */}
          <div className={`max-w-md mx-auto py-2 grid c1-auto c2-1fr r1-auto r2-1fr gap-2 place-items-stretch/start transition duration-500 ease-in-out group-not-open:opacity-0 ${slide}`}>
            <div className='area-1/span-full h-full'>
              <div className='text-xs/none font-novecento-sans font-black'><span className='tracking-[-0.2em]'>//</span> FIGURE</div>
              <div className={`relative size-40 aspect-square rounded-sm overflow-hidden grid *:area-1/1`}>
                <div className={`size-full bg-gray-900 stripe-gray-800/40 bg-stripe bg-repeat bg-size-4px/4px border-b-4 inset-shadow-[0px_-40px_40px_-40px] ${color}`}></div>
                <img src={`/endfield-res/weapons/${it.id}.webp`} alt={lang.weapons[it.id]} width={256} height={256} className='size-full mask-b-from-white mask-b-from-60% mask-b-to-transparent mask-b-to-85%'/>
                <div className='text-white self-end justify-self-center p-1 drop-shadow-sm drop-shadow-black'><span className='text-xs'>Lv. </span>//</div>
              </div>
            </div>
            <div>
              <div className='text-xs/none font-novecento-sans font-black'><span className='tracking-[-0.2em]'>//</span> TITLE</div>

              <div className={`col-span-3 px-2 py-1 flex gap-1 bg-gray-800 text-xl/none text-white rounded-xs before:block before:content ${beforeColor} before:h-lh before:w-1 before:rounded-full after:content after:bg-stripe after:grow after:stripe-gray-300/20 after:bg-size-4px/4px`}>
                <div className='-translate-y-px'>{lang.weapons[it.id]}</div>
              </div>
            </div>
            <div className='grid grid-cols-3 place-items-start'>
              <div className='text-xs/none font-novecento-sans font-black'><span className='tracking-[-0.2em]'>//</span> STATS</div>

              {(['attribute', 'secondary', 'skill'] as const).map((category) => (
                <div className={`col-span-3 grid grid-cols-subgrid px-2 py-1 bg-gray-200 rounded-xs ${color}`}>
                  <div>{lang.ui.stats[category]}</div>
                  <div>{it[category] ? lang.stats[it[category]] : lang.ui.stats.empty}</div>
                </div>
              ))}
            </div>
          </div>
        </details>
      })}
    </div>
  </main>
}
