//Creates the procedure page, which is essentially several cards overlayed on top of each other, with arrows below that cycles through the steps of the procedure//
//Some code is adapted from https://codepen.io/RobVermeer/pen/japZpY//

var cardContainer = document.querySelector('.cardContainer');
var allCards = document.querySelectorAll('.procedureCard');
var left = document.getElementById('left');
var right = document.getElementById('right');
 
//Initializes the cards and puts each consecutive card behind another, scaled down and slightly to the left, with lower opacity
function initCards(card, index) {
  var newCards = document.querySelectorAll('.procedureCard:not(.removed)');

  newCards.forEach(function (card, index) {
    card.style.transform = 'scale(' + (19 - index) / 19 + ') translateX(-' + 40 * index + 'px)';
    card.style.zIndex = allCards.length - index;
    card.style.opacity = (12 - index) / 12;
  });

  cardContainer.classList.add('loaded');
}
//Left button functionality, which places the removed cards back in the pile
function undoCardAction() {
  var removedCards = document.querySelectorAll('.procedureCard.removed');

  if (removedCards.length === 0) return;

  var lastRemovedCard = removedCards[removedCards.length - 1];
  lastRemovedCard.classList.remove('removed');
  lastRemovedCard.style.transform = '';
  

  initCards();
}
//Moves the cards out of the pile at an angle, and moves the next card in the pile upwards
function createButtonListener(right) {
    return function (event) {
      var cards = document.querySelectorAll('.procedureCard:not(.removed)');
      var moveOutWidth = document.body.clientWidth * 1.5;
      //code that stops the right button functionality once the the last card is displayed
      if (!cards.length || (cards.length === 1 && right)) return false;
  
      if (right) {
        var card = cards[0];
        card.classList.add('removed');
        card.style.transform = 'translate(' + moveOutWidth + 'px, -100px) rotate(-30deg)';
      } else {
        undoCardAction();
      }
  
      initCards();
  
      event.preventDefault();
    };
  }
  
  var leftListener = createButtonListener(false);
  var rightListener = createButtonListener(true);
  
  left.addEventListener('click', leftListener);
  right.addEventListener('click', rightListener);
  
  initCards()

  