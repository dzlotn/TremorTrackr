// Makes the answer to the FAQ appear when the question is clicked on
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
