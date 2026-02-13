/* eslint-disable @typescript-eslint/no-unused-vars */

import * as TOML from "smol-toml";
import { z } from "zod";
import config from "./sync_config.const.toml";
import { fetch } from "bun";

const fetch0 = async <T extends z.ZodType>(type: string, scheme: T) => {
  const res = await fetch(`https://api.dotgg.gg/cgfw/getgacha?game=endfield&type=${type}`);
  const json = await res.json();
  return await scheme.parseAsync(json, { reportInput: true });
};

const kebabcase = (s: string) => s.toLowerCase().replaceAll(/[-_\s]/gm, "-");

const skill = z.object({
  id: z.string(),
  name: z.string(),
}).transform(({ id, name }, ctx) => {
  let match: RegExpMatchArray | null;
  const [key, ret] = (/^sk_wpn_/.test(id))
    ? ['skill', name.split(":")[0]] as const
    : ((match = id.match(/^wpn_attr_(.+)_(?:low|mid|high)$/)) != null)
    ? ['attribute', (config.attribute as Record<string, string>)[match[1]]] as const
    : ((match = id.match(/^wpn_sp_attr_(.+)_(?:low|mid|high)$/)) != null)
    ? ['secondary', (config.secondary as Record<string, string>)[match[1]]] as const
    : [null, null];

  if (key == null) {
    ctx.addIssue({ code: 'invalid_value', input: { id, name }, values: [] });
    return null
  }

  return [key, ret && kebabcase(ret)] as const;
});

const [weapons, characters] = await Promise.all([
  fetch0("weapons", z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    rarity: z.coerce.number(),
    weaponTypeName: z.string(),
    iconId: z.string(),
    skills: skill.array().transform((it) => Object.fromEntries(it.filter((it) => it != null))),
    recommendedCharacters: z.string().array(),
    slug: z.string(),
  }).array()),
  fetch0("characters", z.object({
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
  }).array()),
]);

await Bun.write(
  "src/data/sync_data.const.toml",
  TOML.stringify({
    weapons: weapons.map(({
      name,
      rarity,
      weaponTypeName,
      iconId,
      skills,
      recommendedCharacters,
      slug,
    }) => ({
      id: slug,
      // name,
      rarity,
      type: kebabcase(weaponTypeName),
      ...skills,
      // recommended: recommendedCharacters.map((id) => (
      //   id == 'chr_9000_endmin' ? 'the_endministrator'
      //     : snakecase(characters.find((it) => it.id == id)?.slug ?? id)
      // )),
      // icon: iconId,
    })),
    operators: characters.map(({
      codename,
      rarity,
      profession,
      elementId,
      faction,
      iconId,
      weaponTypeName,
      slug,
    }) => ({
      id: slug,
      // name: codename,
      rarity,
      type: weaponTypeName,
      profession: kebabcase(profession),
      element: elementId,
      faction: kebabcase(faction),
      // icon: iconId,
    })),
  }),
);

await Promise.all(weapons.map(async (it) => {
  const file = Bun.file(`public/endfield-res/weapons/${it.slug}.webp`);
  if (await file.exists()) return;
  const res = await fetch(`https://static.dotgg.gg/endfield/item/${it.iconId}.webp`);
  if (!res.ok) return console.warn(it)
  await file.write(res)
}))
