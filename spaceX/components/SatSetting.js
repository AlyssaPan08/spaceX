import React, {Component} from 'react';
import {Form, InputNumber, Button} from "antd";

class SatSettingForm extends Component {
    showSatellite = e => {
        //step 1: collect all fields from the form
        //step 2: send collected data to Main
        e.preventDefault(); //防止点击之后自动提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                //step 2
                this.props.onShow(values);
            }
        })
    }
    render() {
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        console.log(this.props);
        const { getFieldDecorator } = this.props.form;

        return (
            <Form {...formItemLayout}
                  className="sat-setting"
                  onSubmit={this.showSatellite}
            >
                <Form.Item label="Longitude(degree)">
                    {
                        getFieldDecorator("longitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your longitude"
                                }
                            ],
                            initialValue: 70
                        })(<InputNumber min={-180} max={180}
                                        style={{width: "100%"}}
                                        placeholder="Please input Longitude"
                        />)
                    }
                </Form.Item>

                <Form.Item label="Latitude(degrees)">
                    {
                        getFieldDecorator("latitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Latitude",
                                }
                            ],
                            initialValue: -40
                        })(<InputNumber placeholder="Please input Latitude"
                                        min={-90} max={90}
                                        style={{width: "100%"}}
                        />)
                    }
                </Form.Item>

                <Form.Item label="Elevation(meters)">
                    {
                        getFieldDecorator("elevation", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Elevation",
                                }
                            ],
                            initialValue: 100
                        })(<InputNumber placeholder="Please input Elevation"
                                        min={-413} max={8850}
                                        style={{width: "100%"}}
                        />)
                    }
                </Form.Item>

                <Form.Item label="Altitude(degrees)">
                    {
                        getFieldDecorator("altitude", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Altitude",
                                }
                            ],
                            initialValue: 90
                        })(<InputNumber placeholder="Please input Altitude"
                                        min={0} max={90}
                                        style={{width: "100%"}}
                        /> )
                    }
                </Form.Item>

                <Form.Item label="Duration(secs)">
                    {
                        getFieldDecorator("duration", {
                            rules: [
                                {
                                    required: true,
                                    message: "Please input your Duration",
                                }
                            ],
                            initialValue: 10
                        })(<InputNumber placeholder="Please input Duration"
                                        min={0} max={90}
                                        style={{width: "100%"}} />)
                    }
                </Form.Item>

                <Form.Item className="show-nearby">
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{ textAlign: "center" }}
                    >
                        Find Nearby Satellite
                    </Button>
                </Form.Item>

            </Form>
        );
    }
}
const SatSetting = Form.create({ name: 'satellite-setting' })(SatSettingForm);
export default SatSetting;