import { join } from "path";

function getExt(path: string){
    let idx = path.length-1;
    let ext = [];
    while(idx>=1){
        if(path[idx]=='.') break;
        ext.unshift(path[idx]);
        idx--;
        continue;
    }
    return ext.join('').toLowerCase()
}

const ContentType: Record<string, string> = {
    "js": "text/javascript",
    "css": "text/css",
    "txt": "text/plain",
    "png": "image/png",
    "jpg": "image/jpeg",
    "html": "text/html"
}

function parseContentType(ext: string){
    let cType = ContentType[ext];
    if(!cType) {
        cType = "application/octet-stream";
    }
    return cType;
}

const assetsDir = "dist";

Bun.serve({
    port: 3000,
    fetch(req) {
        const notFound = new Response("Not Found");
        const url = new URL(req.url);
        if(url.pathname.startsWith('/assets/')){
            const filePath = url.pathname.split('/assets/')[1];
            let ext = getExt(filePath);
            return new Response(Bun.file(join(assetsDir, filePath)), {
                headers: {
                    "Content-Type": parseContentType(ext)
                }
            });
        }
        return notFound
    },
})