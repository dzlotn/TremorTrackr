//Sets the info box to different dataset infos depending on which diagram section the mouse is hovering over
//Deletes the info box div when not hovering over important component
const interactiveSections = document.querySelectorAll('.interactive-section');
const infoBox = document.querySelector('.info-box');

interactiveSections.forEach((section) => {
  section.addEventListener('mouseenter', () => {
    const info = section.dataset.info;
    infoBox.textContent = info;
    infoBox.style.display = 'block';
    section.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';

  });

  section.addEventListener('mouseleave', () => {
    infoBox.style.display = 'none';
    section.style.backgroundColor = 'rgba(255, 255, 255, 0)';
  });
});
