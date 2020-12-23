import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { Card, Row, Col, Tree, Empty } from 'antd'
const { TreeNode } = Tree
import { post } from 'common/utils/request'
import Echart from './components/echart'
import { ContainerOutlined, AreaChartOutlined } from '@ant-design/icons'
import SearchTree from './SearchTree'

const { DirectoryTree } = Tree

export default function DashboardPage() {
  // 图表列表数据
  const [chartList, setChartList] = useState([])

  // 显示的图表chart数据
  const [showChartList, setShowChartList] = useState([])

  const [treeList, setTreeList] = useState([])

  // 是否展示搜索前的列表
  const [treeDisplay, setTreeDisplay] = useState(true)

  const loadTreeList = async () => {
    const list = await post('/api/angela/monitorBizService/loadTreeList', {})
    setTreeList(list)
  }

  // 加载图表配置信息
  const loadChartList = async bizId => {
    const data = await post('/api/angela/monitorBizService/listChartList', { bizId })
    setChartList(data)
    if (data && data.length > 0) {
      setShowChartList(data)
    }
  }

  // 页面加载初始化
  useEffect(() => {
    //loadNodeList()
    loadTreeList()
  }, [])

  const renderTree = nodes =>
    nodes.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {renderTree(item['children'])}
          </TreeNode>
        )
      }
      return <TreeNode title={item.title} key={item.key} dataRef={item} isLeaf={true} icon={<ContainerOutlined />} />
    })

  // 业务节点点击事件，加载图表配置信息
  const onTreeNodeSelect = (_, event) => {
    if (event.selected) {
      const node = event.node.props.dataRef
      loadChartList(parseInt(node.key))
    }
  }

  const dataList = []
  const generateList = data => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i]
      const { key, title } = node
      dataList.push({ key, title: title })
      if (node.children) {
        generateList(node.children)
      }
    }
  }
  generateList(treeList)
  const changeDisplay = idDisplay => {
    setTreeDisplay(idDisplay)
  }
  return (
    <>
      <div style={{ margin: 10, minHeight: 'calc(100% - 20px)' }}>
        <Row gutter={10}>
          <div style={{ height: '100%' }}>
            <Col span={5}>
              <Card bordered={false} style={{ maxHeight: '500px', overflowY: 'auto' }} title={'图表场景列表'}>
                {treeList.length > 0 ? (
                  <div>
                    <SearchTree
                      treeList={treeList}
                      dataList={dataList}
                      changeDisplay={isDisplay => changeDisplay(isDisplay)}
                      loadChartList={key => loadChartList(key)}
                    />
                    <DirectoryTree
                      showIcon={true}
                      defaultExpandAll={true}
                      onSelect={onTreeNodeSelect}
                      style={{ display: treeDisplay ? 'block' : 'none' }}
                    >
                      {renderTree(treeList)}
                    </DirectoryTree>
                  </div>
                ) : null}
              </Card>
              <Card bordered={false} style={{ mixHeight: '200px', marginTop: '10px' }} title={'图表项'}>
                <Tree
                  showLine={false}
                  showIcon={true}
                  defaultExpandAll={true}
                  onSelect={(_, event) => {
                    setShowChartList([event.node.props.dataRef])
                  }}
                >
                  {chartList.map(chart => (
                    <TreeNode title={chart.name} key={chart.id} dataRef={chart} icon={<AreaChartOutlined />} />
                  ))}
                </Tree>
              </Card>
            </Col>
          </div>
          <Col span={19}>
            <Card bordered={false} title={'大盘列表'}>
              <Row gutter={30}>
                {showChartList.length > 0 ? (
                  showChartList.slice(0, 10).map(chart => <Echart key={chart.id} chart={chart}></Echart>)
                ) : (
                  <Empty />
                )}
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}
