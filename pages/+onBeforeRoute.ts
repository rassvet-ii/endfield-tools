// https://vike.dev/onBeforeRoute

import type { PageContext, PageContextServer } from 'vike/types';

export function onBeforeRoute(_pageContext: PageContextServer) {
  // pageContext.

  return {
    pageContext: {} satisfies Partial<PageContext>,
  };
}
