export function typeText(element, text, speed = 50) {
  element.innerHTML = ''; // clear current text
  let i = 0;
  
  // Create a blinking cursor
  const cursor = document.createElement('span');
  cursor.textContent = '|';
  cursor.style.animation = 'blink 1s step-end infinite';
  
  // Add blink keyframes if not exists
  if (!document.getElementById('typewriter-style')) {
    const style = document.createElement('style');
    style.id = 'typewriter-style';
    style.textContent = '@keyframes blink { 50% { opacity: 0; } }';
    document.head.appendChild(style);
  }
  
  element.appendChild(cursor);

  function type() {
    if (i < text.length) {
      let char = text.charAt(i);
      if (char === '<' && text.substr(i, 4) === '<br>') {
        cursor.insertAdjacentHTML('beforebegin', '<br>');
        i += 4;
      } else {
        cursor.insertAdjacentText('beforebegin', char);
        i++;
      }
      setTimeout(type, speed + Math.random() * 50); // slight random delay for realism
    }
  }
  
  setTimeout(type, 300); // initial delay
}
