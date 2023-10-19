import assert from "assert";

// nodeType
enum NodeType {
	ITOA = 0,
	ROOT,
	PARAM,
	CATCHALL
}


//最长公共前缀个数
export function longestCommonPrefix(a: string, b: string): number {
	let i = 0;
	let max = Math.min(a.length, b.length);
	while (i < max && a[i] == b[i]) {
		i++;
	}
	return i;
}


export function findWildcard(path: string) {
	for (let start = 0; start < path.length; start++) {
		if (path[start] != ':' && path[start] != '*') continue;
		let valid = true;
		const paramStr = path.slice(start + 1);
		for (let end = 0; end < paramStr.length; end++) {
			switch (paramStr[end]) {
				case '/':
					return { wildCard: path.slice(start, start + 1 + end), index: start, valid };
				case ':':
				case '*':
					valid = false;
			}
		}
		return { wildCard: path.slice(start), index: start, valid };
	}
	return { wildCard: "", index: -1, valid: false };
}

export function countParams(path: string): number {
	let n = 0;
	for (const c of path) {
		switch (c) {
			case ':':
			case '*':
				n++;
		}
	}
	return n;
}

class Node {
	path: string = ""
	indices: string = ""
	wildChild: Boolean = false
	nType: NodeType = 0
	priority: number = 0
	children: Node[] = []
	handle: (req: Request) => Response = (req) => new Response()

	constructor(
		{
			path,
			indices,
			wildChild,
			nType,
			priority,
			children,
			handle
		}:{
				path?: string,
				indices?: string,
				wildChild?: Boolean,
				nType?: NodeType,
				priority?: number,
				children?: Node[],
				handle?: (req: Request) => Response
			}) {
		path && (this.path = path);
		indices && (this.indices = indices);
		wildChild && (this.wildChild = wildChild);
		nType && (this.nType = nType);
		priority && (this.priority = priority);
		children && (this.children = children);
		handle && (this.handle = handle);

	}

	incrementChildPrio(pos: number) {
		let cs = this.children;
		cs[pos].priority++;
		let prio = cs[pos].priority;

		// Adjust position (move to front)
		let newPos = pos;
		while (newPos > 0 && cs[newPos - 1].priority < prio) {//子节点从小到大排序
			// Swap node positions
			[cs[newPos - 1], cs[newPos]] = [cs[newPos], cs[newPos - 1]];
			newPos--;
		}

		// Build new index char string 索引
		if (newPos != pos) {
			this.indices = this.indices.slice(0, newPos) + // Unchanged prefix, might be empty
				this.indices.slice(pos, pos + 1) + // The index char we move
				this.indices.slice(newPos, pos) + this.indices.slice(pos + 1) // Rest without char at 'pos'
		}

		return newPos
	}

	insertChild(path: string, fullPath: string, handle: (req: Request) => Response) {
		while (1) {
			const { wildCard, index, valid } = findWildcard(path);
			if (index < 0) {
				break;
			}
			assert(valid, `only one wildcard per path segment is allowed, has: '${wildCard}' in path '${fullPath}'`);
			assert(wildCard.length >= 2, `wildcards must be named with a non-empty name in path '${fullPath}'`);
			assert(this.children.length > 0, `wildcard segment '${wildCard}' conflicts with existing children in path '${fullPath}'`);
			if (wildCard[0] == ':') {//
				if (index > 0) {
					// Insert prefix before the current wildcard
					this.path = path.slice(0, index);
					path = path.slice(index);
				}
				this.wildChild = true;
				let child = new Node({path: wildCard, nType: NodeType.PARAM });
				this.children = [child]
			}
		}
	}
}