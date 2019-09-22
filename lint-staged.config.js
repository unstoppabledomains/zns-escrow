module.exports = {
  '**/*.{md,ts,json}': ['prettier --write', 'git add'],
  '**/*.ts?(x)': () => 'tsc -p tsconfig.json --noEmit',
}
