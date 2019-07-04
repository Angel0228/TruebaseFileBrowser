import React from 'react';
import ReactDOM from 'react-dom';
import Tree, { TreeNode } from 'rc-tree';
import Tooltip from 'rc-tooltip';
import { Modal, Button, Table } from 'react-bootstrap';

class FileTree extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      treeData: [
        { name: 'folder 01', key: '0-0', isLeaf: false }, 
        { name: 'folder 02', key: '0-1', isLeaf: false },
        { name: 'file 03', key: '0-2', isLeaf: true },
      ],
      selectedKeys: [],
      showModal: false, // Show modal for name changes
      newName: "" // Save new name
    };
  }

  componentDidMount() {
    this.getContainer();
  }

  componentWillUnmount() {
    if (this.cmContainer) {
      ReactDOM.unmountComponentAtNode(this.cmContainer);
      document.body.removeChild(this.cmContainer);
      this.cmContainer = null;
    }
  }

  onSelect = (keys) => {
    if (keys.length) {
      this.setState({ selectedKeys: keys, item: this.getTreeItemFromKey(keys[0]) })
    }
  }

  onRightClick = (info) => {
    this.setState({ selectedKeys: [info.node.props.eventKey] });
    this.renderContextMenu(info);
  }

  getContainer() {
    if (!this.cmContainer) {
      this.cmContainer = document.createElement('div');
      document.body.appendChild(this.cmContainer);
    }
    return this.cmContainer;
  }

  hideContextMenu = () => {
    if (this.toolTip) {
      ReactDOM.unmountComponentAtNode(this.cmContainer);
      this.toolTip = null;
    }
  }

  /* Get tree item from key */
  getTreeItemFromKey = (info) => {
    let key = info.node ? info.node.props.eventKey : info;
    let indexes = key.split('-').map(index => parseInt(index));

    let { treeData } = this.state;
    let item = treeData[indexes[1]];

    for (let i=2; i<indexes.length; i++) {
      item = item.children[ indexes[i] ];
    }

    return item;
  }

  /* Get parent tree item of last from key */
  getParentTreeItemFromKey = (info) => {
    let key = info.node.props.eventKey;
    let indexes = key.split('-').map(index => parseInt(index));

    let { treeData } = this.state;

    if (indexes.length === 2) {
      return {
        parent: treeData,
        key: key,
        root: true
      }
    }

    let item = treeData[indexes[1]];

    for (let i=2; i<indexes.length - 1; i++) {
      item = item.children[ indexes[i] ];
    }

    return {
      parent: item,
      key: key
    }
  }

  createFolder = (info = "") => {
    this.hideContextMenu();

    if (!info.node) {
      // Add folder under root
      let { treeData } = this.state;
      treeData.push({ name: 'New Folder', key: '0-' + treeData.length, isLeaf: false })

    } else {
      let item = this.getTreeItemFromKey(info);
      
      if (!item.children) {
        item.children = [{ name: 'New Folder', key: info.node.props.eventKey + '-0', isLeaf: false }];
      } else {
        item.children.push({ name: 'New Folder', key: info.node.props.eventKey + '-' + item.children.length, isLeaf: false });
      }
    }

    this.forceUpdate();
  }

  createFile = (info = "") => {
    this.hideContextMenu();

    if (!info.node) {
      // Add folder under root
      let { treeData } = this.state;
      treeData.push({ name: 'New File', key: '0-' + treeData.length, isLeaf: true })
      
    } else {
      let item = this.getTreeItemFromKey(info);
      
      if (!item.children) {
        item.children = [{ name: 'New File', key: info.node.props.eventKey + '-0', isLeaf: true }];
      } else {
        item.children.push({ name: 'New File', key: info.node.props.eventKey + '-' + item.children.length, isLeaf: true });
      }
    }

    this.forceUpdate();
  }

  delete = (info) => {
    this.hideContextMenu();
    let data = this.getParentTreeItemFromKey(info);
    let arr = data.root ? data.parent : data.parent.children;

    for (let i=0; i<arr.length; i++) {
      if (arr[i].key == data.key) {
        arr.splice(i, 1);
        i -= 1;
      } else {
        arr[i].key = (data.root ? 0 : data.parent.key) + '-' + i;
      }
    }
    
    if (!data.root && arr.length === 0) {
      delete data.parent.children;
    }

    console.log(this.state.treeData);
    this.forceUpdate();
  }

  rename = (info) => {
    this.hideContextMenu();

    let item = this.getTreeItemFromKey(info);
    this.setState({ showModal: true, item: item });
  }

  changeName = () => {
    let { item, newName } = this.state;

    item.name = newName;
    this.setState({ showModal: false });
  }

  closeModal = () => {
    this.setState({ showModal: false });
  }

  renderContextMenu(info) {
    this.hideContextMenu();

    let item = this.getTreeItemFromKey(info);

    let menu = (
      <div className="menu-list">
        { !item.isLeaf && <button onClick={() => this.createFolder(info)}>Create Folder</button>}
        { !item.isLeaf && <button onClick={() => this.createFile(info)}>Create File</button>}
        { !item.isLeaf && <button onClick={() => this.delete(info)}>Delete Folder</button>}
        { item.isLeaf && <button onClick={() => this.delete(info)}>Delete File</button>}
        <button onClick={() => this.rename(info)}>Rename</button>
      </div>
    )

    this.toolTip = (
      <Tooltip
        trigger="click"
        placement="bottomRight"
        prefixCls="rc-tree-contextmenu"
        defaultVisible
        overlay={menu}
      >
        <span></span>
      </Tooltip>
    );

    const container = this.getContainer();
    Object.assign(this.cmContainer.style, {
      position: 'absolute',
      left: `${info.event.pageX}px`,
      top: `${info.event.pageY}px`,
    });

    ReactDOM.render(this.toolTip, container);
  }

  render() {
    /* Generate treeNodes */
    const loop = (data) => {
      return data.map((item) => {
        if (item.children) {
          return <TreeNode title={item.name} key={item.key}>{loop(item.children)}</TreeNode>;
        }
        return (
          <TreeNode title={item.name} key={item.key} isLeaf={item.isLeaf}/>
        );
      });
    };

    /* Get treeNodes based on tree data */
    const treeNodes = loop(this.state.treeData);

    return (
      <div className="row h-100">
        {/* Left side tree */}
        <div className="col-4 file-explorer">
          <h2 className="text-center">Web-based file browser</h2>

          <div className="float-right">
            <button className="btn btn-primary mr-3" onClick={this.createFolder}>Create Root Folder</button>
            <button className="btn btn-primary" onClick={this.createFile}>Create Root File</button>
          </div>

          <Tree
            onSelect={this.onSelect}
            onRightClick={this.onRightClick}
            selectedKeys={this.state.selectedKeys}
            showLine
            className="mt-5"
          >
            {treeNodes}
          </Tree>
        </div>

        {/* Show list */}
        <div className="col-8">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
              </tr>
            </thead>
            { 
              this.state.item && this.state.item.children && 
              <tbody>
                {
                  this.state.item.children.length ? 
                  this.state.item.children.map(item => (
                    <tr key={item.key}>
                      <td>{item.name}</td>
                      <td>{item.isLeaf ? 'File' : 'Folder'}</td>
                    </tr>
                  )) : ''
                }
              </tbody>
            }
          </Table>
        </div>

        <Modal show={this.state.showModal} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>Change name</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input type="text" className="w-100" onChange={e => this.setState({newName: e.target.value})}></input>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModal}>
              Close
            </Button>
            <Button variant="primary" onClick={this.changeName}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default FileTree;