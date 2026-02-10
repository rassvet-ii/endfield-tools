import { expect, test } from "bun:test";
import sync_data from "../public/sync_data.const.toml";
import static_data from "../public/static_data.const.toml";
import { databaseIds, database } from "../src/database"

const data = { ...sync_data, ...static_data }

test("check database id uniqueness", () => {
  expect(databaseIds.safeParse(data, { reportInput: true }))
    .toSatisfy((result) => result.success);
});
test("check database integrity and schema", () => {
  const ids = databaseIds.parse(data, { reportInput: true });
  expect(database(ids).safeParse(data, { reportInput: true, }))
    .toSatisfy((result) => result.success);
});
