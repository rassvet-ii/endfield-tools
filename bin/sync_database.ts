import { fetch } from 'bun';
import * as TOML from 'smol-toml';
import { z } from 'zod';
import config from './sync_config.const.toml';

const fetch0 = async <T extends z.ZodType>(type: string, scheme: T) => {
  const res = await fetch(`https://api.dotgg.gg/cgfw/getgacha?game=endfield&type=${type}`);
  const json = await res.json();
  return await scheme.parseAsync(json, { reportInput: true });
};

const kebabcase = (s: string) => s.toLowerCase().replaceAll(/[-_\s]/gm, '-');

const parseSkill = ({ id, name }: { id: string; name: string }) => {
  if (/^sk_wpn_/.test(id)) {
    return ['skill', name.split(':')[0]] as const;
  }

  const match1 = id.match(/^wpn_attr_(.+)_(?:low|mid|high)$/);
  if (match1 != null) {
    return ['attribute', (config.attribute as Record<string, string>)[match1[1]]] as const;
  }

  const match2 = id.match(/^wpn_sp_attr_(.+)_(?:low|mid|high)$/);
  if (match2 != null) {
    return ['secondary', (config.secondary as Record<string, string>)[match2[1]]] as const;
  }

  return [null, null] as const;
};

const skill = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .transform((input, ctx) => {
    const [key, ret] = parseSkill(input);

    if (key == null) {
      ctx.addIssue({ code: 'invalid_value', input, values: [] });
      return null;
    }

    return [key, ret && kebabcase(ret)] as const;
  });

const $weapon = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  rarity: z.coerce.number(),
  weaponTypeName: z.string(),
  iconId: z.string(),
  skills: skill.array().transform((it) => Object.fromEntries(it.filter((it) => it != null))),
  recommendedCharacters: z.string().array(),
  slug: z.string(),
});

const $character = z.object({
  id: z.string(),
  codename: z.string(),
  description: z.string(),
  rarity: z.coerce.number(),
  profession: z.string(),
  elementId: z.string(),
  faction: z.string(),
  iconId: z.string(),
  weaponTypeName: z.string(),
  slug: z.string(),
});

const [weapons, characters] = await Promise.all([
  fetch0('weapons', $weapon.array()),
  fetch0('characters', $character.array()),
]);

await Bun.write(
  'src/data/sync_data.const.toml',
  TOML.stringify({
    weapons: weapons.map(({ rarity, weaponTypeName, skills, slug }) => ({
      id: slug,
      rarity,
      type: kebabcase(weaponTypeName),
      ...skills,
    })),
    operators: characters.map(
      ({ rarity, profession, elementId, faction, weaponTypeName, slug }) => ({
        id: slug,
        rarity,
        type: weaponTypeName,
        profession: kebabcase(profession),
        element: elementId,
        faction: kebabcase(faction),
      }),
    ),
  }),
);

await Promise.all(
  weapons.map(async (it) => {
    const file = Bun.file(`public/endfield-res/weapons/${it.slug}.webp`);
    if (await file.exists()) return;
    const res = await fetch(`https://static.dotgg.gg/endfield/item/${it.iconId}.webp`);
    if (!res.ok) return console.warn(it);
    await file.write(res);
  }),
);
