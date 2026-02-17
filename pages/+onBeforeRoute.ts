// https://vike.dev/onBeforeRoute

import type { PageContext, PageContextServer } from "vike/types";

export function onBeforeRoute(pageContext: PageContextServer) {
  // pageContext.

  return {
    pageContext: {

    } satisfies Partial<PageContext>
  };
}
