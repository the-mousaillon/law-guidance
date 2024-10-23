/* eslint-disable */

const SEP = " -> ";

export interface Leaf {
  type: 'leaf';
  label: string;
  markdown: string;
}

export interface Node {
  type: 'node';
  label: string;
  children: (Node | Leaf)[];
}

export function parseDAG(text: string[], recur: number=0): Node {
  if (recur > 300) {
    console.log("RECURSION LIMIT REACHED")
    throw new Error("Recursion limit reached")
  }
  console.log("TXT: ", text)
  if (text.length == 1) {
    let vals = text[0].split(SEP).map(s => s.trim())
    let leaf = { type: "leaf", label: vals[1], markdown: ""} as Leaf;
    let node = { type: "node", label: vals[0], children: [leaf] } as Node;
    console.log("leaf: ", node)
    return node;
  }

  console.log("T0: ", text[0])
  let pos_sep = text[0].indexOf(SEP);
  let curr_node = { type: "node", label: text[0].slice(0, pos_sep).trim(), children: [] as (Node|Leaf)[] } as Node;
  let sublines = [] as string[]
  let i = 0;
  for (let l of text) {
    console.log("slice: ", l.slice(pos_sep, pos_sep + SEP.length))
    let l_shift = l.slice(pos_sep + SEP.length, l.length)
    if (l_shift.length == 0) {
      continue
    }
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
    return root_path_ + (node.children[0] as Leaf).label + "\n";
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

export function dumpDagAndLeafs(node: Node): string {
  let out = "[DAG]\n"
  out += dumpDag(node)
  let leafs = collectLeafRefs(node)
  out += "\n[LEAFS]\n"
  for (let k of Object.values(leafs)) {
    out += k.label + "\n" + k.markdown + "\n"
  }
  return out
}


function collectLeafRefs(node: Node): { [key: string]: Leaf } {
  let leafs = {} as { [key: string]: Leaf }
  for (let child of node.children) {
    if ((child as Leaf).type == "leaf") {
      leafs[(child as Leaf).label] = child as Leaf
    }
    else {
      let sub_leafs = collectLeafRefs(child as Node)
      for (let k in sub_leafs) {
        leafs[k] = sub_leafs[k]
      }
    }
  }
  return leafs
}


export function parseDagAndLeafsFromText(text: string): any {
  let dag_lines = []
  let leaf_lines = []

  let store = "none"
  let t_split = text.split("\n")
  for (let l of t_split) {
    if (l == "[DAG]") {
      store = "dag"
    }
    else if (l == "[LEAFS]") {
      store = "leaf"
    }
    else {
      if (store == "dag") {
        if (l.length > 0) {
          dag_lines.push(l)
        }
      }
      else if (store == "leaf") {
        leaf_lines.push(l)
      }
    }
  }

  console.log("DAG LINES: ", dag_lines)

  let dag = parseDAG(dag_lines)
  let leafs = collectLeafRefs(dag)
  let curr_leaf = ""
  for (let l of leaf_lines) {
    if (l in leafs) {
      curr_leaf = l
    }
    else {
      leafs[curr_leaf].markdown += l + "\n"
    }
  }
  return dag
}

export function dagToEcharts(node: Node): any {
  if (node.children.length == 1 && (node.children[0] as Leaf).type == "leaf") {
    return { name: node.label, collapsed: false, children: [{ name: (node.children[0] as Leaf).label, collapsed: false }] };
  }
  let root = { name: node.label, children: [] as any[], collapsed: false };
  for (let child of node.children) {
      root.children.push(dagToEcharts(child as Node))
  }
  return root
}

// Example usage:
export const D_TEXT = `
[DAG]
je suis intermitant du spectacle -> oui -> j'ai des questions sur -> la qualification contractuelle -> je suis -> En cdd -> [réponse cdd]
                                                                                                               -> En cdi -> [réponse cdi]
                                                                                                               -> auto-entrepreneur -> [réponse auto-entrepreneur]
                                                                  -> rupture contractuelle -> [réponse rupture contractuelle]
                                                                  -> les droits au chomage -> [réponse droits au chomage]
                                                                  -> le régime fiscal      -> [réponse régime fiscal]
                                 -> non -> [Cela ne vous concerne pas]

[LEAFS]
[réponse cdd]
# CDD
Vous êtes donc en **CDD**. Voici quelques informations utiles:
* Vous avez droit à une prime de précarité
* Vous avez droit à des congés payés
* Vous avez droit à une indemnité de fin de contrat

[réponse cdi]
# CDI
Vous êtes donc en **CDI**. Voici quelques informations utiles:
* Vous êtes foutu


[réponse auto-entrepreneur]
# Auto-entrepreneur
Vous êtes donc auto-entrepreneur. Voici quelques informations utiles:
* Attention à l"ursaff !!!!
* Vous êtes foutu

([\`Lien vers l'ursaff\`](https://www.urssaf.fr/accueil.html))


[réponse rupture contractuelle]
# Rupture contractuelle
Rien a dire


[réponse droits au chomage]
# Droits au chomage
Rien a dire


[réponse régime fiscal]
# Régime fiscal
Rien a dire

[Cela ne vous concerne pas]
# Vous n'êtes pas concerné
A bientôt
`;

export function testParseTextToDAG() {
  // const lines = D_TEXT.split("\n").filter(l => l.length > 0)
  // console.log(lines)
  // console.log("_______START_______")
  // const dagRoot = parseDAG(lines);
  // console.log("dagRoot: ", dagRoot);
  // console.log(dumpDag(dagRoot));
  // let retree = parseDAG(dumpDag(dagRoot).split("\n").filter(l => l.length > 0));
  // console.log("retree: ", retree);
  // let reparse = dumpDag(retree);
  // console.log(reparse);
  let dag = parseDagAndLeafsFromText(D_TEXT);
  return dag
}
