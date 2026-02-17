import { z } from 'zod';
import star from '@/assets/endfield-res/star.png';
import { id } from '@/src/data';

const extractingTemplateLiteral = <L extends string>(
  pre: string,
  mid: z.core.$ZodLiteral<L> & { _zod: z.core.$ZodLiteralInternals },
  post: string,
  params?: string | z.core.$ZodTemplateLiteralParams,
): z.ZodType<L> =>
  z
    .templateLiteral([pre, mid, post], params)
    .transform((it) => it.substring(pre.length, it.length - post.length))
    .pipe(mid);

export const $weapons_img = z.record(
  extractingTemplateLiteral('/assets/endfield-res/weapons/', id.weapons.$z, '.webp'),
  z.string(),
);

export const img = {
  star: star,
  weapons: $weapons_img.parse(
    import.meta.glob(`/assets/endfield-res/weapons/*.webp`, { eager: true, import: 'default' }),
    { reportInput: true },
  ),
};
