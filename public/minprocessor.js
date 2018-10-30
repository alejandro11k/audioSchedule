class Processor extends AudioWorkletProcessor {
    constructor() {
        super();
    }

    process(inputs, outputs){
        /* process audio */
        let input = inputs[0];
        let output = outputs[0];
        
        for (let channel = 0; channel < input.length; ++channel){
            output[channel].set(input[channel]);
        }
        
        return true;
    }
}

registerProcessor('processor', Processor);