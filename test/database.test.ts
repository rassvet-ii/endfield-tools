import { expect, test } from "bun:test";
import sync_data from "@/pages/data/sync_data.const.toml";
import static_data from "@/pages/data/static_data.const.toml";
import { databaseIds, database } from "@/pages/data/database"

const merged_data = { ...sync_data, ...static_data };

test("check database id uniqueness", () => {
  expect(databaseIds.safeParse(merged_data, { reportInput: true }))
    .toSatisfy((result) => result.success);
});
test("check database integrity and schema", () => {
  const ids = databaseIds.parse(merged_data, { reportInput: true });
  expect(database(ids).safeParse(merged_data, { reportInput: true, }))
    .toSatisfy((result) => result.success);
});
