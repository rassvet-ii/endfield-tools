# Endfield Essence Tools

Generated with [vike.dev/new](https://vike.dev/new) ([version 581](https://www.npmjs.com/package/create-vike/v/0.0.581)) using this command:

```sh
bun create vike@latest --react --tailwindcss --biome
```

## Contents

- [Vike](#vike)
  - [Plus files](#plus-files)
  - [Routing](#routing)
  - [SSR](#ssr)
  - [HTML Streaming](#html-streaming)

## Vike

This app is ready to start. It's powered by [Vike](https://vike.dev) and [React](https://react.dev/learn).

### Plus files

[The + files are the interface](https://vike.dev/config) between Vike and your code.

- [`+config.ts`](https://vike.dev/settings) — Settings (e.g. `<title>`)
- [`+Page.tsx`](https://vike.dev/Page) — The `<Page>` component
- [`+data.ts`](https://vike.dev/data) — Fetching data (for your `<Page>` component)
- [`+Layout.tsx`](https://vike.dev/Layout) — The `<Layout>` component (wraps your `<Page>` components)
- [`+Head.tsx`](https://vike.dev/Head) - Sets `<head>` tags
- [`/pages/_error/+Page.tsx`](https://vike.dev/error-page) — The error page (rendered when an error occurs)
- [`+onPageTransitionStart.ts`](https://vike.dev/onPageTransitionStart) and `+onPageTransitionEnd.ts` — For page transition animations

### Routing

[Vike's built-in router](https://vike.dev/routing) lets you choose between:

- [Filesystem Routing](https://vike.dev/filesystem-routing) (the URL of a page is determined based on where its `+Page.jsx` file is located on the filesystem)
- [Route Strings](https://vike.dev/route-string)
- [Route Functions](https://vike.dev/route-function)

### SSR

SSR is enabled by default. You can [disable it](https://vike.dev/ssr) for all or specific pages.

### HTML Streaming

You can [enable/disable HTML streaming](https://vike.dev/stream) for all or specific pages.

## Credits

["EndfieldByButan"](https://github.com/lhclbt/Endfield_Font) by haochen luo

## License

This project is licensed under the MIT License, except for the `public/endfield-res` directory - see the LICENSE.md file for details.

## Contact

This tool is a fan-made community project. It is not affiliated with any official organization related to ‘Arknights: Endfield’ or 'GRYPHLINE'.
All trademarks, game assets, images, and intellectual property referenced on this site belong to their respective owners. If you are a rights holder with concerns regarding the content, please [contact the repository owner via issues](https://github.com/rassvet-ii/endfield-tools/issues) for prompt removal or correction.
