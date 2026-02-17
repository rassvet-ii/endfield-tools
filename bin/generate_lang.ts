import * as TOML from 'smol-toml';
import { data } from '@/src/data';

const lang = {
  stats: [
    ...data.stats.attribute.map((it) => it.id),
    ...data.stats.secondary.map((it) => it.id),
    ...data.stats.skill.map((it) => it.id),
  ],
  weapons: [...data.weapons.map((it) => it.id)],
} satisfies Record<string, string[]>;

for (const keys of Object.values(lang)) {
  console.assert(keys.length === new Set(keys).size);
}

await Bun.write(
  'src/data/lang.const.toml',
  TOML.stringify(
    Object.fromEntries(
      Object.entries(lang).map(([ns, keys]) => [
        ns,
        Object.fromEntries(keys.map((key) => [key, ''] as const)),
      ]),
    ),
  ),
);
