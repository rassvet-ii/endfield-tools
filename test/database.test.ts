import { expect, test } from 'bun:test';
import { $database, $ids } from '@/src/data';
import static_data from '@/src/static_data.const.toml';
import sync_data from '@/src/sync_data.const.toml';

const merged_data = { ...sync_data, ...static_data };

test('check database id uniqueness', () => {
  expect($ids.safeParse(merged_data, { reportInput: true })).toSatisfy((result) => result.success);
});

test('check database integrity and schema', () => {
  const ids = $ids.parse(merged_data, { reportInput: true });
  expect($database(ids).safeParse(merged_data, { reportInput: true })).toSatisfy(
    (result) => result.success,
  );
});
