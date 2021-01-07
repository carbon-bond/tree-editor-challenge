import { createContext, useContext } from "react"

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

const TreeContext = createContext(initialTreeState);

function TreeView(props: {node: TreeNode}): JSX.Element {
    return <div>
        <div style={{
            color: props.node.valid ? 'black' : 'red'
        }}>{props.node.name}</div>
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={{width: 20}}></div>
            <div>
                 {/* NOTE: 這個 key 選得很糟 */}
                {props.node.children.map(child => <TreeView key={child.name} node={child}/>)}
            </div>
        </div>
    </div>
}

export function TreeEditor() {
    const root = useContext(TreeContext);
    return <TreeView node={root}/>
}

