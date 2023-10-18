import { createWorker } from 'tesseract.js';


/**
 * 读取文件内容方法
 * @param file 
 */
export const readTxtContent = (file: File) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8')
        let txt = "";

        reader.onload = (ev) => {
            const content = ev.target?.result;
            txt += content;
            resolve(txt);
        }
    })

/**
 * 使用 tesseract 识别文字
 * @param file 
 * @returns 
 */
export const readImageToText = (file: any) =>
    new Promise(async (resolve, reject) => {
        const worker = await createWorker({
            logger: m => console.log(m),
            langPath: "/assets/model",
            gzip: false
        })

        await worker.loadLanguage('chi_sim');
        await worker.initialize('chi_sim');

        const { data: { text } } = await worker.recognize(file.originFileObj);
        console.log(text);
        await worker.terminate();

    })

/**
 * 将 ArrayBuffer 转成 Url
 * @param array 
 * @returns URL
 */
export const arrayBufferToAudio = (buffer:any) =>
    new Promise((resolve, reject) => {
        try {
            let binary = '';
            let bytes = new Uint8Array(buffer);
            let len = bytes.byteLength;
            console.log("请求接口传入的", bytes, len)
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            console.log("转换的结束：",binary,  btoa(binary));
            // return window.btoa(binary);
            
            resolve(window.btoa(binary));

            // var blob = new Blob([buffer], { type: "audio/wav" });
            // var url = URL.createObjectURL(blob);
            // resolve(url)
        } catch (error) {
            reject({ status: 401, message: '生成url失败：' + error })
        }
    })