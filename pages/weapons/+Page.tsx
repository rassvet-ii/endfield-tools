import { id, data } from '@/pages/data/database'
import lang from '../data/ja.const.toml';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { clsx } from 'clsx';

export default function RouteComponent() {
  const [{ columns }, setSizes] = useState({ columns: 6  });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const listener = () => {
      if (ref.current == null) return;

      const columns = window.getComputedStyle(ref.current)
        .getPropertyValue('grid-template-columns')
        .split(' ').length;
      setSizes({ columns });
    }

    listener()
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, []);

  const [open, toggle] = useReducer((prev: number, [mode, index]: ['toggle' | 'open' | 'closed', number]) => {
    return mode === 'open' ? index
      : mode === 'closed' ? (prev === index ? -1 : prev)
      : index != prev ? index : -1;
  }, -1);
  const someOpen = open >= 0;
  const [activeX, activeY] = someOpen ? [Math.floor(open % columns), Math.floor(open / columns)] : [-1, -1];

  interface FilterOptions {
    rarity: Record<'3' | '4' | '5' | '6', boolean>;
    attribute: Record<typeof id.stats.attribute[number], boolean>;
    secondary: Record<typeof id.stats.secondary[number], boolean>;
    skill: Record<typeof id.stats.skill[number], boolean>;
    stage: Record<typeof id.energy_alluviums[number], boolean>;
  }
  const {register, control, setValue, reset} = useForm<FilterOptions>({
    defaultValues: {
      rarity: { '3': false, '4': false, '5': false, '6': false },
      attribute: Object.fromEntries(id.stats.attribute.map(it => [it, false])),
      secondary: Object.fromEntries(id.stats.secondary.map(it => [it, false])),
      skill: Object.fromEntries(id.stats.skill.map(it => [it, false])),
      stage: Object.fromEntries(id.energy_alluviums.map(it => [it, false])),
    },
    resetOptions: {
      keepDefaultValues: true,
    },
  });

  const filter = useWatch({ control });
  const implies = (cond: boolean | unknown, value: boolean | unknown) => !cond || !!value;
  const some = (values: Record<string, boolean | unknown>) => Object.values(values).some((it) => it);
  const weaponFilter = ({
    rarity = {},
    attribute = {},
    secondary = {},
    skill = {},
    stage = {},
  }: {
    [key in keyof FilterOptions]?: Partial<FilterOptions[key]>
  }) => (item: typeof data.weapons[number]) => [
    implies(some(rarity), item.rarity && rarity[item.rarity]),
    implies(some(attribute), item.attribute && attribute[item.attribute]),
    implies(some(secondary), item.secondary && secondary[item.secondary]),
    implies(some(skill), item.skill && skill[item.skill]),
    implies(some(stage), data.energy_alluviums.filter((it) => stage[it.id]).some((stage) => [
      implies(item.attribute != null, item.attribute && stage.attribute_stats.includes(item.attribute)),
      implies(item.secondary != null, item.secondary && stage.secondary_stats.includes(item.secondary)),
      implies(item.skill != null, item.skill && stage.skill_stats.includes(item.skill)),
    ].every((it) => it))),
  ].every((it) => it)

  let count = 0;
  const weapons = data.weapons.map((item) => {
    const visible = weaponFilter(filter)(item);
    return { count: (visible ? count++ : count), visible, item };
  })

  return <main className='flex flex-col gap-2 col-1-auto'>
    <div className='rounded-sm overflow-clip'>
      {[
        data.energy_alluviums.map((stage) => ({
          key: `stage.${stage.id}`,
          label: lang.energy_alluviums[stage.id],
          count: data.weapons.filter(weaponFilter({...filter, stage: { [stage.id]: true }})).length,
        } as const)),
        ([3, 4, 5, 6] as const).map((rarity) => ({
          key: `rarity.${rarity}`,
          label: Array.from({ length: rarity }, (_, i) => (
            <img key={i} src='/endfield-res/star.png' alt='star' className='h-3 -translate-x-px' />
          )),
          count: data.weapons.filter(weaponFilter({ ...filter, rarity: { [rarity]: true }})).length,
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
      ].map((items, i) => (
        <div key={i} className='flex flex-row flex-wrap gap-2 text-xs leading-none px-2 py-2 bg-gray-200 even:bg-gray-300'>
          {items.map(({ key, label, count }) => (
            <label key={key} className={clsx(`relative flex items-center h-4 px-2 rounded-full text-xs transition bg-gray-50 has-checked:bg-endfield shadow-sm hover:shadow-md hover:brightness-90`, count <= 0 && 'bg-gray-200 text-gray-500')}>
              <input type='checkbox' {...register(key, { onChange: () => toggle(['open', -1]) }) } className='absolute appearance-none inset-0 rounded-full' />
              {label}
              <div className='pl-1 ml-1 border-l border-gray-400'>{count}</div>
            </label>
          ))}
        </div>
      ))}
    </div>

    <div ref={ref} className='grid grid-cols-fill-20 gap-x-1 gap-y-0.5 grid-flow-dense'>
      {weapons.map(({ count, visible, item: it }) => {
        const [x, y] = [Math.floor(count % columns), Math.floor(count / columns)];

        const slide = clsx(open !== count && {
          '-translate-y-24': open < 0 || y != activeY,
          '-translate-x-80': y == activeY && x < activeX,
          'translate-x-80': y == activeY && x > activeX,
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

        return <details key={it.id}
            open={count === open}
            onToggle={(it) => toggle([it.newState, count])}
            style={{ '--row': 2 * y + 2 }}
            className={clsx(
              `group ${visible ? 'contents' : 'hidden'} details:col-span-full details:row-(--row) details:content-visibility-auto details:overflow-clip details:relative not-open:details:-z-10`,
              `details:transition-details details:duration-500 details:ease-in-out max-sm:details:transition-none`,
              open === count ? 'details:opacity-100' : 'details:opacity-0',
              y === activeY ? 'details:h-60' : 'details:h-0',
            )}>
          <summary className='aspect-square rounded-sm overflow-hidden grid *:area-1/1'>
            <div className={`size-full bg-gray-900 stripe-gray-800 bg-stripe bg-repeat bg-size-4px/4px border-b-4 inset-shadow-[0px_-20px_20px_-20px] ${color}`}></div>
            <img src={`/endfield-res/weapons/${it.id}.webp`} alt={lang.weapons[it.id]} width={256} height={256} className='size-full mask-b-from-white mask-b-from-60% mask-b-to-transparent mask-b-to-85%'/>
            <div className='max-w-full text-white place-self-center/end p-1 text-xs text-ellipsis drop-shadow-sm drop-shadow-black text-balance text-center'>{lang.weapons[it.id]}</div>
          </summary>
          <div className={`max-w-md h-full mx-auto py-2 grid c1-auto c2-1fr r1-auto r2-auto r3-1fr gap-2 place-items-stretch grid-flow-dense transition duration-500 ease-in-out ${slide}`}>
            <div className='row-span-full flex flex-col after:content after:block after:mt-2 after:grow after:bg-stripe after:stripe-black/20 after:bg-size-4px/4px after:place-self-stretch'>
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
              <div className='grid c1-auto c2-1fr c3-auto gap-x-2 rounded-xs'>
                {(['attribute', 'secondary', 'skill'] as const).map((category) => (
                  <div key={category} className={`col-span-3 grid grid-cols-subgrid px-2 py-1 items-center bg-gray-200 even:bg-gray-300`}>
                    <div className='text-xs'>{lang.ui.stats[category]}</div>
                    <div className='text-sm'>{it[category] ? lang.stats[it[category]] : lang.ui.stats.empty}</div>
                    <button className='relative flex items-center h-4 px-2 rounded-full text-xs transition bg-gray-50 shadow-sm hover:shadow-md hover:brightness-90' tabIndex={open === count ? 0 : -1}>選択</button>
                  </div>
                ))}
              </div>
            </div>
            <div className='flex flex-col'>
              <div className='comment-chip text-xs'>OBTAINABLE</div>
              <div className='grow flex flex-row flex-wrap gap-2 rounded-xs px-2 py-1 bg-gray-200'>
                {data.energy_alluviums.filter((stage) => [
                  implies(it.attribute != null, it.attribute && stage.attribute_stats.includes(it.attribute)),
                  implies(it.secondary != null, it.secondary && stage.secondary_stats.includes(it.secondary)),
                  implies(it.skill != null, it.skill && stage.skill_stats.includes(it.skill)),
                ].every((it) => it)).map((it) => (
                  <button key={it.id} className='relative flex items-center h-4 px-2 rounded-full text-xs transition bg-gray-50 shadow-sm hover:shadow-md hover:brightness-90' tabIndex={open === count ? 0 : -1}>{lang.energy_alluviums[it.id]}</button>
                ))}
              </div>
            </div>
          </div>
        </details>
      })}

      <div className={`col-span-full transition-details duration-500 ease-in-out ${open < 0 ? 'h-60' : 'h-0'} max-sm:transition-none`} />
    </div>
  </main>
}
