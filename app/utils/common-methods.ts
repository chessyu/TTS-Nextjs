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

/**
 * @fileoverview 提供文本（如JSON），使用JavaScript创建文件并下载文件
 * @author AcWrong
 * @param {string} textTowrite 
 * @param {string} fileNameToSaveAs 
 * @param {string} fileType 
 */
export const saveTextAsFile = (textTowrite: string, fileNameToSaveAs: string, fileType: string) => {
    //提供文本和文件类型用于创建一个Blob对象
    let textFileAsBlob = new Blob([textTowrite], { type: fileType });
    //创建一个 a 元素
    let downloadLink = document.createElement('a');

    //指定下载过程中显示的文件名
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = 'Download File';
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    //模式鼠标左键单击事件
    downloadLink.click();
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

        reader.onload = async () => {
            const buffer = new Uint8Array(reader.result as ArrayBuffer);
            const header = new DataView(buffer.buffer, 0, 4);
            if (String.fromCharCode(header.getUint8(0), header.getUint8(1), header.getUint8(2), header.getUint8(3)) === "RIFF") {
                // 包含 RIFF WAVE fmt 头，直接返回文件
                if (file.type === 'audio/wav') resolve(file);
                // 其它文件格式转成 wav 
                const transpanent = new File([reader.result as ArrayBuffer], file.name.substring(0, file.name.length - 4) + '.wav', { type: 'audio/wav' });
                resolve(transpanent)
            }
            resolve(convertToWav(file))
        };

        reader.onerror = (error) => {
            reject(error);
        };

        // 读取文件的前4字节
        reader.readAsArrayBuffer(file);
    });
}

// 将音频格式统一转成 wav 格式
function convertToWav(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContext.decodeAudioData(event.target!.result as ArrayBuffer, function (buffer) {
                const wavBlob = bufferToWav(buffer);
                const wavFile = new File([wavBlob], file.name.replace(/\.[^/.]+$/, "") + ".wav", { type: "audio/wav" });
                console.log("PPPPPPPPP", wavFile)
                resolve(wavFile);
            }, reject);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function bufferToWav(buffer: AudioBuffer): Blob {
    const wavData = new DataView(new ArrayBuffer(44 + buffer.length * 2));
    writeString(wavData, 0, "RIFF");
    wavData.setUint32(4, 36 + buffer.length * 2, true);
    writeString(wavData, 8, "WAVE");
    writeString(wavData, 12, "fmt ");
    wavData.setUint32(16, 16, true);
    wavData.setUint16(20, 1, true);
    wavData.setUint16(22, 1, true);
    wavData.setUint32(24, 44100, true);
    wavData.setUint32(28, 44100 * 2, true);
    wavData.setUint16(32, 2, true);
    wavData.setUint16(34, 16, true);
    writeString(wavData, 36, "data");
    wavData.setUint32(40, buffer.length * 2, true);
    floatTo16BitPCM(wavData, 44, buffer.getChannelData(0));
    return new Blob([wavData], { type: "audio/wav" });
}

function writeString(dataView: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        dataView.setUint8(offset + i, string.charCodeAt(i));
    }
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
    for (let i = 0; i < input.length; i++, offset += 2) {
        const sample = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }
}

/** 递归的去修改某些数据 */
export const deepEditAttrs = (maps: any[] = [], objs: (item: any) => any) => {
    if (maps instanceof Array) {
        maps.forEach((keys) => {
            keys = { ...keys, ...objs(keys) };
            if (keys.childList && keys.childList.length) deepEditAttrs(keys.childList, objs);
        })
        return maps;
    }
}

// 从一串字符中取出网址
export const extractUrlFromString = (input: string): string | null => {
    const urlRegex = /https?:\/\/[^\s]+/;
    const match = input.match(urlRegex);
    return match ? match[0] : null;
  }
  