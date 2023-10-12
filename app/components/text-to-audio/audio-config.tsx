import { Button, Col, Dropdown, Input, InputNumber, MenuProps, Modal, Row, Select, Slider } from 'antd';
import React, { useState } from 'react'
import { Form } from 'antd';

function AudioConfig(props:any) {
    const [form] = Form.useForm();
    const [speedValue, setSpeedValue] = useState(1)
    const [toneValue, setToneValue] = useState(1)
    const { confirm } = Modal;
  
    const onMenuClick: MenuProps['onClick'] = async (e) => {
      console.log('click', e);
      // imageToText()
    };
  
    // 语速
    const onSpeedChange = (newValue: number) => {
      setSpeedValue(newValue)
    }
  
    // 音调
    const onToneChange = (newValue: number) => {
      setToneValue(newValue)
    }
  
    // 保存配置
    const saveConf = () => {
      confirm({
        title: '确定要保存此份配置吗？',
        icon: null,
        content: <>
          <Form.Item label="自定义配置名称">
            <Input />
          </Form.Item>
        </>,
        onOk() {
          console.log('OK');
        },
      });
    }
  
    const items = [
      {
        key: '1',
        label: '1st item',
      },
      {
        key: '2',
        label: '2nd item',
      },
      {
        key: '3',
        label: '3rd item',
      },
    ];
  
    return (
      <Form form={form} labelCol={{ span: 4 }}>
        <Form.Item label="语言">
          <Select />
        </Form.Item>
        <Form.Item label="角色">
          <Select />
        </Form.Item>
        <Form.Item label="风格" >
          <Select />
        </Form.Item>
        <Form.Item label="情感">
          <Select />
        </Form.Item>
        <Form.Item label="语速" name="speed">
          <Row>
            <Col span={18}>
              <Slider
                min={0.1}
                max={2.5}
                step={0.01}
                value={speedValue}
                onChange={onSpeedChange}
              />
            </Col>
            <Col span={6}>
              <InputNumber style={{ width: "100%" }}
                min={0.1}
                max={2.5}
                step={0.01}
                value={speedValue}
                onChange={(value) => onSpeedChange(Number(value))}
              />
            </Col>
          </Row>
  
        </Form.Item>
        <Form.Item label="音调" name="tone">
          <Row>
            <Col span={18}>
              <Slider
                min={0.1}
                max={2.5}
                step={0.01}
                value={toneValue}
                onChange={onToneChange}
              />
            </Col>
            <Col span={6}>
              <InputNumber style={{ width: "100%" }}
                min={0.1}
                max={2.5}
                step={0.01}
                value={toneValue}
                onChange={(value) => onToneChange(Number(value))}
              />
            </Col>
          </Row>
        </Form.Item>
  
        <Form.Item >
          <div style={{ display: 'flex', justifyContent: "space-between" }}>
            <Button type="primary" > 生成配音 </Button>
            <Dropdown.Button style={{ width: "unset" }} menu={{ items, onClick: onMenuClick }} onClick={saveConf}>保存当前配置</Dropdown.Button>
          </div>
        </Form.Item>
      </Form>
    )
}

export default AudioConfig