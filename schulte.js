// *******************
// utils

function straightArray(size) {
    const resultArray = [];
    for (let i = 0; i < size * size; i++) {
        resultArray.push(i + 1);
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

Vue.component('loma-schulte__table__tile', {
    props: {number: Number, numberPressCallback: Function},
    template: 
        `<div 
            class="loma-schulte__table__tile unselectable-text"
            @click="numberPressCallback" > 
            {{number}}
        </div>`
})

Vue.component('loma-schulte__table', {
    props: ['randomTableNumbers'],
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
                // console.log('not correct, is ' + number + ' should be ' + this.correctNumber)
            }
            if (this.size ** 2 === this.correctNumber - 1) alert('win!')
        }
    },
    data: function () {
        return {
            correctNumber: 1,
            playerStarted: false,
            playerTriesCounter: 0,
            playerLastGuessCorrect: null
        };
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
    created: function () {
        this.randomTableNumbers = makeTable(
            shuffle(straightArray(this.size))
        );
    },
	methods: {
		generate: function () {
			const randomTableNumbers = makeTable(
	            		shuffle(straightArray(this.size))
        		);
			console.log(JSON.stringify(randomTableNumbers) )
			this.randomTableNumbers = randomTableNumbers
			this.playStarted = true
		}
	},
	data: function () {
		return {
			playStarted: false
		}
	},
    template: 
        `<div class="loma-schulte">
    		<div 
                @click="generate"
                class="loma-schulte__generate-button unselectable-text" 
                >
                <div class="loma-schulte__generate-button__text" >
                generate
                </div>
            </div>
    		<loma-schulte__table 
    			:randomTableNumbers="randomTableNumbers" 
            	/>
    	</div>`
})

new Vue({
    el: '#game-container'
})
