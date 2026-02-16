import { createFileRoute } from '@tanstack/react-router'
import { id, data } from '~/database'
import lang from '../data/ja.const.toml';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { clsx } from 'clsx';

export const Route = createFileRoute('/weapons')({
  component: RouteComponent,
  staticData: {
    title: '武器選択',
    title_en: 'WEAPONS'
  }
})

function RouteComponent() {
  const [{ columns, height }, setSizes] = useState({ columns: 6, height: null as (number | null) });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const listener = () => {
      if (ref.current == null) return;

      const height = ref.current.offsetHeight;
      const columns = window.getComputedStyle(ref.current)
        .getPropertyValue('grid-template-columns')
        .split(' ').length;
      setSizes({ columns, height });
    }

    listener()
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, []);

  const [open, toggle] = useReducer((prev: number, index: number) => {
    console.log({ prev, index, now: index != prev ? index : -1 })
    return index != prev ? index : -1;
  }, -1);
  const [activeX, activeY] = [Math.floor(open % columns), Math.floor(open / columns)]

  interface FilterOptions {
    rarity: Record<`star${3 | 4 | 5 | 6}`, boolean>;
    attribute: Record<typeof id.stats.attribute[number], boolean>;
    secondary: Record<typeof id.stats.secondary[number], boolean>;
    skill: Record<typeof id.stats.skill[number], boolean>;
  }
  const {register, control, setValue, reset} = useForm<FilterOptions>({
    defaultValues: {
      rarity: { star3: false, star4: false, star5: false, star6: false },
      attribute: Object.fromEntries(id.stats.attribute.map(it => [it, false])),
      secondary: Object.fromEntries(id.stats.secondary.map(it => [it, false])),
      skill: Object.fromEntries(id.stats.skill.map(it => [it, false])),
    },
    resetOptions: {
      keepDefaultValues: true,
    },
  });

  const filter = useWatch({ control });
  const implies = (cond: boolean | null | undefined, value: boolean | null | undefined) => !cond || value;
  const some = (values: Record<string, boolean | null | undefined>) => Object.values(values).some((it) => it);
  const weaponFilter = ({
    rarity = {},
    attribute = {},
    secondary = {},
    skill = {},
  }: {
    [key in keyof FilterOptions]?: Partial<FilterOptions[key]>
  }) => (item: typeof data.weapons[number]) => [
    implies(some(rarity), item.rarity && rarity[`star${item.rarity}`]),
    implies(some(attribute), item.attribute && attribute[item.attribute]),
    implies(some(secondary), item.secondary && secondary[item.secondary]),
    implies(some(skill), item.skill && skill[item.skill]),
  ].every((it) => it)

  let count = 0;
  const weapons = data.weapons.map((item) => {
    const valid = weaponFilter(filter)(item);
    return { count: (valid ? count++ : count), valid, item };
  })

  return <main className='flex flex-col gap-2 col-1-auto'>
    {[
      ([3, 4, 5, 6] as const).map((rarity) => ({
        key: `rarity.star${rarity}`,
        label: Array.from({ length: rarity }, (_, i) => (
          <img key={i} src='/star.png' alt='star' className='h-3 -translate-x-px' />
        )),
        count: data.weapons.filter(weaponFilter({ ...filter, rarity: { [`star${rarity}`]: true }})).length,
      } as const)),
      id.stats.attribute.map((stat) => ({
        key: `attribute.${stat}`,
        label: lang.stats[stat],
        count: data.weapons.filter(weaponFilter({ ...filter, attribute: { [stat]:true }})).length,
      } as const)),
      id.stats.secondary.map((stat) => ({
        key: `secondary.${stat}`,
        label: lang.stats[stat],
        count: data.weapons.filter(weaponFilter({ ...filter, secondary: { [stat]:true }})).length,
      } as const)),
      id.stats.skill.map((stat) => ({
        key: `skill.${stat}`,
        label: lang.stats[stat],
        count: data.weapons.filter(weaponFilter({ ...filter, skill: { [stat]:true }})).length,
      } as const)),
    ].map((items) => (
      <div className='flex flex-row flex-wrap gap-2 text-xs leading-none -my-1 py-2 px-2 bg-gray-100 even:bg-gray-200'>
        {items.map(({ key, label, count }) => (
          <label key={key} className='relative h-4 px-2 rounded-full bg-gray-300 has-checked:bg-endfield transition flex items-center text-xs shadow-sm before:content before:absolute before:inset-0 before:rounded-full before:bg-white/40 before:transition not-hover:before:opacity-0'>
            <input type='checkbox' {...register(key, { onChange: () => toggle(-1) }) } className='absolute appearance-none inset-0 rounded-full' />
            {label}
            <div className='pl-1 ml-1 border-l border-gray-400'>{count}</div>
          </label>
        ))}
      </div>
    ))}

    <div ref={ref} className='grid grid-cols-fill-20 gap-x-1 gap-y-0.5 grid-flow-dense'>
      {weapons.map(({ count, valid, item: it }) => {
        const [x, y] = [Math.floor(count % columns), Math.floor(count / columns)];

        const slide = clsx({
          'group-not-open:-translate-y-24': open < 0 || y != activeY,
          'group-not-open:-translate-x-80': y == activeY && x < activeX,
          'group-not-open:translate-x-80': y == activeY && x > activeX,
        })

        const color = clsx({
          3: 'border-rarity-3 inset-shadow-rarity-3',
          4: 'border-rarity-4 inset-shadow-rarity-4',
          5: 'border-rarity-5 inset-shadow-rarity-5',
          6: 'border-rarity-6 inset-shadow-rarity-6',
        }[it.rarity]);
        const beforeColor = clsx({
          3: 'before:bg-rarity-3',
          4: 'before:bg-rarity-4',
          5: 'before:bg-rarity-5',
          6: 'before:bg-rarity-6',
        }[it.rarity]);

        return <details key={it.id} name='weapons'
            open={count === open} onClick={(it) => (it.preventDefault(), toggle(count))}
            className={`group ${valid ? 'contents' : 'hidden'} details:col-span-full details:row-(--row) details:content-visibility-auto details:transition-details details:duration-500 details:ease-in-out ${y == activeY ? 'details:h-48' : 'not-open:details:h-0'} max-sm:details:transition-none`}
            style={{ '--row': 2 * y + 2 }}>
          <summary  className='aspect-square rounded-sm overflow-hidden grid *:area-1/1'>
            <div className={`size-full bg-gray-900 stripe-gray-800 bg-stripe bg-repeat bg-size-4px/4px border-b-4 inset-shadow-[0px_-20px_20px_-20px] ${color}`}></div>
            <img src={`/endfield-res/weapons/${it.id}.webp`} alt={lang.weapons[it.id]} width={256} height={256} className='size-full mask-b-from-white mask-b-from-60% mask-b-to-transparent mask-b-to-85%'/>
            <div className='max-w-full text-white place-self-center/end p-1 text-xs text-ellipsis overflow-hidden drop-shadow-sm drop-shadow-black text-balance text-center'>{lang.weapons[it.id]}</div>
            <input type='checkbox' className='accent-endfield text-gray-700 size-4 z-10 m-1 place-self-end/start not-checked:appearance-none' />
          </summary>
          <div className={`max-w-md mx-auto py-2 grid c1-auto c2-1fr r1-auto r2-1fr gap-2 place-items-stretch/start grid-flow-dense transition duration-500 ease-in-out group-not-open:opacity-0 ${slide}`}>
            <div className='row-span-full'>
              <div className='comment-chip text-xs'>FIGURE</div>
              <div className='size-40 aspect-square rounded-sm overflow-hidden grid *:area-1/1'>
                <div className={`size-full bg-gray-900 stripe-gray-800 bg-stripe bg-repeat bg-size-4px/4px border-b-4 inset-shadow-[0px_-40px_40px_-40px] ${color}`}></div>
                <img src={`/endfield-res/weapons/${it.id}.webp`} alt={lang.weapons[it.id]} width={256} height={256} className='size-full mask-b-from-white mask-b-from-60% mask-b-to-transparent mask-b-to-85%'/>
                <div className='text-white self-end justify-self-center p-1 drop-shadow-sm drop-shadow-black'><span className='text-xs'>Lv. </span>//</div>
              </div>
            </div>
            <div>
              <div className='comment-chip text-xs'>TITLE</div>
              <div className={`px-2 py-1 flex gap-1 bg-gray-800 text-xl/none text-white rounded-xs before:block before:content ${beforeColor} before:h-lh before:w-1 before:rounded-full after:content after:bg-stripe after:grow after:stripe-gray-300/20 after:bg-size-4px/4px`}>
                <div className='-translate-y-px'>{lang.weapons[it.id]}</div>
              </div>
            </div>
            <div>
              <div className='comment-chip text-xs'>STATS</div>
              <div className='grid c1-auto c2-1fr c3-auto gap-x-2 bg-gray-200 rounded-xs'>
                {(['attribute', 'secondary', 'skill'] as const).map((category) => (
                  <div key={category} className={`col-span-3 grid grid-cols-subgrid px-2 py-1 items-center ${color}`}>
                    <div className='text-xs'>{lang.ui.stats[category]}</div>
                    <div>{it[category] ? lang.stats[it[category]] : lang.ui.stats.empty}</div>
                    {/* <button className='relative h-4 px-2 rounded-full bg-gray-50 has-checked:bg-endfield transition flex items-center text-xs shadow-sm before:content before:absolute before:inset-0 before:rounded-full before:bg-white/40 before:transition not-hover:before:opacity-0'>選択▶</button> */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>
      })}

      <div className={`col-span-full transition-details duration-500 ease-in-out ${activeY == -1 ? 'h-48' : 'h-0'} max-sm:transition-none`} />
    </div>
  </main>
}
