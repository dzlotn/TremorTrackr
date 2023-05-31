/*
  TremorTrackr
  Owen Powell, Daniel Zlotnick, Lauren Fleming, Angelina Otero
  5/30/23
  Sets the info box to different dataset infos/names depending on which diagram section the mouse is hovering over.
  Also puts component information in the info box.
*/


//Deletes the info box div when not hovering over important component
const interactiveSections = document.querySelectorAll('.interactive-section');
const infoBox = document.querySelector('.info-box');
const componentName = infoBox.querySelector('.component-name');
const componentInfo = infoBox.querySelector('.component-info');
const sensorInfo = {
  'IMU Sensor': {
    name: 'IMU Sensor',
    info: 'The IMU (Inertial Measurement Unit) consists of a accelerometer that records both rotational and translational acceleration'
  },
  'Arduino Nano': {
    name: 'Arduino Nano',
    info: 'The Arduino Nano is a microcontroller board that is used to control and interact with the various sensors and components in the circuit.'
  },
  'Power Switches': {
    name: 'EMG Switch',
    info: 'The EMG switch is used to turn the EMG sensor on and off. It is connected to the battery.'
  },
  'EMG Sensor': {
    name: 'EMG Sensor',
    info: 'The EMG sensor measures the electrical activity of the muscles (voltage).'
  },
  'Battery': {
    name: 'Battery',
    info: 'The batteries provide power to the entire circuit. Shrink wrap is used to connect the button cell batteries in series.'
  },
  'Electrodes': {
    name: 'Electrodes',
    info: 'The electrodes are used to pick up the electrical signals from the muscles. They are placed on the skin and are connected to the EMG sensor.'
  }
};

interactiveSections.forEach((section) => {
  section.addEventListener('mouseenter', () => {
    const info = sensorInfo[section.dataset.info];
    componentName.textContent = info.name;
    componentInfo.textContent = info.info;
    infoBox.style.display = 'block';
    section.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
  });

  section.addEventListener('mouseleave', () => {
    infoBox.style.display = 'none';
    section.style.backgroundColor = 'rgba(255, 255, 255, 0)';
  });
});
