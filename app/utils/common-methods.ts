import JSZip from 'jszip'
import FileSaver from 'file-saver'


/** 将多文件打包在 zip 文件 */
export const zipFileByBlobUrl = (downloadList: any[], format: string) => {
    return new Promise(async (resolve) => {
        if (!downloadList.length) return console.error("请传入数组");
        const zip = new JSZip();
        // 使用 Promise.all 来并行获取所有的 Blob 数据
        const blobs = await Promise.all(downloadList.map((item) => fetch(item.blobUrl).then((res) => res.blob())));
        // 将每个 Blob 数据添加到 zip 文件中
        blobs.forEach((blob, index) => {
            zip.file(`${downloadList[index].fileName.replace(/\.txt/, format)}`, blob);
        });
        zip.generateAsync({ type: 'blob' }).then(content => {
            const date = new Date().getTime()
            FileSaver.saveAs(content, `合成语音批量下载_${date}.zip`)
            resolve(undefined)
        })
    })
}

/** 下载音频文件 */
export const downloadAudioFile = (src: string, fileName: string) => {
    if (src) {
        let a = document.createElement('a');
        a.href = src;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
        }, 0)
    }
}

/** 文案进行分片 */
export const splitText = (text: string, length = 400) => {
    const punctuation = [",", ".", "...", "?", "!", "，", "。", "？", "！", "”", "\n"];
    const result = [];
    let start = 0;
    let end = length;
    while (start < text.length) {
        let content = text.substring(start, end);
        let lastChar = content.charAt(content.length - 1);
        if (!punctuation.includes(lastChar)) {
            let lastIndex = -1;
            for (let i = content.length - 1; i >= 0; i--) {
                if (punctuation.includes(content.charAt(i))) {
                    lastIndex = i;
                    break;
                }
            }
            if (lastIndex !== -1) {
                content = content.substring(0, lastIndex + 1);
                end = start + lastIndex + 1;
            } else {
                let nextChar = text.charAt(end);
                if (punctuation.includes(nextChar)) {
                    content = content + nextChar;
                    end++;
                }
            }
        }
        result.push({
            buffer: Array.from(content),
            content: content,
            start: start,
            end: end
        });
        start = end;
        end += length;
    }
    return result;
}

/**
 * 随机生成 11 位字符串
 */
export const randomStr = () => {
    return Math.random().toString(36).substring(2);
};

/** 处理文件转流 */
export const handleFileToStream = (fileData: File) =>
    new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const fileData = event.target?.result;
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(fileData);
                    controller.close();
                }
            });
            resolve(stream);
        };
        reader.readAsArrayBuffer(fileData);
    })

/** 获取文件头信息并转成对应的字符串 */
export const getFileHeader = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            const arr = new Uint8Array(reader.result as ArrayBuffer);
            const asciiArray: string[] = [];

            for (let i = 0; i < arr.length; i++) {
                const asciiChar = String.fromCharCode(arr[i]);
                asciiArray.push(asciiChar);
            }

            resolve(asciiArray as any);
        };

        reader.onerror = reject;

        reader.readAsArrayBuffer(file);
    });
}

/** 判断和添加 RIFF WAVE fmt头 */
export async function checkAndAddWaveFmtHeader(file: File): Promise<File> {
    // 创建一个 FileReader 以读取文件内容
    const reader = new FileReader();

    return new Promise<File>((resolve, reject) => {
        reader.onload = () => {
            if (reader.result) {
                const buffer = new Uint8Array(reader.result as ArrayBuffer);
                const header = new DataView(buffer.buffer, 0, 4);

                // 检查文件头是否包含 "RIFF" 标识
                if (String.fromCharCode(header.getUint8(0), header.getUint8(1), header.getUint8(2), header.getUint8(3)) === "RIFF") {
                    // 包含 RIFF WAVE fmt 头，直接返回文件
                    resolve(file);
                } else {
                    // 如果不包含，添加 RIFF WAVE fmt 头
                    const newHeader = new Uint8Array(44); // 新的头部，通常是44字节
                    newHeader.set([82, 73, 70, 70], 0); // "RIFF"
                    newHeader.set([36, 0, 0, 0], 4); // 文件长度（占位）
                    newHeader.set([87, 65, 86, 69], 8); // "WAVE"
                    newHeader.set([102, 109, 116, 32], 12); // "fmt "
                    newHeader.set([16, 0, 0, 0], 16); // 子块大小
                    newHeader.set([1, 0], 20); // 音频格式（PCM）
                    newHeader.set([1, 0], 22); // 声道数
                    newHeader.set([64, 61, 0, 0], 24); // 采样率（44100 Hz）
                    newHeader.set([128, 62, 2, 0], 28); // 每秒字节数（176400）
                    newHeader.set([2, 0, 16, 0], 32); // 块对齐
                    newHeader.set([16, 0], 34); // 每样本位数
                    newHeader.set([100, 97, 116, 97], 36); // "data"
                    newHeader.set([0, 0, 0, 0], 40); // 数据大小（占位）


                    // 合并新头部和文件内容
                    const newBuffer = new Uint8Array(newHeader.length + buffer.length);
                    newBuffer.set(newHeader, 0);
                    newBuffer.set(buffer, newHeader.length);

                    // 创建新的 Blob 对象并返回
                    const newBlob = new Blob([newBuffer], { type: file.type });

                    // 创建新的 File 对象并返回
                    const newFile = new File([newBlob], file.name, { type: file.type });
                    resolve(newFile);
                }
            } else {
                reject(new Error("文件读取失败"));
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        // 读取文件的前4字节
        reader.readAsArrayBuffer(file);
    });
}
