import { createContext, useContext, useState } from "react"
import * as React from 'react';
import { produce } from "immer";

function genKey(trace: number[]) {
    return trace.join('-');
}
class Valid {
    map: { [key: string]: boolean } = {};

    constructor() {}


    insertErr(trace: number[]) {
        this.map[genKey(trace)] = true;
        return this;
    }
    clearErr(trace: number[]) {
        delete this.map[genKey(trace)];
        return this;
    }
    getErrs() {
        return Object.keys(this.map);
    }
}

type TreeNode = {
    valid: Valid,
    value: string,
    max: number,
    children: TreeNode[],
    trace: number[]
}

let initialTreeState: TreeNode = {
    valid: new Valid(),
    value: '世界',
    max: 5,
    trace: [],
    children: [
        {
            valid: new Valid(),
            max: 5,
            value: 'xm',
            children: [],
            trace: [],
        },
        {
            valid: new Valid(),
            max: 3,
            value: '生物',
            trace: [],
            children: [
                {
                    max: 3,
                    valid: new Valid(),
                    value: '哺乳類',
                    children: [],
                    trace: [],
                }
            ]
        }
    ]
}
function assignTrace(root: TreeNode) {
    function inner(cur: TreeNode, trace: number[]) {
        cur.trace = [...trace];
        cur.children.forEach((n, i) => {
            inner(n, [...trace, i]);
        });
    }
    inner(root, [0]);
}

function findByTrace(root: TreeNode, trace: number[]): TreeNode[] {
    let cur = root;
    let nodes = [root];
    for (let i of trace.slice(1)) {
        if (i >= cur.children.length) {
            throw "三小";
        }
        cur = cur.children[i];
        nodes.push(cur);
    }
    return nodes;
}

assignTrace(initialTreeState);

let context_obj = {
    tree: initialTreeState,
    setTree: (_handler: (root: TreeNode) => TreeNode) => {},
};
const TreeContext = createContext(context_obj);

function updateTree(root: TreeNode, trace: number[], value: string) {
    let nodes = findByTrace(root, trace).reverse();
    let last = nodes[0];
    last.value = value;
    let self_err = last.value.length >= last.max;
    if (self_err) {
        last.valid.insertErr(trace);
    } else {
        last.valid.clearErr(trace);
    }
    for (let node of nodes.slice(1)) {
        if (self_err) {
            node.valid.insertErr(trace);
        } else {
            node.valid.clearErr(trace);
        }
    }
}

function TreeView(props: {node: TreeNode }): JSX.Element {
    const { setTree } = useContext(TreeContext);
    function ErrorPrompt() {
        let errs = props.node.valid.getErrs();
        if (errs.length == 0) {
            return null;
        }
        return <span style={{ color: 'red' }}>
            非法的 {errs.map(s => <span>{s},</span>)}
        </span>;
    }
    return <div>
        <input type="text" value={props.node.value} onChange={e => {
            let v = e.target.value;
            setTree(root => {
                let new_root = produce(root, (root) => {
                    updateTree(root, props.node.trace, v);
                });
                return new_root;
            });
        }} />
        <ErrorPrompt/>
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={{width: 20}}></div>
            <div>
                 {/* NOTE: 這個 key 選得很糟 */}
                {props.node.children.map((child, i)=> <TreeView key={genKey(props.node.trace)} node={child}/>)}
            </div>
        </div>
    </div>
}

export function TreeEditor() {
    function TreeEditorInner() {
        const { tree } = useContext(TreeContext);
        return <TreeView node={tree} />
    }
    let [tree, setTree] = useState(initialTreeState);
    return <TreeContext.Provider value={{setTree: React.useCallback((handler) => {
        setTree(handler);
    }, []), tree}}>
        <TreeEditorInner/>
        <button onClick={() => {
            setTree(root => {
                let new_root = produce(root, (root) => {
                    updateTree(root, [0, 1, 0], "測試字串YAAA");
                });
                return new_root;
            });
        }}>按看看 0-1-0</button>
        <button onClick={() => {
            setTree(root => {
                let new_root = produce(root, (root) => {
                    updateTree(root, [0, 1, 0], "");
                });
                return new_root;
            });
        }}>清掉 0-1-0</button>
        <button onClick={() => {
            setTree(root => {
                let new_root = produce(root, (root) => {
                    updateTree(root, [0, 0], "測試字串YOOO");
                });
                return new_root;
            });
        }}>按看看 0-0</button>
    </TreeContext.Provider>;
}

