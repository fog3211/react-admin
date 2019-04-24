import React, { Component } from 'react';
import { Row, Col, Card, message } from 'antd';
import Graph from './graph';
import GCalendar from './gcalendar';
import Funnel from './funnel';
import Map from './map';
import Sunburst from './sunburst';
import Service from '@/service';
import './index.less';

export default class Echart extends Component {
    state = {
        all_data: {},
    };
    componentWillMount() {
        Service.getEchartData().then((res) => {
            if (res.code === 1) {
                this.setState({
                    all_data: res.data,
                });
            } else {
                message.error('数据获取失败，请重试');
            }
        });
    }
    render() {
        const { all_data } = this.state;
        return (
            <div>
                <Row gutter={16}>
                    <Col md={12}>
                        <Card title="关系图" className="chart-box">
                            <Graph option={all_data.graph} />
                        </Card>
                    </Col>
                    <Col md={12}>
                        <Card title="漏斗图" className="chart-box">
                            <Funnel option={all_data.funnel}/>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col md={12}>
                        <Card title="地图图表" className="chart-box">
                            <Map option={all_data.map}/>
                        </Card>
                    </Col>
                    <Col md={12}>
                        <Card title="旭日图" className="chart-box">
                            <Sunburst option={all_data.sunburst}/>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col>
                        <Card title="日历坐标系" className="chart-box">
                            <GCalendar option={all_data.gcalendar}/>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}
