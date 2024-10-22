/* eslint-disable */

"use client";
import { color } from "echarts";
import { GraphUploader } from "../components/graph_uploader"
import React, { useState } from "react";
import path from "path";
import {testParseTextToDAG, Leaf, Node} from "../lib/graph"



const FlowStep = (props: {node: any, level: any, path: any, setPath: any}) => {
  let choices = []
  let i = 0
  for (let c of props.node.children) {
    let h = i
    let np = [...props.path.slice(0, props.level), h]
    choices.push(<button key={h} onClick={() => props.setPath(np)}>{c.label}</button>)
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
  let dag = testParseTextToDAG()
  let [level, setLevel] = useState(0)
  let [node_ref, setNodeRef] = useState(null)
  console.log("DAG FROM FLOW: ", dag)
  let [path, setPath] = useState([])
  console.log("PATH: ", path)
  let node_base = dag
  let rendered_stuff: any = []
  let i = 0;
    if (dag !== null) {
      rendered_stuff = [<FlowStep node={node_base} level={0} path={path} setPath={setPath} key={i}/>]
      i+=1
      for (let p of path) {
        node_base = ((node_base.children[p] as any).children[0]) as any
        if (node_base.type == "node") {
          rendered_stuff.push(<FlowStep node={node_base} level={i} path={path} setPath={setPath} key={i}/>)
        }
        else if (node_base.type == "leaf") {
          rendered_stuff.push(<div style={{ color: "black" }} key={i}>{(node_base as unknown as Leaf).text}</div>)
        }
        i+=1
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
    {rendered_stuff}
    </div>
    </main>
  );
}
