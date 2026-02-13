import { data } from '../database'
import { useForm, useWatch } from 'react-hook-form'
import lang from '../data/ja.const.toml'

import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/energy-alluviums')({
  component: EnergyAlluviums,
})

export default function EnergyAlluviums() {
  const { register, control, reset } = useForm({
    defaultValues: {
      attribute: Object.fromEntries(data.stats.attribute.map((stat) => [stat.id, false])),
      secondary: Object.fromEntries(data.stats.secondary.map((stat) => [stat.id, false])),
      skill: Object.fromEntries(data.stats.skill.map((stat) => [stat.id, false])),
    }
  })
  const valeus = useWatch({ control })
  const attribute_stats = Object.entries(valeus.attribute || {}).filter(([, value]) => value).map(([key]) => key)
  const secondary_stats = Object.entries(valeus.secondary || {}).filter(([, value]) => value).map(([key]) => key)
  const skill_stats = Object.entries(valeus.skill || {}).filter(([, value]) => value).map(([key]) => key)
  const code = Object.entries({ attribute_stats, secondary_stats, skill_stats })
    .map(([key, stats]) => `${key} = [${stats.map((s) => `'${s}'`).join(`, `)}]`)
    .join('\n')

  return (
    <main className='mx-auto max-w-xl h-dvh py-8'>
      <div className='flex flex-wrap gap-x-2 w-full items-center'>
        {data.stats.attribute.map((stat) => (
          <label key={stat.id} className='flex gap-0.5 items-center'>
            <input type='checkbox' value={stat.id} {...register(`attribute.${stat.id}`)} />
            {lang.stats[stat.id]}
          </label>
        ))}
        <div className='text-sm opacity-80'>{attribute_stats.length}/5</div>
      </div>
      <hr className='my-4' />
      <div className='flex flex-wrap gap-x-2 w-full items-center'>
        {data.stats.secondary.map((stat) => (
          <label key={stat.id} className='flex gap-0.5 items-center'>
            <input type='checkbox' value={stat.id} {...register(`secondary.${stat.id}`)} />
            {lang.stats[stat.id]}
          </label>
        ))}
        <div className='text-sm opacity-80'>{secondary_stats.length}/8</div>
      </div>
      <hr className='my-4' />
      <div className='flex flex-wrap gap-x-2 w-full items-center'>
        {data.stats.skill.map((stat) => (
          <label key={stat.id} className='flex gap-0.5 items-center'>
            <input type='checkbox' value={stat.id} {...register(`skill.${stat.id}`)} />
            {lang.stats[stat.id]}
          </label>
        ))}
        <div className='text-sm opacity-80'>{skill_stats.length}/8</div>
      </div>
      <hr className='my-4' />
      <pre className='whitespace-pre-line text-sm'>
        <code>
          {code}
        </code>
      </pre>
      <hr className='my-4' />
      <button onClick={() => navigator.clipboard.writeText(code)}>copy</button>
      <button onClick={() => reset()}>reset</button>

      <hr className='my-4' />
      {data.energy_alluviums.map((it) => <div key={it.id} className='my-2'>
        <div className='flex flex-wrap gap-x-2'>
          {it.attribute_stats.map((it) => <span key={it}>{lang.stats[it]}</span>)}
        </div>
        <div className='flex flex-wrap gap-x-2'>
        {it.secondary_stats.map((it) => <span key={it}>{lang.stats[it]}</span>)}
        </div>
        <div className='flex flex-wrap gap-x-2'>
        {it.skill_stats.map((it) => <span key={it}>{lang.stats[it]}</span>)}
        </div>
      </div>)}
    </main>
  )
}
