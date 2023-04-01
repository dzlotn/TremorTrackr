const container = document.querySelector('.container');
const image = document.querySelector('.image');
const overlay1 = document.querySelector('.overlay1');
const overlay2 = document.querySelector('.overlay2');

function moveOverlay1(event) {
  const x = event.clientX - container.offsetLeft - 50;
  const y = event.clientY - container.offsetTop - 50;
  overlay1.style.left = `${x}px`;
  overlay1.style.top = `${y}px`;
}

function moveOverlay2(event) {
  const x = event.clientX - container.offsetLeft - 50;
  const y = event.clientY - container.offsetTop - 50;
  overlay2.style.left = `${x}px`;
  overlay2.style.top = `${y}px`;
}

image.addEventListener('mousemove', function(event) {
  moveOverlay1(event);
  moveOverlay2(event);
});

container.addEventListener('mouseleave', function() {
  overlay1.classList.add('hide');
  overlay2.classList.add('hide');
});

container.addEventListener('mouseenter', function() {
  overlay1.classList.remove('hide');
  overlay2.classList.remove('hide');
});
