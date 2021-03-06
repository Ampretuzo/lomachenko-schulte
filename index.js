// *******************
// utils

function straightArray(size) {
    const resultArray = [];
    for (let i = 0; i < size * size; i++) {
        resultArray.push(i + 1);
    }
    return resultArray;
}

function straightNullArray (size) {
    const resultArray = [];
    for (let i = 0; i < size * size; i++) {
        resultArray.push(null);
    }
    return resultArray;
}

// lifted from: https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
    var m = array.length,
        t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

function makeTable(numbers) {
    const size = Math.sqrt(numbers.length),
        result = [];
    for (let i = 0; i < size; i++) {
        result.push([]);
        for (let j = 0; j < size; j++) {
            result[i].push(numbers[i * size + j]);
        }
    }
    return result;
}

function tableIsEmpty (tableArray) {
    if (!tableArray) return true;
    if (!tableArray[0][0]) return true;
    return false;
}

// lifted and adapted from: https://stackoverflow.com/a/7114339/7567275
function getAllDays(dateStart, dateEnd) {
    if (dateEnd < dateStart) {
        return [];
    }
    const days = [dateStart]
    dayInMs = 86400000 //24h
    for (var ms = dateStart.getTime() + dayInMs; ms <= dateEnd.getTime(); ms = ms + dayInMs) {
      days.push(new Date(ms))
    }
    return days;
}

// *******************
// storage

function dateStringRepresentation(date) {
    if (!date) return null
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()
    return `${year}-${month}-${day}`
}

const storage = {
    pushResult: function (playTimeInMillis) {
        const currentDate = new Date()
        const currentDateAsKey = dateStringRepresentation(currentDate)
        let existingEntryInLocalStorage = localStorage.getItem(currentDateAsKey)
        if (!existingEntryInLocalStorage) {
            localStorage.setItem(currentDateAsKey, '')
            existingEntryInLocalStorage = ''
        }
        const updatedEntryInLocalStorage = 
            existingEntryInLocalStorage === '' ? 
                playTimeInMillis : existingEntryInLocalStorage + ',' + playTimeInMillis
        localStorage.setItem(currentDateAsKey, updatedEntryInLocalStorage)
    },
    getAveraged(dateStart, dateEnd, numberOfLastTries) {
        const daysAsKeys = getAllDays(dateStart, dateEnd).map(function (date) {
            return dateStringRepresentation(date)
        })
        function calculateAverage (dayAsKey) {
            const entryInLocalStorage = localStorage.getItem(dayAsKey)
            if (!entryInLocalStorage || entryInLocalStorage === '') return null
            const triesInMs = entryInLocalStorage.split(',').map(Number)
            const lastTriesInMs = triesInMs.slice( -1 * numberOfLastTries)
            const average = lastTriesInMs.reduce(function (sum, playDurationInMillis) {
                return sum + playDurationInMillis
            }, 0) / lastTriesInMs.length
            return average
        }
        const averagesForEachDay = daysAsKeys.map(calculateAverage, this)
        return averagesForEachDay
    }
}

// *******************
// main

Vue.component('loma-schulte__table__correctness-indicator', {
    props: ['counter', 'correct', 'hintTimeoutInMillis'],
    watch: {
        counter: 'showHint'
    },
    data: function () {
        return {
            correctnessHintTimeIsUp: true
        }
    },
    mounted: function () {this.showHint() },
    methods: {
        showHint: function () {
            this.correctnessHintTimeIsUp = false
            const vm = this
            setTimeout(function () {
                vm.correctnessHintTimeIsUp = true
            }, this.hintTimeoutInMillis)
        }
    },
    template: 
        `<div 
            class="loma-schulte__table__correctness-indicator"
            :class="{
                'loma-schulte__table__correctness-indicator--no-hint': correctnessHintTimeIsUp,
                'loma-schulte__table__correctness-indicator--correct': correct,
                'loma-schulte__table__correctness-indicator--incorrect': !correct 
            }">
            {{correctnessHintTimeIsUp ? '...' : (correct ? '✓' : '✕') }}
        </div>`
})

const DELAY_PER_NUMBER_IN_MS = 3

