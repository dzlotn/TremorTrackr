/*
  TremorTrackr
  Owen Powell, Daniel Zlotnick, Lauren Fleming, Angelina Otero
  5/30/23
  Makes the answer to the FAQ slide down and appear when the question is clicked on. 
*/

var questions = document.getElementsByClassName("question");

for (var i = 0; i < questions.length; i++) {
  questions[i].addEventListener("click", function() {
    var redLine = this.nextElementSibling;
    var answer = redLine.nextElementSibling;

    if (answer.style.maxHeight) {
      answer.style.maxHeight = null;
    } else {
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
}
