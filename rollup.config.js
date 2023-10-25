import typescript from 'rollup-plugin-typescript2';

const mode = process.env.MODE;
const isProd = mode === 'prod';

export default {
  input: `src/route.ts`,
  output: [
    {
      file: 'dist/route.esm.js',
      format: 'es',
      sourcemap: !isProd
    }
  ],
  plugins: [typescript({
    useTsconfigDeclarationDir: true,
    tsconfigOverride: { compilerOptions: { sourceMap: !isProd } }
  })],
};