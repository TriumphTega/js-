const openModalBtn = document.getElementById('openModalBtn');
const myModal = document.getElementById('myModal');
const closeBtn = document.querySelector('.close-btn');
const confirmChoiceBtn = document.getElementById('confirmChoiceBtn');
const choiceRadios = document.querySelectorAll('input[name="choice"]');

let selectedOption = null;

openModalBtn.onclick = function() {
  myModal.style.display = 'block';
}

closeBtn.onclick = function() {
  myModal.style.display = 'none';
}

confirmChoiceBtn.onclick = function() {
  for (const radio of choiceRadios) {
    if (radio.checked) {
      selectedOption = radio.value;
      break;
    }
  }
  if (selectedOption) {
    console.log('Selected option:', selectedOption);
    // Here you can use the selectedOption value, e.g., update other parts of the page, send to server, etc.
  } else {
    console.log('No option selected.');
  }
  myModal.style.display = 'none';
}

window.onclick = function(event) {
  if (event.target == myModal) {
    myModal.style.display = 'none';
  }
}