/* eslint-disable */

"use client";
import { color } from "echarts";
import { GraphUploader } from "../components/graph_uploader"
import React, { useEffect, useState } from "react";
import path from "path";
import {testParseTextToDAG, Leaf, Node, parseDagAndLeafsFromText} from "../lib/graph"
import type { RadioChangeEvent } from 'antd';
import { Input, Radio } from 'antd';
import { Card, Space } from 'antd';
import Markdown from 'react-markdown'



const FlowStep = (props: {node: any, level: any, path: any, setPath: any}) => {
  let [value, setValue] = useState(null)
  let choices = []
  let i = 0
  for (let c of props.node.children) {
    let h = i
    let comp = <Radio key={h} value={h}>{c.label}</Radio>
    choices.push(comp)
    i += 1
  }
  let onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value)
    props.setPath([...props.path.slice(0, props.level), e.target.value])
  }
  return (
    <Card title={props.node.label} style={{ width: 800 }}>
       <Radio.Group onChange={onChange} value={value}>
      <Space direction="vertical">
        {choices}
      </Space>
    </Radio.Group>
    </Card>
  )
}


const FlowLeaf = (props: {md?: string}) => {
  return (
    <Card title="Notre conseil" style={{ width: 800 }}>
      <Markdown className="prose lg:prose-s">{props.md}</Markdown>
    </Card>
  )
}


export default function FlowSandbox() {
  let [dag, setDag] = useState(null)
  let [level, setLevel] = useState(0)
  let [node_ref, setNodeRef] = useState(null)
  console.log("DAG FROM FLOW: ", dag)
  let [path, setPath] = useState([])
  console.log("PATH: ", path)
  let node_base: any = dag
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
          let rendered_leaf = <FlowLeaf md={(node_base as unknown as Leaf).markdown} key={i} />
          rendered_stuff.push(rendered_leaf)
        }
        i+=1
      }
  }
  useEffect(() => {
    fetch("/api/data", {
      "method": "GET",
    }).then(r => r.json().then((d: any) => {
      console.log("______ DAG: ______")
      console.log(d.dag)
      let dag = parseDagAndLeafsFromText(d.dag)
      setDag(dag)
    }))
  }, [])
  console.log("RENDERED: ", rendered_stuff)
  return (
    <main style={
      {
        width: '100vw',
        height: '100vh',
        backgroundColor: 'white',
      }
    }>
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%"}}>
    <Space direction="vertical" size={"large"}>
    {rendered_stuff}
    </Space>
    </div>
    </main>
  );
}
