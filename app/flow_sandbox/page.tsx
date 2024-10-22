/* eslint-disable */

/*
  A graph question node will always have at least two children
  Ex: je suis en -> cdd
                 -> cdi

  An answer node will always have one child
  ex: cdd -> depuis -> 1 an
                    -> 2 ans
                    -> +3 ans
*/
"use client";
import { GraphUploader } from "../components/graph_uploader"
import React, { useState } from "react";


const FlowStep = (props: {node: any, level: any, path: any, setPath: any}) => {
  let choices = []
  let i = 0
  for (let c of props.node.children) {
    let h = i
    choices.push(<button onClick={() => props.setPath(h)}>{c.label}</button>)
    i += 1
  }
  return (
    <div style={{color: "black", display: "flex", flexDirection: "column"}}>
      {props.node.label}
      {choices}
    </div>
  )
}

export default function FlowSandbox() {
  let [dag, setDag] = useState(null)
  let [level, setLevel] = useState(0)
  console.log("DAG FROM FLOW: ", dag)
  let [path, setPath] = useState([] as any)
  console.log("PATH: ", path)
  let node_base = dag
  let rendered_stuff: any = []
  let i = 0;
  let z = 0
  let stp = (p: any) => setPath([...path, p])
  if (dag !== null) {
    console.log("DAG IS NOT NULL")
    rendered_stuff = [<FlowStep node={node_base} level={0} path={path} setPath={stp} key={i}/>]
    i+=1
    for (let p of path) {
      console.log("__________ P OF PATH: ", p)
      node_base = (node_base as any).children[p].children[0]
      console.log("NODE BASE: ", node_base)
      rendered_stuff.push(<FlowStep node={node_base} level={i} path={path} setPath={stp} key={i} />)
        i += 1
      }
    }
  console.log("RENDERED: ", rendered_stuff)
  return (
    <main style={
      {
        width: '100vw',
        height: '100vh',
        backgroundColor: 'white'
      }
    }>
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%"}}>
    <div style={{height: "100px"}}>
      <GraphUploader register={(d: any) => setDag(d)}/>
    </div>
    <div style={{marginTop: "100px", marginRight: "100px"}}>
    {rendered_stuff}
    </div>
    </div>
    </main>
  );
}
