import React, {Component} from 'react';
import axios from "axios";
import { Spin } from "antd";
import { feature } from "topojson-client";
import { geoKavrayskiy7 } from 'd3-geo-projection';
import { geoGraticule, geoPath } from 'd3-geo';
import { select as d3Select } from 'd3-selection';
import { schemeCategory10 } from "d3-scale-chromatic";
import * as d3Scale from "d3-scale";
import { timeFormat as d3TimeFormat } from "d3-time-format";
import { WORLD_MAP_URL, SATELLITE_POSITION_URL, SAT_API_KEY } from "../constants";

const width = 960;
const height = 600;

class WorldMap extends Component {
    constructor() {
        super();
        this.state = {
            isLoading: false,
            isDrawing: false
        }
        this.map = null;
        this.color = d3Scale.scaleOrdinal(schemeCategory10);
        this.refMap = React.createRef();//显示canves的位置
        this.refTrack = React.createRef();
    }

    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then( res => {
                if (res.status === 200) {
                    //console.log(res.data)
                    const {data} = res;
                    const land = feature(data, data.objects.countries).features; //get land data
                    //generate a map
                    this.generateMap(land);
                }
            })
            .catch( err => {
                console.log('err in fecth world map data ', err)
            })
    }

    //如果我们更新过satData, 我们是通过copy原来的selected sats赋给satData, 因此我们可以通过两个obj ref比较判断是否更新过
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.satData !== this.props.satData) {
            //step 1: get observer data from props.observerData
            const {latitude, longitude, elevation, altitude, duration} = this.props.observerData;

            this.setState({isLoading: true});

            //step 2: for each sat to get id from props.satData
            //step 3: for each sat to get its position
            //异步请求，但是要保证response和request一一对应 => axios promise.all
            //step 4: display each position on the map
            const endTime = duration * 60; //speed up

            const urls = this.props.satData.map(sat => {
                const { satid } = sat;
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${SAT_API_KEY}`;

                return axios.get(url);
            });

            Promise.all(urls)
                .then(res => {
                    //console.log(res);
                    const arr = res.map(sat => sat.data);
                    this.setState({
                        isLoading: false,
                        isDrawing: true
                    });

                    //case 1: still drawing => wait
                    //case 2: done drawing => draw
                    if (!prevState.isDrawing) {
                        //draw
                        this.track(arr);
                    } else {
                        //wait
                        const oHint = document.getElementsByClassName("hint")[0];
                        oHint.innerHTML =
                            "Please wait for these satellite animation to finish before selection new ones";
                    }
                })
                .catch(e => {
                    console.log("err in fetch satellite position -> ", e.message);
                });
        }
    }

    track = data => {
        if (!data[0].hasOwnProperty("positions")) {
            throw new Error("no position data");
            return;
        }

        //draw

        const len = data[0].positions.length;
        //display time on the overlay
        const { duration } = this.props.observerData;
        const { context2 } = this.map;

        let now = new Date(); //time 0

        let i = 0; //data index start

        let timer = setInterval(() => {
            let ct = new Date();

            let timePassed = i === 0 ? 0 : ct - now;
            let time = new Date(now.getTime() + 60 * timePassed);

            //display time
            context2.clearRect(0, 0, width, height);

            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 20);

            if (i >= len) {
                clearInterval(timer);
                this.setState({ isDrawing: false });
                const oHint = document.getElementsByClassName("hint")[0];
                oHint.innerHTML = "";
                return;
            }

            //for each position, dot on the map
            data.forEach(sat => {
                const { info, positions } = sat;
                this.drawSat(info, positions[i]);
            });

            i += 60;
        }, 1000);
    };

    drawSat = (sat, pos) => {
        const { satlongitude, satlatitude } = pos;

        if (!satlongitude || !satlatitude) return;

        const { satname } = sat;
        const nameWithNumber = satname.match(/\d+/g).join("");

        const { projection, context2 } = this.map;
        const xy = projection([satlongitude, satlatitude]);

        context2.fillStyle = this.color(nameWithNumber);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);
        context2.fill();

        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(nameWithNumber, xy[0], xy[1] + 14);
    };

    render() {
        const {isLoading} = this.state;
        return (
            <div className="map-box">
                {isLoading ? (
                    <div className="spinner">
                        <Spin tip="Loading..." size="large" />
                    </div>
                ) : null}
                <canvas className="map" ref={this.refMap} />
                <canvas className="track" ref={this.refTrack} />
                <div className="hint" />
            </div>
        );
    }

    generateMap = land => {
        //step 1: get world map shape by projection
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(.1);


        //step 2: get the canvas and pen
        //map canvas
        const canvas = d3Select(this.refMap.current)
            .attr("width", width)
            .attr("height", height);

        //track canvas
        const canvas2 = d3Select(this.refTrack.current)
            .attr("width", width)
            .attr("height", height);

        const graticule = geoGraticule();//用于画经纬线

        const context = canvas.node().getContext("2d");//画2D图
        const context2 = canvas2.node().getContext("2d");

        //step 3: project world map data on the map
        let path = geoPath()
            .projection(projection)
            .context(context);

        land.forEach(ele => {
            //画陆地
            context.fillStyle = '#B3DDEF';//填充颜色
            context.strokeStyle = '#000'; //画笔颜色
            context.globalAlpha = 0.7;
            context.beginPath();
            path(ele);
            context.fill();
            context.stroke();

            //画经纬线
            context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();

            //画上下边界
            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline());
            context.stroke();
        })
        this.map = {
            projection: projection,
            graticule: graticule,
            context: context,
            context2: context2
        };
    }
}

export default WorldMap;