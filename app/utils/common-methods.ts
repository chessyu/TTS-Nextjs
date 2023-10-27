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

/** 判断和添加 RIFF WAVE fmt头 */
export const checkAndAddWaveFmtHeader = async(file:File):Promise<File> => {
    // 读取文件数据
    const fileData = await readFileData(file);

    // 检查文件是否包含RIFF WAVE fmt头
    const hasWaveFmtHeader = checkWaveFmtHeader(fileData);

    // 如果文件已经包含RIFF WAVE fmt头，则直接返回原始File对象
    if (hasWaveFmtHeader) {
        return file;
    }

    // 创建新的DataView对象，用于操作二进制数据
    const dataView = new DataView(fileData);

    // 创建一个新的DataView对象，用于存储添加了RIFF WAVE fmt头的二进制数据
    const newDataView = new DataView(new ArrayBuffer(dataView.byteLength + 36));

    // 将RIFF标识写入新的DataView
    newDataView.setUint32(0, 0x52494646, true); // RIFF

    // 写入文件大小（不包括RIFF标识和文件大小本身的4个字节）
    newDataView.setUint32(4, dataView.byteLength + 36 - 8, true);

    // 将WAVE标识写入新的DataView
    newDataView.setUint32(8, 0x57415645, true); // WAVE

    // 将fmt标识写入新的DataView
    newDataView.setUint32(12, 0x666d7420, true); // fmt 

    // 写入fmt块大小（16个字节）
    newDataView.setUint32(16, 16, true);

    // 将原始文件数据复制到新的DataView中
    for (let i = 0; i < dataView.byteLength; i++) {
        newDataView.setUint8(i + 36, dataView.getUint8(i));
    }

    // 创建一个新的Blob对象，包含添加了RIFF WAVE fmt头的文件数据
    const newFileData = new Blob([newDataView], { type: file.type });
    const newFile = new File([newFileData], file.name, { lastModified: file.lastModified, type: file.type });

    return newFile;
}

/** 读取 File 文件 转 ArrayBuffer */
export const readFileData = (file:File) : Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

/** 判断 音视频是否包含 RIFF WAVE fmt头 */
export const checkWaveFmtHeader = (fileData: ArrayBuffer) : boolean => {
    const dataView = new DataView(fileData);
    debugger
    // 检查文件是否以RIFF标识开头
    if (dataView.getUint32(0, true) !== 0x52494646) {
        return false;
    }

    // 检查文件是否以WAVE标识紧随RIFF标识之后
    if (dataView.getUint32(8, true) !== 0x57415645) {
        return false;
    }

    // 检查文件是否以fmt标识紧随WAVE标识之后
    if (dataView.getUint32(12, true) !== 0x666d7420) {
        return false;
    }

    return true;
}



export const getFileHeader = (file: File) : Promise<string> => {
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