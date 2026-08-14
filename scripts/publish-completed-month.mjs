#!/usr/bin/env node

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function formatMonth(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function previousUtcMonth(date) {
  return formatMonth(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1)));
}

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index++) {
    if (argv[index] === '--month') args.month = argv[++index];
    else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  return args;
}

function monthLabel(yyyyMm) {
  return new Date(`${yyyyMm}-01T00:00:00.000Z`).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function countCsvRows(csvPath) {
  const csv = fs.readFileSync(csvPath, 'utf8');
  const lineCount = csv.split('\n').length - (csv.endsWith('\n') ? 1 : 0);
  return lineCount - 1;
}

function updateOpenDataPage(marketMonth, count) {
  const pagePath = path.join(process.cwd(), 'src', 'app', 'open-data', 'page.tsx');
  const source = fs.readFileSync(pagePath, 'utf8');
  const entry = `  { month: '${monthLabel(marketMonth)}', file: '${marketMonth}.csv', count: ${count} },`;
  const existingEntry = new RegExp(
    `^  \\{ month: '[^']+', file: '${marketMonth}\\.csv', count: \\d+ \\},$`,
    'm'
  );

  let updated;
  if (existingEntry.test(source)) {
    updated = source.replace(existingEntry, entry);
  } else {
    const marker = 'const monthlyData = [\n';
    if (!source.includes(marker)) throw new Error('Could not find monthlyData in open-data page');
    updated = source.replace(marker, `${marker}${entry}\n`);
  }

  fs.writeFileSync(pagePath, updated);
}

const args = parseArgs(process.argv);
const now = new Date();
const marketMonth = args.month || previousUtcMonth(now);

if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(marketMonth)) {
  throw new Error(`Invalid month: ${marketMonth}`);
}

const currentUtcMonth = formatMonth(now);
if (marketMonth >= currentUtcMonth) {
  throw new Error(`Refusing to publish incomplete month ${marketMonth}; current UTC month is ${currentUtcMonth}`);
}

execFileSync(
  process.execPath,
  ['scripts/generate-month-assets.mjs', '--market-month', marketMonth, '--data-only'],
  { cwd: process.cwd(), env: process.env, stdio: 'inherit' }
);

const csvPath = path.join(process.cwd(), 'public', 'data', `${marketMonth}.csv`);
const listingCount = countCsvRows(csvPath);
updateOpenDataPage(marketMonth, listingCount);

console.log(`Prepared ${monthLabel(marketMonth)} with ${listingCount.toLocaleString()} listings`);
