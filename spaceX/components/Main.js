import React, {Component} from 'react';
import { Row, Col } from 'antd';
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList"
import axios from 'axios';
import {NEARBY_SATELLITE, SAT_API_KEY, STARLINK_CATEGORY} from "../constants";
import WorldMap from "./WorldMap";

class Main extends Component {
    state = {
        setting: null,
        satInfo: null,
        satList: null, //get selected sat
        isLoadingList: false
    }
    showNearBySatellite = setting => {
        console.log(setting);
        this.setState({setting: setting});
        this.fetchSatellite(setting);
    }
    fetchSatellite= (setting) => {
        //get setting
        //send tht req to the server
        //analyze the res
        //  case 1: success -> send sat list to SatList
        //  case 2: fail -> inform user
        const {latitude, longitude, elevation, altitude} = setting;
        const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;

        this.setState({
            isLoadingList: true
        });

        axios.get(url)
            .then(response => {
                console.log(response.data)
                this.setState({
                    satInfo: response.data,
                    isLoadingList: false
                })
            })
            .catch(error => {
                console.log('err in fetch satellite -> ', error);
            })
    }

    showMap = (selected) => {
        console.log("show on map", selected);
        this.setState({
            satList: [...selected] //copy a array rather than pointing to reference
        })
    }

    render() {
        const {satInfo, isLoadingList, satList, setting } = this.state;

        return (
            <Row className="main">
              <Col span={8} className="left-side">
                  <SatSetting onShow={this.showNearBySatellite}/>
                  <SatelliteList satInfo={satInfo}
                                 isLoad={isLoadingList}
                                 onShowMap={ this.showMap }
                  />
              </Col>
              <Col span={16} className="right-side">
                  <WorldMap satData={satList} //selected sats
                            observerData={setting} //经纬度数据
                  />
              </Col>
            </Row>
        );
    }
}

export default Main;