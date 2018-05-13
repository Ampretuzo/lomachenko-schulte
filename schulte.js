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

Vue.component('schulte-schulte__table__correctness-indicator', {
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
        `<div>
            {{correctnessHintTimeIsUp ? '...' : (correct ? '✓' : 'x') }}
        </div>`
})

Vue.component('schulte-schulte__table__tile', {
    props: {number: Number, numberPressCallback: Function},
    template: '<div @click="numberPressCallback" style="width: 50px; height: 50px;"> {{number}} </div>'
})

Vue.component('schulte-schulte__table', {
    props: ['randomTableNumbers'],
    methods: {
        numberPressed: function (number) {
            if (!this.playerStarted) this.playerStarted = true
            this.playerTriesCounter ++
            if (number === this.correctNumber) {
                console.log('correct: ' + this.correctNumber);
                this.correctNumber ++;
                this.playerLastGuessCorrect = true;
            } else {
                this.playerLastGuessCorrect = false;
                console.log('not correct, is ' + number + ' should be ' + this.correctNumber)
            }
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
            <table>
                <tbody>
                    <tr v-for="numberList in randomTableNumbers">
                        <td v-for="number in numberList" >
                            <schulte-schulte__table__tile 
                                :number="number" 
                                :numberPressCallback="function () { numberPressed(number) }" 
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
            <schulte-schulte__table__correctness-indicator 
                v-if="playerStarted"
                :counter="playerTriesCounter" 
                :correct="playerLastGuessCorrect"
                :hintTimeoutInMillis = "1000"
            />
        </div>`
})

Vue.component('lomachenko-schulte', {
    props: ['size'],
    created: function () {
        this.randomTableNumbers = makeTable(
            shuffle(straightArray(this.size))
        );
    },
    template: '<schulte-schulte__table :randomTableNumbers="randomTableNumbers" />'
})

new Vue({
    el: '#game-container'
})