#!/usr/bin/env node

const madge = require('madge');

const config = {
  fileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  tsConfig: './tsconfig.json',
};

madge('./src', config).then((res) => {
  const circleDeps = res.circular();
  console.log(`Found ${circleDeps.length} circular dependencies:`);
  console.log(res.circular());
});
