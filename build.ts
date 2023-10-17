import fs from 'node:fs';
import { join, resolve } from 'path';

let entrypoints = [];//遍历保存的结果数组

const basePath = './pages'
const prefix = basePath//添加到结果的前缀，遍历的结果是相对路径，这个前缀会拼接到相对路径前面
const pages = resolve(basePath);//要遍历的文件夹
let stack: string[] = [];//保存遍历文件夹的栈

for (const target of fs.readdirSync(pages)){
  if(fs.statSync(join(pages, target)).isDirectory()) stack.unshift(target);//如果是文件夹就放进栈
  /^\S+\.(tsx|ts)$/.test(target) && entrypoints.push(join(prefix, target));//匹配tsx｜ts为后缀的文件，并保存结果
}
while(!!stack.length){
  let currentFile = stack.shift()!;
  for (const target of fs.readdirSync(join(pages, currentFile as any))) {
    if(fs.statSync(join(pages, currentFile, target)).isDirectory()){//如果是文件夹就放进栈
      stack.unshift(join(currentFile, target));
    } else {
      /^\S+\.(tsx|ts)$/.test(target) && entrypoints.push(join(prefix, currentFile, target));//匹配tsx｜ts为后缀的文件，并保存结果
    }
  }
}

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
