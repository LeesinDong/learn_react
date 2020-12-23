import { Tree, Input } from 'antd'
import React from 'react'
import { ContainerOutlined } from '@ant-design/icons'

const { TreeNode, DirectoryTree } = Tree

import Search from 'antd/lib/input/Search'

const getParentKey = (key, tree) => {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }
  return parentKey
}

export default class SearchTree extends React.Component {
  state = {
    expandedKeys: [],
    searchValue: '',
    autoExpandParent: true,
    isChange: false,
  }
  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    })
  }
  // onSearch不支持event，onSelect支持[但是包含了onChange]
  onChange = async value => {
    const { treeList, dataList } = this.props
    const expandedKeys = dataList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, treeList)
        }
        return null
      })
      .filter((item, i, self) => item && self.indexOf(item) === i)
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
      isChange: true,
    })
    const { changeDisplay } = this.props
    changeDisplay(false)

    if (value.length === 0) {
      this.setState({
        isChange: false,
      })
      const { changeDisplay } = this.props
      changeDisplay(true)
    }
  }

  onMouseOver = () => {
    this.setState({
      isChange: false,
    })
    const { changeDisplay } = this.props
    changeDisplay(true)
  }

  onSelect() {
    const { select } = this.props
    select()
  }
  onTreeNodeSelect = (_, event) => {
    if (event.selected) {
      const node = event.node.props.dataRef
      const { loadChartList } = this.props
      loadChartList(parseInt(node.key))
    }
  }
  warpTag(content, keyword, tagName) {
    if (content === 'No results') {
      return content
    }
    const a = content.toLowerCase()
    const b = keyword.toLowerCase()

    const indexOf = a.indexOf(b)
    const c = indexOf > -1 ? content.substr(indexOf, keyword.length) : ''
    const val = `<${tagName} style="background-color: #ff0;">${c}</${tagName}>`
    const regS = new RegExp(keyword, 'gi')
    return content.replace(regS, val)
  }
  renderTree = nodes =>
    nodes.map(item => {
      if (item.children) {
        return (
          <TreeNode
            title={
              <div
                style={{ float: 'right' }}
                dangerouslySetInnerHTML={{ __html: this.warpTag(item.title, this.state.searchValue, 'span') }}
              />
            }
            key={item.key}
            dataRef={item}
          >
            {this.renderTree(item['children'])}
          </TreeNode>
        )
      }
      return (
        <TreeNode
          title={
            <div
              style={{ float: 'right' }}
              dangerouslySetInnerHTML={{ __html: this.warpTag(item.title, this.state.searchValue, 'span') }}
            />
          }
          key={item.key}
          dataRef={item}
          isLeaf={true}
          icon={<ContainerOutlined />}
        />
      )
    })
  render() {
    const { treeList } = this.props
    const { searchValue, expandedKeys, autoExpandParent } = this.state
    const loop = data =>
      data.map(item => {
        const index = item.title.indexOf(searchValue)
        const beforeStr = item.title.substr(0, index)
        const afterStr = item.title.substr(index + searchValue.length)
        const title =
          index > -1 ? (
            <span>
              {beforeStr}
              <span className='site-tree-search-value'>{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span>{item.title}</span>
          )
        if (item.children) {
          return { title, key: item.key, children: loop(item.children) }
        }
        return {
          title,
          key: item.key,
        }
      })
    const { isChange } = this.state
    return (
      <div>
        <Search style={{ marginBottom: 8 }} placeholder='请输入名称' onSearch={this.onChange} />
        <DirectoryTree
          style={{ display: isChange ? 'block' : 'none', border: '1px solid #ccc', borderRadius: '5px' }}
          onExpand={this.onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          showIcon={true}
          defaultExpandAll={true}
          onSelect={this.onTreeNodeSelect}
        >
          {this.renderTree(treeList)}
        </DirectoryTree>
      </div>
    )
  }
}
