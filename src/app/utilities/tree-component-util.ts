export class TreeComponentUtilityFunctions {
  // tslint:disable:no-trailing-whitespace max-line-length prefer-template
  formHeaderLabel(node: any, keytoStoreHeader: any, keytoStoreNodeType?: any) {
    keytoStoreHeader.push(node.data.name);
    if (keytoStoreNodeType && node.data.node_id) {
      keytoStoreNodeType.push(node.data.node_id);
    }
    if (node.realParent) {
      this.formHeaderLabel(node.realParent, keytoStoreHeader, keytoStoreNodeType);
    }
  }
    /**
   * ParentId to return the data
   * @param node Node data that needs to return its parent data
   */
  returnParentData(node: any) {
    try {
      let new_node = node;
      while (!new_node.data.parent_id) {
        new_node = new_node.parent;
      }
      return new_node.data;
    } catch (error) {
      console.error(error);
    }
  }
    /**
    * Recersive function to CLear tree from Selection
    * @param node Parent Nodes of tree
    */
  unCheckAllNodes(node: any) {
    try {
      for (let ind = 0; ind < node.length; ind++) {
        if (node[ind].isChecked) {
          node[ind].isChecked = false;
          node[ind]['indeterminate'] = false;
        }
        if (node[ind].children) {
          this.unCheckAllNodes(node[ind].children);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
    /**
       * Passnode parent data
       * @param node Pass node.parent of an instance
       */
  public updateParentNodeCheckbox(node: any) {
    try {
      if (!node) {
        return;
      }
      let noChildChecked = true;
      for (const child of node.children) {
        if (child.data.isChecked) {
          noChildChecked = false;
        }
      }
      if (noChildChecked) {
        node.data.isChecked = false;
        node.data['indeterminate'] = false;
      } else {
        node.data.isChecked = true;
        node.data['indeterminate'] = true;
      }
      this.updateParentNodeCheckbox(node.parent);
    } catch (error) {
      console.error(error);
    }
  }
    /**
     * REcersive function to auto populate the Selected nodes
     * @param node Node list
     * @param selectedNodes Selected node_id
     */
  checkNodesofATree(node: any, selectedNodes: any) {
    try {
      for (let ind = 0; ind < node.length; ind++) {
        if (selectedNodes) {
          for (let jind = 0; jind < selectedNodes.length; jind++) {
            if (selectedNodes[jind] && node[ind].node_id === selectedNodes[jind].node_id) {
              node[ind].isChecked = true;
            }
          }
        }
        if (node[ind].children) {
          this.checkNodesofATree(node[ind].children, selectedNodes);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  updateSelectedNodeParentState(nodes: any, selectedNodes: any) {
    try {
      if (selectedNodes) {
        if (selectedNodes !== '' && selectedNodes.length !== 0 && selectedNodes[0].node_id === selectedNodes[0].parent_id) {
          return;
        }
      }
      this.updateSelectedNodeParent(nodes);
    } catch (error) {
      console.error(error);
    }
  }

  updateSelectedNodeParent(node: any) {
    try {
      if (!node) {
        return;
      }
      if (node.children) {
        this.updateSelectedNodeParent(node.children);
        this.updateSelectedNodeParentCheckBox(node);
      } else {
        for (const element of node) {
          if (element && element.children) {
            this.updateSelectedNodeParent(element.children);
            this.updateSelectedNodeParentCheckBox(element);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
    /**
     * Passnode parent data
     * @param node Pass node.parent of an instance
     */
  public updateSelectedNodeParentCheckBox(node: any) {
    try {
      if (!node) {
        return;
      }
      let noChildChecked = true;
      for (const child of node.children) {
        if (child['isChecked'] || child['indeterminate']) {
          noChildChecked = false;
        }
      }
      if (noChildChecked) {
        node['isChecked'] = node.hasOwnProperty('isChecked') ? node['isChecked'] : false;
        node['indeterminate'] = false;
      } else {
        node['isChecked'] = node.hasOwnProperty('isChecked') ? node['isChecked'] : true;
        node['indeterminate'] = true;
      }
      this.updateSelectedNodeParentCheckBox(node.parent);
    } catch (error) {
      console.error(error);
    }
  }
}
