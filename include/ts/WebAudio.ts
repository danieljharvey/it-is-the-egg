// sets up Web Audio

import { Maybe } from "tsmonad";

interface IAudioBuffer {
    name: string,
    source: AudioBufferSourceNode
}

export class WebAudio {

    public audioReady: boolean = false;

    protected audioContext: AudioContext;
    protected output: AudioNode;
    protected audioBuffers = {}; // object containing a buffer for each game sound

    protected soundPaths = [
        "bright-bell",
        "pop",
        "soft-bell",
        "warp"
    ]

    public init() {
        
        this.audioContext = this.createAudioContext() // create audioContext
        this.output = this.createLimiter(this.audioContext) // create limiter and link up

        const promises = this.fetchSounds(this.soundPaths)

        Promise.all(promises).then(buffers => {       
            this.audioReady = true
        })
    }

    public fetchSounds(soundPaths: string[]) : Array<Promise<IAudioBuffer>> {
        return soundPaths.map(soundName => {
            const path = this.getSoundPath(soundName)
            return this.loadBuffer(soundName, path)
        })
    }

    public createAudioContext() : AudioContext {
        if (this.audioContext) {
            return this.audioContext
        }
        return new ((window as any).AudioContext || (window as any).webkitAudioContext)()
    }

    public createLimiter(audioCtx) {
        // Create a compressor node
        const compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -1;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;
        compressor.connect(audioCtx.destination)
        return compressor
    }

    public playSound(soundName) {
        if (!this.audioReady) {
            return false;
        }
        this.getBuffer(soundName).caseOf({
            just: audioBuffer => audioBuffer.source.start(),
            nothing: () => {
                // console.log("not found")
            }
        })
    }

    public getBuffer(soundName: string): Maybe<IAudioBuffer> {
        const audioBuffer = (Object as any).values(this.audioBuffers).find(name => (name.name === soundName))
        if (audioBuffer) {
            return Maybe.just(audioBuffer)
        }
        return Maybe.nothing()
    }
    
    public getSoundPath(soundName: string) {
        return "/sounds/" + soundName + ".wav"
    }

    public finishedLoading(soundName: string, buffer) : IAudioBuffer {
        const source = this.audioContext.createBufferSource()
        source.buffer = buffer
        source.connect(this.output)
        const audioBuffer = {
            name: soundName,
            source
        }
        return this.audioBuffers[soundName] = audioBuffer
    }
  
    public loadBuffer(soundName: string, url: string) : Promise<IAudioBuffer> {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";
    
            request.onload = () => {
                this.audioContext.decodeAudioData(
                    request.response,
                    buffer => {
                        if (!buffer) {
                            reject("Buffer could not be read!")
                        }
                        const audioBuffer = this.finishedLoading(soundName, buffer)
                        resolve(audioBuffer)
                    },
                    error => {
                        reject(error);
                    }
                )
            }

            request.onerror = () => {
                reject('BufferLoader: XHR error')
            }
            
            request.send();
        })
    }
}