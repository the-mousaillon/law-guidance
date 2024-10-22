/* eslint-disable */

const SEP = " -> ";

export interface Leaf {
  type: 'leaf';
  text: string;
}

export interface Node {
  type: 'node';
  label: string;
  children: (Node | Leaf)[];
}

export function parseDAG(text: string[], recur: number=0): Node {
  if (recur > 20) {
    console.log("RECURSION LIMIT REACHED")
    throw new Error("Recursion limit reached")
  }
  console.log("TXT: ", text)
  if (text.length == 1) {
    let vals = text[0].split(SEP).map(s => s.trim())
    let leaf = { type: "leaf", text: vals[1] } as Leaf;
    let node = { type: "node", label: vals[0], children: [leaf] } as Node;
    console.log("leaf: ", node)
    return node;
  }

  let pos_sep = text[0].indexOf(SEP);
  let curr_node = { type: "node", label: text[0].slice(0, pos_sep).trim(), children: [] as (Node|Leaf)[] } as Node;
  let sublines = [] as string[]
  let i = 0;
  for (let l of text) {
    console.log("slice: ", l.slice(pos_sep, pos_sep + SEP.length))
    let l_shift = l.slice(pos_sep + SEP.length, l.length)
    if (i == 0 || l.slice(pos_sep, pos_sep + SEP.length) != SEP ){
      sublines.push(l_shift)
      //console.log("sublines: ", sublines)
    }
    else {
      let subnode = parseDAG([...sublines], recur + 1)
      curr_node.children.push(subnode)
      sublines = [l_shift]
    }
    i += 1
  }
  if (sublines.length > 0) {
    let subnode = parseDAG([...sublines], recur + 1)
    curr_node.children.push(subnode)
  }
  return curr_node
}


export function dumpDag(node: Node, root_path: string = ""): string {
  let root_path_ = root_path + node.label + SEP;
  if (node.children.length == 1 && (node.children[0] as Leaf).type == "leaf") {
    return root_path_ + (node.children[0] as Leaf).text + "\n";
  }
  let out = ""
  let i = 0
  for (let child of node.children) {
    if (i > 0) {
      root_path_ = " ".repeat(root_path_.length - SEP.length) + SEP;
    }
    out += dumpDag(child as Node, root_path_);
    i += 1
  }
  return out
}

export function dagToEcharts(node: Node): any {
  if (node.children.length == 1 && (node.children[0] as Leaf).type == "leaf") {
    return { name: node.label, collapsed: false, children: [{ name: (node.children[0] as Leaf).text, collapsed: false }] };
  }
  let root = { name: node.label, children: [] as any[], collapsed: false };
  for (let child of node.children) {
      root.children.push(dagToEcharts(child as Node))
  }
  return root
}

// Example usage:
const D_TEXT = `
je suis intermitant du spectacle -> oui -> j'ai des questions sur -> la qualification contractuelle -> je suis -> En cdd -> [réponse cdd]
                                                                                                               -> En cdi -> [réponse cdi]
                                                                                                               -> auto-entrepreneur -> [réponse auto-entrepreneur]
                                                                  -> rupture contractuelle -> [réponse rupture contractuelle]
                                                                  -> les droits au chomage -> [réponse droits au chomage]
                                                                  -> le régime fiscal      -> [réponse régime fiscal]
                                 -> non -> [Cela ne vous concerne pas]
`;

export function testParseTextToDAG() {
  const lines = D_TEXT.split("\n").filter(l => l.length > 0)
  console.log(lines)
  console.log("_______START_______")
  const dagRoot = parseDAG(lines);
  console.log("dagRoot: ", dagRoot);
  console.log(dumpDag(dagRoot));
  let retree = parseDAG(dumpDag(dagRoot).split("\n").filter(l => l.length > 0));
  console.log("retree: ", retree);
  let reparse = dumpDag(retree);
  console.log(reparse);
  return dagRoot;
}
