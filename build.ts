import fs from 'fs'
import { resolve } from 'path'
//遍历文件夹
console.log(fs.readdirSync(resolve('./pages')))
for (const target of fs.readdirSync(resolve('./pages'))){
  console.log(target)
}


Bun.build({
  entrypoints: ['./pages/test/a','./pages'],
  outdir: 'dist',
  sourcemap: 'external',
  splitting: true,
  external: ['preact']
})
