import moment

const now = new Date();
const then = moment("26-04-2023 20:44:45","dd-MM-yyyy HH:mm:ss")

console.log(then)
console.log(now - then)