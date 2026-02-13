import sync_data from "./data/sync_data.const.toml";
import static_data from "./data/static_data.const.toml";
import { z } from "zod";

const checkUnique = <T>(
  ctx: z.core.$RefinementCtx<T>,
  items: Array<{ path: PropertyKey[], value: z.core.util.Primitive }>,
) => {
  const dejavu = new Set<unknown>();
  for (const item of items) {
    if (dejavu.has(item.value)) ctx.addIssue({
      path: item.path,
      code: 'invalid_value',
      message: `duplicate id: '${String(item.value)}'`,
      values: [item.value],
    });
    dejavu.add(item.value);
  }
};

const identifier = z.string().regex(/^\p{IDS}[-\p{IDC}]*$/u);
const ids = <T extends string>(ids: readonly { id: T }[]) => (
  z.looseObject({ id: identifier.and(z.enum(ids.map((it) => it.id))) })
    .transform((item) => item.id).array()
    .superRefine((items, ctx) => {
      checkUnique(ctx, items.map((item, index) => ({ path: [index, "id"], value: item })));
    })
    .transform((ids) => {
      const $z = z.literal(ids);
      const it = ids as (typeof ids & { $z: typeof $z });
      it.$z = $z;
      return it;
    })
);

export const databaseIds = z.strictObject({
  stats: z.strictObject({
    attribute: ids(static_data.stats.attribute),
    secondary: ids(static_data.stats.secondary),
    skill: ids(static_data.stats.skill),
  }).superRefine((stats, ctx) => {
    checkUnique(ctx, Object.entries(stats).flatMap(([category, items]) => (
      items.map((item, index) => ({ path: [category, index, "id"], value: item }))
    )));
  }),
  energy_alluviums: ids(static_data.energy_alluviums),
  weapons: ids(sync_data.weapons),
  operators: ids(sync_data.operators),
  elements: ids(static_data.elements),
  operator_classes: ids(static_data.operator_classes),
  weapon_types: ids(static_data.weapon_types),
});

export const database = (ids: z.infer<typeof databaseIds>) => z.strictObject({
  stats: z.strictObject({
    attribute: z.strictObject({ id: ids.stats.attribute.$z }).array(),
    secondary: z.strictObject({ id: ids.stats.secondary.$z }).array(),
    skill: z.strictObject({ id: ids.stats.skill.$z }).array(),
  }),
  energy_alluviums: z.strictObject({
    id: ids.energy_alluviums.$z,
    attribute_stats: ids.stats.attribute.$z.array().length(5),
    secondary_stats: ids.stats.secondary.$z.array().length(8),
    skill_stats: ids.stats.skill.$z.array().length(8),
  }).array(),
  weapons: z.strictObject({
    id: ids.weapons.$z,
    rarity: z.literal([3, 4, 5, 6]),
    type: ids.weapon_types.$z,
    attribute: ids.stats.attribute.$z.optional(),
    secondary: ids.stats.secondary.$z.optional(),
    skill: ids.stats.skill.$z.optional(),
  }).array(),
  operators: z.looseObject({ id: ids.operators.$z }).array(),
  elements: z.strictObject({ id: ids.elements.$z, icon: z.string() }).array(),
  operator_classes: z.strictObject({ id: ids.operator_classes.$z, icon: z.string() }).array(),
  weapon_types: z.strictObject({ id: ids.weapon_types.$z, icon: z.string() }).array(),
});

const merged_data = { ...sync_data, ...static_data };
export const id = databaseIds.parse(merged_data);
export const data = database(id).parse(merged_data);

data.weapons

// export const data = { ...sync_data, ...static_data }
