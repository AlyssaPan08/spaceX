import React, {Component} from 'react';
import { List, Avatar, Button, Checkbox, Spin } from "antd";
import satellite from "../assets/images/satellite.svg";

class SatelliteList extends Component {
    state = {
        selected : []
    }
    onChange = e => {
        console.log(e.target);
        //step 1: get current selected bucket
        const { selected } = this.state;
        const { checked, dataInfo } = e.target;
        //step 2: add or remove current selected sat
        const list = this.addOrRemove(dataInfo, checked, selected);
        //step 3: update selected bucket
        this.setState({ selected: list});
    }

    addOrRemove = (item, status, list) => {
        //case 1: check is true
        //   1.1: item not in the list -> add it
        //   1.1: item is in the list  -> do nothing
        //
        //case 2: check is false
        //   2.1: item is in the list  -> remove it
        //   2.1: item not in the list -> do nothing
        //Array.some(callback fn): a build-in method to test whether at least one item in the array
        const found = list.some( entry => entry.satid === item.satid);
        if (status && !found) { //case 1.1
            list = [...list, item]; //return a new list after adding item
        }
        if (!status && found) { //case 2.1
            list = list.filter(entry => entry.satid !== item.satid); //filter保留!= item.satid的item
        }
        return list;
    }

    onShowSatMap = () => {
        //send selected sat list to the Main
        //data passing: child -> parent
        this.props.onShowMap(this.state.selected);//props is read-only
    }

    render() {
        const satList = this.props.satInfo ? this.props.satInfo.above : [];
        const {isLoad} = this.props;
        const { selected } = this.state;
        return (
            <div className="sat-list-box">
                <div className="btn-container">
                    <Button
                        className="sat-list-btn"
                        size="large"
                        onClick={this.onShowSatMap}
                        disabled={selected.length === 0}
                    >Track on the map</Button>
                </div>
                <hr/>

                {
                    isLoad ?
                        <div className="spin-box">
                            <Spin tip="Loading..." size="large" />
                        </div>
                        :
                        <List
                            className="sat-list"
                            itemLayout="horizontal"
                            size="small"
                            dataSource={satList}
                            renderItem={item => (
                                <List.Item
                                    actions={[<Checkbox dataInfo={item} onChange={this.onChange}/>]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar size={50} src={satellite} />}
                                        title={<p>{item.satname}</p>}
                                        description={`Launch Date: ${item.launchDate}`}
                                    />
                                </List.Item>
                            )}
                        />
                }

            </div>

        );
    }
}

export default SatelliteList;