Vue.component('loma-schulte__table__tile', {
    props: {number: Number, numberPressCallback: Function},
    watch: {
        number: function (newNumberVal, oldNumberVal) {
            if (!oldNumberVal && newNumberVal) {
                const vm = this
                setTimeout(function () {
                    vm.numberAsStringToDisplayWhenNeeded = newNumberVal
                }, DELAY_PER_NUMBER_IN_MS * newNumberVal)
            } else {
                this.numberAsStringToDisplayWhenNeeded = newNumberVal
            }
        }
    },
    data: function () {
        return {
            numberAsStringToDisplayWhenNeeded: null
        }
    },
    template: 
        `<div 
            class="loma-schulte__table__tile unselectable-text"
            @click="numberPressCallback" > 
            {{numberAsStringToDisplayWhenNeeded}}
        </div>`
})

Vue.component('loma-schulte__table', {
    props: {
        randomTableNumbers:  Array,
        playFinishedCallback: Function
    },
    methods: {
        numberPressed: function (number) {
            if (!this.playerStarted) this.playerStarted = true
            this.playerTriesCounter ++
            if (number === this.correctNumber) {
                // console.log('correct: ' + this.correctNumber);
                this.correctNumber ++;
                this.playerLastGuessCorrect = true;
            } else {
                this.playerLastGuessCorrect = false;
                this.playerNumberOfMistakes ++
                // console.log('not correct, is ' + number + ' should be ' + this.correctNumber)
            }
            const lastNumberToFinish = this.size ** 2
            if (lastNumberToFinish === this.correctNumber - 1) {
                this.finishThePlay()
            }
        },
        startThePlay: function () {
            this.playStartTime = new Date().getTime()
        },
        finishThePlay: function () {
            const playDurationInMillis = new Date().getTime() - this.playStartTime,
                playerNumberOfMistakes = this.playerNumberOfMistakes
            
            // set whole view to clean state
            this.playStartTime = null
            this.correctNumber = 1
            this.playerStarted = false
            this.playerTriesCounter = 0
            this.playerLastGuessCorrect = null
            this.playStartTime = null
            this.playerNumberOfMistakes = 0
            
            this.playFinishedCallback({
                durationInMillis: playDurationInMillis,
                numberOfMistakes: playerNumberOfMistakes
            })
        }
    },
    data: function () {
        return {
            correctNumber: 1,
            playerStarted: false,
            playerTriesCounter: 0,
            playerLastGuessCorrect: null,
            playerNumberOfMistakes: 0,
            playStartTime: null
        };
    },
    watch: {
        randomTableNumbers: function (newRandomTableNumbers, oldRandomTableNumbers) {
            const isNewPlay = tableIsEmpty(oldRandomTableNumbers) && !tableIsEmpty(newRandomTableNumbers)
            if (isNewPlay) {
                this.startThePlay();
            }
        }
    },
    computed: {
        size: function () {
            if (this.randomTableNumbers.length !== this.randomTableNumbers[0].length) {
                throw '\t!@#: Table is not a square!'
            }
            return this.randomTableNumbers.length
        }
    },
    template: 
        `<div>
        
            <table class="loma-schulte__table">
                <tbody>
                    <tr v-for="numberList in randomTableNumbers">
                        <td v-for="number in numberList" >
                            <loma-schulte__table__tile 
                                :number="number" 
                                :numberPressCallback="function () { numberPressed(number) }" 
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <loma-schulte__table__correctness-indicator 
                v-if="playerStarted"
                :counter="playerTriesCounter" 
                :correct="playerLastGuessCorrect"
                :hintTimeoutInMillis = "400"
            />
            
        </div>`
})

Vue.component('loma-schulte', {
    props: ['size'],
	methods: {
		generate: function () {
			const randomTableNumbersNew = makeTable(shuffle(straightArray(this.size) ) )
            this.generationPermitted = false
			this.randomTableNumbers = randomTableNumbersNew
		},
        playFinished: function (result) {
            const playDurationInSecs = result.durationInMillis / 1000
            const numberOfMistakes = result.numberOfMistakes
            alert(`${playDurationInSecs} sec\n${numberOfMistakes} mistakes`)
            const emptyTable = makeTable(straightNullArray(this.size) )
            this.randomTableNumbers = emptyTable
            this.generationPermitted = true
        }
	},
	data: function () {
        const emptyTable = makeTable(straightNullArray(this.size) )
		return {
            randomTableNumbers: emptyTable,
            generationPermitted: true
		}
	},
    template: 
        `<div class="loma-schulte">
        
    		<div v-if="generationPermitted" @click="generate" class="loma-schulte__generate-button unselectable-text" >
                <div class="loma-schulte__generate-button__text" >
                    generate
                </div>
            </div>
            
    		<loma-schulte__table :randomTableNumbers="randomTableNumbers" :playFinishedCallback="playFinished" />
            
    	</div>`
})

new Vue({
    el: '#game-container'
})
