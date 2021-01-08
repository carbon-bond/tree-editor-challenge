import produce from "immer";
import { createContext, useContext, useState } from "react"

type TreeNode = {
    valid: Boolean,
    name: string,
    children: TreeNode[]
}

const initialTreeState: TreeNode = {
    valid: true,
    name: '世界',
    children: [
        {
            valid: false,
            name: 'xmowpaz3zujpmopgapofjo',
            children: [],
        },
        {
            valid: true,
            name: '生物',
            children: [
                {
                    valid: true,
                    name: '哺乳類',
                    children: [],
                }
            ]
        }
    ]
}

const TreeContext = createContext<null | { tree: TreeNode, setTree:React.Dispatch<React.SetStateAction<TreeNode>>}>(null);

export function TreeEditor() {
    const tree_state = useTreeState();
    return <TreeContext.Provider value={tree_state}>
        <TreeView node={tree_state.tree} path={[]} />
    </TreeContext.Provider>;
}

function useTreeState() {
    let [tree, setTree] = useState(initialTreeState);
    return { tree, setTree };
}

function TreeView(props: { node: TreeNode, path: number[] }): JSX.Element {
    const [editing, setEditing] = useState(false)
    const tree_state = useContext(TreeContext);
    if (tree_state == null) {
        return <div>本行文字不該出現</div>
    }
    const onChange = (evt: { target: { value: string } }) => {
        const new_tree = produce(tree_state.tree, draft => {
            let cur = draft;
            for (let br of props.path) {
                console.log(`在 ${cur.name} 的 ${br}`);
                cur = cur.children[br];
            }
            cur.name = evt.target.value;
        });
        console.log(JSON.stringify(new_tree));
        tree_state.setTree(new_tree);
    };
    return <div>
        {
            editing ?
                <div>
                    <input onChange={onChange} value={props.node.name} />
                    <button onClick={() => { setEditing(false) }}>完成</button>
                </div>
                : <div>
                    <span style={{ color: props.node.valid ? 'black' : 'red' }}>{props.node.name}</span>
                    <button onClick={() => { setEditing(true) }}>修改</button>
                </div>
        }
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: 20 }}></div>
            <div>
                {/* NOTE: 這個 key 選得很糟 */}
                {props.node.children.map((child, index) => {
                    let path = props.path.slice();
                    path.push(index);
                    return <TreeView key={index} node={child} path={path} />
                })}
            </div>
        </div>
    </div>
}

