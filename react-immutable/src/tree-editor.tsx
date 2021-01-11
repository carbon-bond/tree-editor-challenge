import produce from "immer";
import { createContext, useContext, useEffect, useRef, useState } from "react"

type TreeNode = {
    valid: boolean,
    flush: boolean
    name: string,
    children: TreeNode[]
}

const initialTreeState: TreeNode = {
    valid: true,
    flush: false,
    name: '世界',
    children: [
        {
            valid: false,
            flush: false,
            name: 'xmowpaz3zujpmopgapofjo',
            children: [],
        },
        {
            valid: true,
            flush: false,
            name: '生物',
            children: [
                {
                    valid: true,
                    flush: false,
                    name: '哺乳類',
                    children: [],
                },
                {
                    valid: true,
                    flush: false,
                    name: '爬蟲類',
                    children: [],
                },
                {
                    valid: true,
                    flush: false,
                    name: '鳥類',
                    children: [],
                },
                {
                    valid: true,
                    flush: false,
                    name: '昆蟲',
                    children: [],
                },
            ]
        }
    ]
}

type RefNode = {
    ref: null | HTMLInputElement,
    children: RefNode[]
};

function createRefNode(root: TreeNode): RefNode {
    let children = [];
    for (let child of root.children) {
        children.push(createRefNode(child));
    }
    return {
        ref: null,
        children
    };
}

const refTree = createRefNode(initialTreeState);

const TreeContext = createContext<null | {
    tree: TreeNode,
    setTree: React.Dispatch<React.SetStateAction<TreeNode>>,
    setNode: (path: number[], updater: (node: TreeNode) => void) => void
}>(null);

function ResetButton(props: { path: number[] }) {
    const tree_state = useContext(TreeContext);
    if (tree_state == null) {
        return <button>按鈕不可用</button>
    }
    const onClick = () => {
        tree_state.setNode(props.path, (node) => {
            node.name = '';
            node.flush = !node.flush;
        })
    };
    return <button onClick={onClick}>重置{props.path.join('-')}</button>
}

export function TreeEditor() {
    const tree_state = useTreeState();
    return <TreeContext.Provider value={tree_state}>
        <TreeView node={tree_state.tree} path={[]} />
        <ResetButton path={[1, 0]} />
    </TreeContext.Provider>;
}

function useTreeState() {
    let [tree, setTree] = useState(initialTreeState);
    const setNode = (path: number[], updater: (node: TreeNode) => void ) => {
        const new_tree = produce(tree, draft => {
            let cur = draft;
            for (let br of path) {
                cur = cur.children[br];
            }
            updater(cur);
        });
        console.log(JSON.stringify(new_tree));
        setTree(new_tree);
    }
    return { tree, setTree, setNode };
}

function TreeView(props: { node: TreeNode, path: number[] }): JSX.Element {
    const [editing, setEditing] = useState(false);
    const tree_state = useContext(TreeContext);
    const input_element = useRef<HTMLInputElement>(null);
    useEffect(() => {
        console.log(`input_element.current = ${input_element.current}`)
        if (!input_element.current) { return; }
        console.log(`refTree = ${refTree}`);
        let cur_ref = refTree;
        let cur_state = tree_state!.tree;
        for (let br of props.path) {
            cur_ref = cur_ref.children[br];
            cur_state = cur_state.children[br];
        }
        cur_ref.ref = input_element.current;
        input_element.current.value = cur_state.name;
    }, [props.path, tree_state, editing]);
    // useEffect();
    console.log('執行');
    if (tree_state == null) {
        return <div>本行文字不該出現</div>;
    }
    const onChange = (evt: { target: { value: string } }) => {
        // setValue(evt.target.value);
    };
    const onComplete = () => {
        tree_state.setNode(props.path, (node) => {node.name = input_element.current!.value;})
        setEditing(false)
    }
    return <div>
        {
            editing ?
                <div>
                    <input autoFocus ref={input_element} onChange={onChange} />
                    <button onClick={onComplete}>完成</button>
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
                    return <TreeView key={`${index}-${child.flush}`} node={child} path={path} />
                })}
            </div>
        </div>
    </div>
}

