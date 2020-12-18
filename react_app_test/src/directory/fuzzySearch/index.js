import {Tree, Input, TreeSelect} from 'antd';
import React, {RandomDOM, useState, useEffect, Component} from 'react'
import ReactDOM from 'react-dom';

//TODO: 官网 https://www.bookstack.cn/read/ant-design-of-react-4.1.0/d002bdfa2e8a3928.md#9oqv85
const {Search} = Input;
const x = 3;
const y = 2;
const z = 1;
const gData = [];
const generateData = (_level, _preKey, _tns) => {
    const preKey = _preKey || '0';
    const tns = _tns || gData;
    const children = [];
    for (let i = 0; i < x; i++) {
        const key = `${preKey}-${i}`;
        tns.push({title: key, key});
        if (i < y) {
            children.push(key);
        }
    }
    if (_level < 0) {
        return tns;
    }
    const level = _level - 1;
    children.forEach((key, index) => {
        tns[index].children = [];
        return generateData(level, key, tns[index].children);
    });
};
generateData(z);
const dataList = [];
const generateList = data => {
    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const {key} = node;
        dataList.push({key, title: key});
        if (node.children) {
            generateList(node.children);
        }
    }
};
generateList(gData);
const getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
            if (node.children.some(item => item.key === key)) {
                parentKey = node.key;
            } else if (getParentKey(key, node.children)) {
                parentKey = getParentKey(key, node.children);
            }
        }
    }
    return parentKey;
};

class SearchTree extends React.Component {
    state = {
        expandedKeys: [],
        searchValue: '',
        autoExpandParent: true,
    };
    onExpand = expandedKeys => {
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    };
    onChange = e => {
        const {value} = e.target;
        const expandedKeys = dataList
            .map(item => {
                if (item.title.indexOf(value) > -1) {
                    return getParentKey(item.key, gData);
                }
                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);
        this.setState({
            expandedKeys,
            searchValue: value,
            autoExpandParent: true,
        });
    };

    render() {
        const {searchValue, expandedKeys, autoExpandParent} = this.state;
        const loop = data =>
            data.map(item => {
                const index = item.title.indexOf(searchValue);
                const beforeStr = item.title.substr(0, index);
                const afterStr = item.title.substr(index + searchValue.length);
                const title =
                    index > -1 ? (
                        <span>
              {beforeStr}
                            <span className="site-tree-search-value">{searchValue}</span>
                            {afterStr}
            </span>
                    ) : (
                        <span>{item.title}</span>
                    );
                if (item.children) {
                    return {title, key: item.key, children: loop(item.children)};
                }
                return {
                    title,
                    key: item.key,
                };
            });
        return (
            <div>
                <Search style={{marginBottom: 8}} placeholder="Search" onChange={this.onChange}/>
                <Tree
                    onExpand={this.onExpand}
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                    treeData={loop(gData)}
                />
            </div>
        );
    }
}


//TODO: 简书
//const { DirectoryTree } = Tree
//
// //创建组件
// export class Search extends React.Component {
//     constructor(props) {
//         super(props)
//         this.state = {
//             select_treenodes: [],
//             expandFlag: [],
//             tree_data: [],
//         }
//     }
//
//     onSelect = (selectedKeys, info) => {
//         //点击树节点触发事件可以打印selectedKeys，info查看它的值
//     }
//
//     // 展开/收起节点时触发（把指定张开的父节点重新赋值；如果加了 expandedKeys，就必须用这一步，不然不能展开节点以及收起节点）
//     onExpand = (expandedKeys, { expanded: bool, node }) => {
//         console.log(expandedKeys)
//         this.setState({
//             expandFlag: expandedKeys,
//         })
//     }
//
//     //当搜索框输入时触发
//     SearchChange = e => {
//         console.log(e.target.value) //输入的值打印
//         let data = this.state.tree_data //节点数据；
//         //遍历节点数据
//         for (let i = 0; i < data[0].children.length; i++) {
//             if (data[0].children[i].title == e.target.value) {
//                 //如果输入的值等于节点的title，把节点张开，标记节点；
//                 console.log(data[0].children[i].key) //打印key，如果key是number类型则要转化成String类型；
//                 this.setState({
//                     select_treenodes: [data[0].children[i].key], //设置选中的树节点
//                     expandFlag: [String(data[0].key)], //展开指定父节点
//                 })
//             }
//         }
//         console.log(this.state.tree_data)
//     }
//
//     //渲染
//     render() {
//         //tree数据
//         const treeData = [
//             {
//                 title: 'parent 0',
//                 key: '0-0',
//                 children: [
//                     { title: 'leaf 0-0', key: '0-0-0', isLeaf: true },
//                     { title: 'leaf 0-1', key: '0-0-1', isLeaf: true },
//                 ],
//             },
//             {
//                 title: 'parent 1',
//                 key: '0-1',
//                 children: [
//                     { title: 'leaf 1-0', key: '0-1-0', isLeaf: true },
//                     { title: 'leaf 1-1', key: '0-1-1', isLeaf: true },
//                 ],
//             },
//         ]
//         this.state.tree_data = treeData //节点值赋值给state 的tree_data;
//         return (
//             <div>
//                 <Search style={{ marginBottom: 8 }} placeholder='search' onChange={this.SearchChange} /> //搜索框
//                 <DirectoryTree
//                     multiple //支持点选多个节点（节点本身）boolean类型；
//                     onSelect={this.onSelect} //点击树节点触发；
//                     selectedKeys={this.state.select_treenodes} //（受控）设置选中的树节点;
//                     // 展开指定的树节点
//                     expandedKeys={this.state.expandFlag} //（受控）展开指定的树节点(注意，这个一定要与onExpand一起用，不然不能关闭和展开树节点；
//                     onExpand={this.onExpand} //    展开/收起节点时触发;
//                     treeData={treeData}
//                 />{' '}
//                 //数据
//             </div>
//         )
//     }
// }

//TODO: 博客园
// const {TreeNode} = Tree
//
// class Search extends Component {
//     state={
//         treeNode : [1,2,3,4]
//     }
//
//     render() {
//         return (
//             <TreeSelect
//                 showSearch//显示搜索框
//                 treeNodeFilterProp='title'//输入项过滤对应的 treeNode 属性, value或者title
//                 style={{width: '100%'}}
//                 dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
//                 placeholder="机构名称"
//                 allowClear
//                 treeDefaultExpandAll
//                 onChange={this.onTreeChange}
//                 onFocus={this.getTreeSelect}
//             >
//                 {this.treeNodeRender()}
//             </TreeSelect>
//         )
//     }

//js
//     treeNodeRender = () => {
//
//         const {treeNode} = this.state;
//
//         if (!treeNode || !treeNode.length) {
//             return;
//         }
//
//         return treeNode.map((v, i) => {
//             return (
//                 <TreeNode
//
//                     value={v.medicalInstitutionId}
//                     title={v.medicalInstitutionSimpleCode}
//                     key={i}
//                 >
//                     {v.children && this.treeNodeChildRender(v.children)}
//                 </TreeNode>
//             );
//         });
//     }
// }


// eslint-disable-next-line no-undef
ReactDOM.render(<SearchTree/>, document.getElementById('root'));