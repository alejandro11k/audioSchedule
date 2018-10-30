export class ScheduleModule {
    constructor() {
        this.context = null
        this.sl = null
    }

    script1() {
        this.createContextAndGainNode()
        let s1 = new Schedule(120, 4, 3)
        let s2 = new Schedule(60, 3, 1)
        let s3 = new Schedule(90, 3, 2)

        this.sl = new ScheduleList(s1)
        this.sl.addNext(s2)
        this.sl.addNext(s3)

        console.log(this.sl)

        this.play()
    }

    script2() {
        this.createContextAndGainNode()
        let s1 = new Schedule(120, 4, 3)
        let s2 = new Schedule(60, 3, 1)
        let s3 = new Schedule(90, 3, 2)

        this.sl = new ScheduleList(s1)
        this.sl.addNext(s2)
        this.sl.addNext(s3)

    }

    script3() {
        this.play()
    }

    script2and3() {
        this.script2()
        this.script3()
    }

    play() {
        this.context.audioWorklet.addModule('./minprocessor.js').then(() => {
            this.sl.execute(this.context)
        })
    }

    createContextAndGainNode() {
        this.context = new AudioContext()
    }

}

export class ScheduleList {
    constructor(schedule) {
        this.schedule = schedule
        this.nextSchedule = null
    }

    addNext(schedule) {
        if(this.lastSchedule()) {
            this.nextSchedule = new ScheduleList(schedule)
        } else {
            this.nextSchedule.addNext(schedule)
        }
        
    }

    execute(audioNode) {
        this.schedule.execute(audioNode)
        console.log(this.schedule)
        console.log(this.schedule.timeList)
        if(!this.lastSchedule()){
            this.nextSchedule.schedule.reInitialize(this.schedule.getLatsBeat())
            this.nextSchedule.execute(audioNode)
        }
    }

    lastSchedule() {
        return this.nextSchedule===null
    }
}

export class Schedule {
    constructor(bpm, seconds, pitch) {
        this.bpm = bpm
        this.seconds = seconds
        this.lastBeat = 0
        this.start = 0
        this.pitch = pitch
        this.timeList = this.calculateTimeList(bpm, seconds, this.start)
    }

    execute(audioNode) {
        this.timeList.forEach(element => {
            this.playBeat(element,audioNode)
        });
    }

    playBeat (time, audioContext) {
        var startTime = time
        var endTime = time + 0.1
        var pitch = this.pitch
        
        var oscillator = audioContext.createOscillator()
        oscillator.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(pitch * 220, startTime)
        
        oscillator.start(startTime)
        oscillator.stop(endTime)
    }

    reInitialize(start) {
        this.setStart(start)
        this.timeList = this.calculateTimeList(this.bpm, this.seconds, start)
    }

    setStart(start) {
        this.start = start
    }

    getLatsBeat() {
        return this.lastBeat
    }

    calculateTimeList(bpm, seconds) {
        const timeList = []

        const delay = this.bpm2seg(bpm)
        const beats = this.seconds2Beats(seconds, delay)
        let beat = this.start - delay
        
        for (let times = 1; times < beats+1; times++) {
            beat = beat + delay
            timeList.push(beat)
        }

        this.lastBeat = beat + delay

        return timeList
    }

    bpm2seg(bpm) {
        const second = (60 / bpm);
        return second
    }

    minutes2Beats(minutes, delay) {
        const seconds = minutes * 60
        const times = seconds / delay
        return times 
    }

    seconds2Beats(seconds, delay) {
        const times = seconds / delay
        return times 
    }
}
