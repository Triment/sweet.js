type Node = {
    children: Record<string, Node>,
    part: string,
    wildChild: Boolean,
    fullPath?: string
}

function insertNode(node: Node, path: string){
    let target = Object.assign({}, node);
    const parts = path.split('/').slice(1);
    for (const part of parts) {
        let child = node.children[part];
        if(child){
            target = child;
        } else {
            target = target.children[part] = {
                children: {},
                part,
                wildChild: false
            }
        }
    }
    target.fullPath = path;
    target.wildChild = true;
}

function searchNode(node: Node, path: string){
    const parts = path.split('/').slice(1);
    let current = node;
    let index = 0;
    while(index < parts.length){
        let child = current.children[parts[index]];
        if(!child){
            return null;
        }
        current = child;
        index++;
    }
    return current;
}

export { Node, insertNode, searchNode }