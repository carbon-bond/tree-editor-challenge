import produce from "immer";
import { createContext, useCallback, useContext, useState } from "react"

type TreeNode = {
    valid: boolean,
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
                },
                {
                    valid: true,
                    name: '爬蟲類',
                    children: [],
                },
                {
                    valid: true,
                    name: '鳥類',
                    children: [],
                },
                {
                    valid: true,
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
const setRefTree = (path: number[], updater: (node: RefNode) => void ) => {
    let cur = refTree;
    for (let br of path) {
        cur = cur.children[br];
    }
    updater(cur);
}
const deleteRefNode = (path: number[]) => {
    let cur = refTree;
    for (let br of path.slice(0, path.length - 1)) {
        cur = cur.children[br];
    }
    cur.children.splice(path[path.length - 1], 1);
}

const TreeContext = createContext<null | {
    tree: TreeNode,
    setTree: React.Dispatch<React.SetStateAction<TreeNode>>,
    setNode: (path: number[], updater: (node: TreeNode) => void) => void,
    deleteNode: (path: number[]) => void
}>(null);

function ResetButton(props: { path: number[] }) {
    const tree_state = useContext(TreeContext);
    if (tree_state == null) {
        return <button>按鈕不可用</button>
    }
    const onClick = () => {
        tree_state.setNode(props.path, (node) => {
            node.name = '';
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
    const deleteNode = (path: number[]): void => {
        const new_tree = produce(tree, draft => {
            let cur = draft;
            for (let br of path.slice(0, path.length - 1)) {
                cur = cur.children[br];
            }
            cur.children.splice(path[path.length - 1], 1);
        });
        console.log(JSON.stringify(new_tree));
        setTree(new_tree);
    }
    return { tree, setTree, setNode, deleteNode };
}

function TreeView(props: { node: TreeNode, path: number[] }): JSX.Element {
    const [editing, setEditing] = useState(false);
    const [input_element, setInputElement] = useState<null | HTMLInputElement>(null);
    const tree_state = useContext(TreeContext);
    const onRef = useCallback(cur => {
        setInputElement(cur);
        console.log(`input_element.current = ${cur}`);
        if (!cur) { return; }
        console.log(`refTree = ${refTree}`);
        let cur_ref = refTree;
        let cur_state = tree_state!.tree;
        for (let br of props.path) {
            cur_ref = cur_ref.children[br];
            cur_state = cur_state.children[br];
        }
        cur_ref.ref = cur;
        cur.value = cur_state.name;
    }, [props.path, tree_state]);
    console.log('執行');
    if (tree_state == null) {
        return <div>本行文字不該出現</div>;
    }
    const onChange = (evt: { target: { value: string } }) => {
        // setValue(evt.target.value);
    };
    const onComplete = () => {
        tree_state.setNode(props.path, (node) => {node.name = input_element!.value;})
        setEditing(false)
    };
    const onAdd = () => {
        tree_state.setNode(props.path, (node) => {
            node.children.push({
                valid: true,
                name: '',
                children: []
            })
        })
        setRefTree(props.path, (node) => {
            node.children.push({
                ref: null,
                children: []
            });
        })
    };
    const onDelete = () => {
        tree_state.deleteNode(props.path);
        deleteRefNode(props.path);
    };
    return <div>
        {
            editing ?
                <div>
                    <input autoFocus ref={onRef} onChange={onChange} />
                    <button onClick={onComplete}>完成</button>
                </div>
                : <div>
                    <span style={{ color: props.node.valid ? 'black' : 'red' }}>{props.node.name}</span>
                    <button onClick={() => { setEditing(true) }}>修改</button>
                    <button onClick={onAdd}>增加</button>
                    <button onClick={onDelete}>刪除</button>
                </div>
        }
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: 20 }}></div>
            <div>
                {/* NOTE: 這個 key 選得很糟 */}
                {props.node.children.map((child, index) => {
                    let path = props.path.slice();
                    path.push(index);
                    return <TreeView key={`${index}`} node={child} path={path} />
                })}
            </div>
        </div>
    </div>
}

