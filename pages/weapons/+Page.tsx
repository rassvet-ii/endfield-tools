import { clsx } from 'clsx';
import { Fragment, type ReactNode, useEffect, useReducer, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { data, id } from '@/pages/data/database';
import lang from '../data/ja.const.toml';

export default function RouteComponent() {
  const [{ columns }, setSizes] = useState({ columns: 6 });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const listener = () => {
      if (ref.current == null) return;

      const columns = window
        .getComputedStyle(ref.current)
        .getPropertyValue('grid-template-columns')
        .split(' ').length;
      setSizes({ columns });
    };

    listener();
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, []);

  const [open, toggle] = useReducer(
    (prev: number, [mode, index]: ['toggle' | 'open' | 'closed', number]) => {
      if (mode === 'open') return index;
      if (mode === 'closed') return prev === index ? -1 : prev;
      return index !== prev ? index : -1;
    },
    -1,
  );
  const someOpen = open >= 0;
  const [activeX, activeY] = someOpen
    ? [Math.floor(open % columns), Math.floor(open / columns)]
    : [-1, -1];

  interface FilterOptions {
    rarity: Record<'3' | '4' | '5' | '6', boolean>;
    attribute: Record<(typeof id.stats.attribute)[number], boolean>;
    secondary: Record<(typeof id.stats.secondary)[number], boolean>;
    skill: Record<(typeof id.stats.skill)[number], boolean>;
    stage: Record<(typeof id.energy_alluviums)[number], boolean>;
  }
  const { register, control } = useForm<FilterOptions>({
    defaultValues: {
      rarity: { '3': false, '4': false, '5': false, '6': false },
      attribute: Object.fromEntries(id.stats.attribute.map((it) => [it, false])),
      secondary: Object.fromEntries(id.stats.secondary.map((it) => [it, false])),
      skill: Object.fromEntries(id.stats.skill.map((it) => [it, false])),
      stage: Object.fromEntries(id.energy_alluviums.map((it) => [it, false])),
    },
    resetOptions: {
      keepDefaultValues: true,
    },
  });

  const filter = useWatch({ control });
  const implies = (cond: unknown, value: unknown) => !cond || !!value;
  const some = (values: Record<string, unknown>) => Object.values(values).some((it) => it);
  const every = (args: unknown[]) => args.every((it) => it);
  const checkEnergyAlluviums = (
    item: (typeof data.weapons)[number],
    alluvium: (typeof data.energy_alluviums)[number],
  ) =>
    every([
      implies(item.attribute, item.attribute && alluvium.attribute_stats.includes(item.attribute)),
      implies(item.secondary, item.secondary && alluvium.secondary_stats.includes(item.secondary)),
      implies(item.skill, item.skill && alluvium.skill_stats.includes(item.skill)),
    ]);

  const $filter =
    ({
      rarity = {},
      attribute = {},
      secondary = {},
      skill = {},
      stage = {},
    }: {
      [key in keyof FilterOptions]?: Partial<FilterOptions[key]>;
    }) =>
    (item: (typeof data.weapons)[number]) =>
      every([
        implies(some(rarity), item.rarity && rarity[item.rarity]),
        implies(some(attribute), item.attribute && attribute[item.attribute]),
        implies(some(secondary), item.secondary && secondary[item.secondary]),
        implies(some(skill), item.skill && skill[item.skill]),
        implies(
          some(stage),
          data.energy_alluviums
            .filter((it) => stage[it.id])
            .some((stage) => checkEnergyAlluviums(item, stage)),
        ),
      ]);

  const s = <img src='/endfield-res/star.png' alt='star' className='h-3 -translate-x-px' />;
  const stars = {
    // biome-ignore lint/suspicious/noArrayIndexKey: reason
    3: Array.from({ length: 3 }, (_, i) => <Fragment key={i}>{s}</Fragment>),
    // biome-ignore lint/suspicious/noArrayIndexKey: reason
    4: Array.from({ length: 4 }, (_, i) => <Fragment key={i}>{s}</Fragment>),
    // biome-ignore lint/suspicious/noArrayIndexKey: reason
    5: Array.from({ length: 5 }, (_, i) => <Fragment key={i}>{s}</Fragment>),
    // biome-ignore lint/suspicious/noArrayIndexKey: reason
    6: Array.from({ length: 6 }, (_, i) => <Fragment key={i}>{s}</Fragment>),
  } as const;

  type FilterSet<C extends Exclude<keyof FilterOptions, symbol>> = {
    category: Exclude<C, symbol>;
    values: Exclude<keyof FilterOptions[C], symbol>[];
    labels: Record<keyof FilterOptions[C], ReactNode>;
  };

  const filterSet = <C extends keyof FilterOptions>(set: FilterSet<C>) => ({
    category: set.category,
    options: set.values.map(
      (it) =>
        ({
          key: `${set.category}.${it}`,
          label: set.labels[it],
          count: data.weapons.filter($filter({ ...filter, [set.category]: { [it]: true } })).length,
        }) as const,
    ),
  });

  const filters = [
    filterSet({ category: 'stage', values: id.energy_alluviums, labels: lang.energy_alluviums }),
    filterSet({ category: 'rarity', values: ['3', '4', '5', '6'], labels: stars }),
    filterSet({ category: 'attribute', values: id.stats.attribute, labels: lang.stats }),
    filterSet({ category: 'secondary', values: id.stats.secondary, labels: lang.stats }),
    filterSet({ category: 'skill', values: id.stats.skill, labels: lang.stats }),
  ].map(({ category, options: items }) => (
    <div
      key={category}
      className='flex flex-row flex-wrap gap-2 text-xs leading-none px-2 py-2 bg-gray-200 even:bg-gray-300'>
      {items.map(({ key, label, count }) => (
        <label
          key={key}
          className={clsx(
            `relative flex items-center h-4 px-2 rounded-full text-xs transition bg-gray-50 has-checked:bg-endfield shadow-sm hover:shadow-md hover:brightness-90`,
            count <= 0 && 'bg-gray-200 text-gray-500',
          )}>
          <input
            type='checkbox'
            {...register(key, { onChange: () => toggle(['open', -1]) })}
            className='absolute appearance-none inset-0 rounded-full'
          />
          {label}
          <div className='pl-1 ml-1 border-l border-gray-400'>{count}</div>
        </label>
      ))}
    </div>
  ));

  let count = 0;
  const weapons = data.weapons.map((it) => {
    const visible = $filter(filter)(it);
    const index = visible ? count++ : count;

    const [x, y] = [Math.floor(index % columns), Math.floor(index / columns)];

    const slide = clsx(
      open !== index && {
        '-translate-y-24': open < 0 || y !== activeY,
        '-translate-x-80': y === activeY && x < activeX,
        'translate-x-80': y === activeY && x > activeX,
      },
    );

    const color = clsx({
      'border-rarity-3 inset-shadow-rarity-3': it.rarity === 3,
      'border-rarity-4 inset-shadow-rarity-4': it.rarity === 4,
      'border-rarity-5 inset-shadow-rarity-5': it.rarity === 5,
      'border-rarity-6 inset-shadow-rarity-6': it.rarity === 6,
    });

    const bg_color = clsx({
      'bg-rarity-3': it.rarity === 3,
      'bg-rarity-4': it.rarity === 4,
      'bg-rarity-5': it.rarity === 5,
      'bg-rarity-6': it.rarity === 6,
    });

    const summary = (
      <summary className='aspect-square rounded-sm overflow-hidden grid *:area-1/1'>
        <div
          className={`size-full bg-gray-900 stripe-gray-800 bg-stripe bg-size-4px/4px border-b-4 inset-shadow-[0px_-20px_20px_-20px] ${color}`}
        />
        <img
          src={`/endfield-res/weapons/${it.id}.webp`}
          alt={lang.weapons[it.id]}
          width={256}
          height={256}
          className='size-full mask-b-from-white mask-b-from-60% mask-b-to-transparent mask-b-to-85%'
        />
        <div className='max-w-full text-white place-self-center/end p-1 text-xs text-ellipsis drop-shadow-sm drop-shadow-black text-balance text-center'>
          {lang.weapons[it.id]}
        </div>
      </summary>
    );

    const largeIcon = (
      <div className='size-40 aspect-square rounded-sm overflow-hidden grid *:area-1/1'>
        <div
          className={`size-full bg-gray-900 stripe-gray-800 bg-stripe bg-size-4px/4px border-b-4 inset-shadow-[0px_-40px_40px_-40px] ${color}`}
        />
        <img
          src={`/endfield-res/weapons/${it.id}.webp`}
          alt={lang.weapons[it.id]}
          width={256}
          height={256}
          className='size-full mask-b-from-white mask-b-from-60% mask-b-to-transparent mask-b-to-85%'
        />
        <div className='text-white self-end justify-self-center p-1 drop-shadow-sm drop-shadow-black'>
          <span className='text-xs'>Lv. </span>
          {'//'}
        </div>
      </div>
    );

    const stats = (
      <div className='grid c1-auto c2-1fr c3-auto gap-x-2 rounded-xs'>
        {(['attribute', 'secondary', 'skill'] as const).map((category) => (
          <div
            key={category}
            className='col-span-3 grid grid-cols-subgrid px-2 py-1 items-center bg-gray-200 even:bg-gray-300'>
            <div className='text-xs'>{lang.ui.stats[category]}</div>
            <div className='text-sm'>
              {it[category] ? lang.stats[it[category]] : lang.ui.stats.empty}
            </div>
            <button type='button' className='chip-button' tabIndex={open === index ? 0 : -1}>
              選択
            </button>
          </div>
        ))}
      </div>
    );

    const alluviums = (
      <div className='grow flex flex-row flex-wrap gap-2 rounded-xs px-2 py-1 bg-gray-200'>
        {data.energy_alluviums
          .filter((stage) => checkEnergyAlluviums(it, stage))
          .map((it) => (
            <button
              key={it.id}
              type='button'
              className='chip-button'
              tabIndex={open === index ? 0 : -1}>
              {lang.energy_alluviums[it.id]}
            </button>
          ))}
      </div>
    );

    return (
      <details
        key={it.id}
        open={index === open}
        onToggle={(it) => toggle([it.newState, index])}
        style={{ '--row': 2 * y + 2 }}
        className={clsx(
          `group ${visible ? 'contents' : 'hidden'} details:col-span-full details:row-(--row) details:content-visibility-auto details:overflow-clip details:relative not-open:details:-z-10`,
          `details:transition-details details:duration-500 details:ease-in-out max-sm:details:transition-none`,
          open === index ? 'details:opacity-100' : 'details:opacity-0',
          y === activeY ? 'details:h-60' : 'details:h-0',
        )}>
        {summary}
        <div
          className={`max-w-md h-full mx-auto py-2 grid c1-auto c2-1fr r1-auto r2-auto r3-1fr gap-2 place-items-stretch grid-flow-dense transition duration-500 ease-in-out ${slide}`}>
          <div className='row-span-full flex flex-col'>
            <div className='comment-chip text-xs'>FIGURE</div>
            {largeIcon}
            <div className='mt-2 grow bg-stripe stripe-gray-300 bg-size-4px/4px' />
          </div>
          <div>
            <div className='comment-chip text-xs'>TITLE</div>
            <div className='px-2 py-1 flex gap-1 bg-gray-800 text-xl/none text-white rounded-xs'>
              <div className={`h-lh w-1 rounded-full ${bg_color}`} />
              <div className='-translate-y-px'>{lang.weapons[it.id]}</div>
              <div className='grow bg-stripe stripe-gray-300/20 bg-size-4px/4px' />
            </div>
          </div>
          <div>
            <div className='comment-chip text-xs'>STATS</div>
            {stats}
          </div>
          <div className='flex flex-col'>
            <div className='comment-chip text-xs'>OBTAINABLE</div>
            {alluviums}
          </div>
        </div>
      </details>
    );
  });

  return (
    <main className='flex flex-col gap-2 col-1-auto'>
      <div className='rounded-sm overflow-clip'>{filters}</div>

      <div ref={ref} className='grid grid-cols-fill-20 gap-x-1 gap-y-0.5 grid-flow-dense'>
        {weapons}

        <div
          className={`col-span-full transition-details duration-500 ease-in-out ${open < 0 ? 'h-60' : 'h-0'} max-sm:transition-none`}
        />
      </div>
    </main>
  );
}
