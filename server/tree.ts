class Node {
    path: string = ""
    indices:   string=""
	wildChild: Boolean = false
	nType:     number = 0
	priority:  number = 0
	children:  Node[] = []
	handle:    (req: Request)=>Response = (req) => new Response()

    incrementChildPrio(pos: number) {
		let cs = this.children;
		cs[pos].priority++;
		let prio = cs[pos].priority;

	// Adjust position (move to front)
		let newPos = pos;
		while(newPos > 0 && cs[newPos-1].priority < prio) {//子节点从小到大排序
			// Swap node positions
			[cs[newPos-1], cs[newPos]] = [cs[newPos], cs[newPos-1]];
			newPos--;
		}

	// Build new index char string 索引
	if (newPos != pos) {
		this.indices = this.indices.slice(0, newPos) + // Unchanged prefix, might be empty
			this.indices.slice(pos, pos+1) + // The index char we move
			this.indices.slice(newPos, pos) + this.indices.slice(pos+1) // Rest without char at 'pos'
	}

	return newPos
	}
}