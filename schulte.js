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

Vue.component('schulte-table__tile', {
    props: ['number', 'callback'],
    template: '<div @click="callback" style="width: 50px; height: 50px;"> {{number}} </div>'
})

Vue.component('schulte-table', {
    props: ['size'],
    created: function () {

    },
    data: function () {
        return {
            callback: function (number) {
                alert('clicked on ' + number + '!')
            }
        }
    },
    computed: {
        randomTableNumbers: function () {
            const size = this.size,
                numbersTable = makeTable(
                    shuffle(straightArray(size))
                );
            console.log(numbersTable);
            return numbersTable;
        }
    },
    template: '<table>' +
        '<tbody>' +
        '<tr v-for="numberList in randomTableNumbers">' +
        '   <td v-for="number in numberList" >' +
        '       <schulte-table__tile :number="number" :callback="function () {callback(number) }" />' + 
        '   </td>' + 
        '</tr>' +
        '</tbody>' +
        '</table>'
})

new Vue({
    el: '#game-container'
})