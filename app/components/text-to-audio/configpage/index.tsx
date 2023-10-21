import { useTextToSpeechConfig } from "@/store/text-to-speech-config";
import { Button, Form, Input, List, Select, Space, Switch, Table } from "antd"
import { ChangeEvent } from "react";


function ConfigPage() {
    const [form] = Form.useForm();
    const { audioConfig, update } = useTextToSpeechConfig();

    const switchChange = (value:boolean) => {
        update(config=> config.audioConfig.autoplay = value);
    }

    const auditionChang = (event: ChangeEvent<HTMLInputElement>) => {
        update(config=> config.audioConfig.audition = event.target.value);
    }

    const downloadChange = (value: string) => {
        update(config => config.audioConfig.download = value)
    }

    return (
        <>
            <Form name="audioConfig" form={form} initialValues={{ autoplay: audioConfig.autoplay, audition: audioConfig.audition, download: audioConfig.download }} >
                <Form.Item label="自动播放" name="autoplay" tooltip="生成语音后是否自动播放音频" valuePropName="checked">
                    <Switch onChange={switchChange} />
                </Form.Item>
                <Form.Item label="下载格式" name="download" tooltip="默认下载格式为.mp3">
                    <Select style={{ width: 250 }}
                        onChange={downloadChange}
                        options={[
                            {
                                label: "mp3",
                                value: '.mp3'
                            },
                            {
                                label: "wav",
                                value: '.wav'
                            },
                            {
                                label: "ogg",
                                value: '.ogg'
                            },
                            {
                                label: "webm",
                                value: '.webm'
                            },
                            {
                                label: "silk",
                                value: '.silk'
                            },
                        ]}
                    />
                </Form.Item>
                <Form.Item label="试听文本" name="audition"  tooltip="试听时的文案">
                    <Input onChange={auditionChang} style={{ width: 250 }} />
                </Form.Item>
            </Form>

            <List
                header="自定义语音配置表"
                dataSource={[{ id: 1, name: "哦哟", data: { language: 'zh', style: 'bbb' } }]}
                style={{ paddingRight: 20 }}
                renderItem={(item) => (
                    <List.Item key={item.id}>
                        <List.Item.Meta
                            title={item.name}
                            description={<>
                                <span>语言: {item.data.language}</span>
                                <span>样式: {item.data.style}</span>
                            </>}
                        />
                        <div>
                            <a style={{ marginRight: 5 }}>修改</a>
                            <a >删除</a>
                        </div>
                    </List.Item>
                )}
            />

        </>
    )
}

export default ConfigPage