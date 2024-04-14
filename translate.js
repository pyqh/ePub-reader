const button = document.createElement('button');
button.style = 'position: fixed; top: 17px; left: 50%; transform: translateX(-50%); padding: 0 20px; z-index: 99999';
document.body.appendChild(button);
const iframe = document.createElement('iframe');
iframe.style = 'display: none';
document.body.appendChild(iframe);
let audio;
iframe.contentWindow.onload = function () {
  audio = new iframe.contentWindow.Audio();
  audio.oncanplaythrough = () => {
    audio.play();
  };
};
const play = (text) => {
  audio.src = `http://translate.google.com/translate_tts?client=tw-ob&ie=UTF-8&tl=en-US&q=${encodeURI(text)}`;
};
const get = async (text) => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=en-US&tl=zh-CN&q=${encodeURI(text)}`;
  const response = await fetch(url);
  const data = await response.json();
  return data[0].map((x) => x[0]).join('');
};
button.onclick = (event) => {
  audio.play();
  event.stopPropagation();
};
rendition.on('dblclick', function (_, contents) {
  const text = contents.window.getSelection().toString();
  if (text) {
    play(text);
    get(text).then((val) => {
      button.innerHTML = val;
      button.style.display = '';
    });
  }
});
rendition.on('click', () => {
  button.style.display = 'none';
});
window.addEventListener('click', () => {
  button.style.display = 'none';
});
