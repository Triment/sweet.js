import assert from 'assert';
import { existsSync } from 'fs';
import fs from 'node:fs';
import { join, resolve } from 'path';

let entrypoints = [];

//遍历文件夹
const basePath = './pages'
const pages = resolve(basePath);//entrypoint dir
let deque: string[] = [];

//first push to stack
for (const target of fs.readdirSync(pages)){
  if(fs.statSync(join(pages, target)).isDirectory()) deque.unshift(target);
  /^\S+\.(tsx|ts)$/.test(target) && entrypoints.push(join(basePath, target));
}


//优化：将文件单独导出，只在栈中存文件夹
//1、将pages所有文件都导出
//2、将所有文件夹放进栈
//3、开始取第一个，执行1 执行2，执行3

while(!!deque.length){
  let currentFile = deque.shift()!;
  for (const target of fs.readdirSync(join(pages, currentFile as any))) {
    if(fs.statSync(join(pages, currentFile, target)).isDirectory()){
      deque.unshift(join(currentFile, target));
    } else {
      /^\S+\.(tsx|ts)$/.test(target) && entrypoints.push(join(basePath, currentFile, target));
    }
  }
}
// do {
//   let currentFile = deque.shift()!;
//   assert(existsSync(join(pages, currentFile)));
//   if(fs.statSync(join(pages, currentFile)).isDirectory()){
//     for (const target of fs.readdirSync(join(pages, currentFile as any))) {
//       /^\S+\.(tsx|ts)$/.test(target) && entrypoints.push(join(currentFile, target));
//       fs.statSync(join(pages, currentFile, target)).isDirectory() && deque.unshift(join(currentFile, target));
//     }
//     continue;
//   } else {
//     if(/^\S+\.(tsx|ts)$/.test(currentFile)){
//       entrypoints.push(currentFile);
//     }
//   }
// } while (!!deque.length);



Bun.build({
  entrypoints,
  outdir: 'dist',
  sourcemap: 'external',
  splitting: true,
  external: ['preact'],
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true
  }
})
