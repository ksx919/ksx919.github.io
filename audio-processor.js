// audio-processor.js - 放在 public 目录下
class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.chunkSize = 3200; // 与后端期望的PCM块大小一致
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];

        if (input && input[0]) {
            const inputData = input[0]; // Float32Array

            // 转换 Float32 → Int16
            const int16Data = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32767));
            }

            // 转换为 Uint8Array
            const uint8Data = new Uint8Array(int16Data.buffer);

            // 分块发送
            for (let offset = 0; offset < uint8Data.length; offset += this.chunkSize) {
                const end = Math.min(offset + this.chunkSize, uint8Data.length);
                const chunk = uint8Data.subarray(offset, end);

                // 发送数据到主线程
                this.port.postMessage({
                    type: 'audioData',
                    data: chunk
                });
            }
        }

        return true; // 保持处理器活跃
    }
}

registerProcessor('audio-processor', AudioProcessor);