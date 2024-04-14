const filename = localStorage.getItem('filename') || 'example.epub';
const book = ePub(`./books/${filename}`);
const rendition = book.renderTo('viewer', {
  width: '100%',
  height: '100%',
  spread: 'always',
  stylesheet: '/injection.css',
});
let key;

(async function loadBook() {
  try {
    openBook();
    await book.ready;
    key = book.key();
    await displayRendition();
    await Locations();
    setupEvents();
    await setupTableOfContents();
    await setupMetadata();
    rendered();
    relocated();
  } catch (error) {
    console.log(error);
  }
})();

function openBook() {
  document.querySelector('#upload').onclick = function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('accept', 'application/epub+zip');
    input.style.display = 'none';
    input.onchange = (event) => {
      const file = event.target.files[0];
      localStorage.setItem('filename', file.name);
      location.reload();
    };
    document.body.appendChild(input);
    input.click();
  };
}

async function displayRendition() {
  const loc = localStorage.getItem(key) || undefined;
  await rendition.display(loc);
  document.querySelector('.loading').classList.remove('loading');
}

async function Locations() {
  const locations = key + '-locations';
  const stored = localStorage.getItem(locations);
  if (stored) {
    book.locations.load(stored);
  } else {
    await book.locations.generate();
    localStorage.setItem(key + '-locations', book.locations.save());
  }
}

function setupEvents() {
  // Keyboard interaction
  function keyListener(e) {
    switch (e.key) {
      case 'ArrowLeft':
        previousPage();
        break;
      case 'ArrowRight':
      case ' ': // Space key
        nextPage();
        break;
    }
  }

  // Functions for page navigation
  function nextPage() {
    rendition.next();
  }

  function previousPage() {
    rendition.prev();
  }
  rendition.on('keyup', keyListener);
  document.onkeyup = keyListener;
  document.getElementById('next').onclick = nextPage;
  document.getElementById('prev').onclick = previousPage;
}

async function setupTableOfContents() {
  const toc = await book.loaded.navigation;
  const $select = document.getElementById('toc');
  const fragment = document.createDocumentFragment();

  toc.forEach((chapter) => {
    const option = document.createElement('option');
    option.textContent = chapter.label;
    option.style.width = '40vh';
    option.style.textOverflow = 'hidden';
    option.setAttribute('ref', chapter.href);
    fragment.appendChild(option);
  });

  $select.appendChild(fragment);

  $select.onchange = function () {
    const index = $select.selectedIndex;
    const url = $select.options[index].getAttribute('ref');
    rendition.display(url);
    return false;
  };
}
async function setupMetadata() {
  const metadata = await book.loaded.metadata;
  document.title = metadata.title.trim();
}

//render finish,toc change trigger this
function rendered() {
  rendition.on('rendered', function (section) {
    const current = book.navigation?.get(section.href);
    if (current) {
      const $select = document.getElementById('toc');
      const $selected = $select.querySelector('option[selected]');
      if ($selected) {
        $selected.removeAttribute('selected');
      }
      const $options = $select.querySelectorAll('option');
      for (let option of $options) {
        if (option.getAttribute('ref') === current.href) {
          option.setAttribute('selected', '');
          break;
        }
      }
    }
  });
}

//turn page
function relocated() {
  rendition.on('relocated', function (location) {
    localStorage.setItem(key, location.start.cfi);
    const percent = book.locations.percentageFromCfi(location.start.cfi);
    if (percent) {
      const percentage = Math.floor(percent * 100);
      document.querySelector('#progress').innerHTML = percentage + '%';
    }
  });
}

window.addEventListener('beforeunload', function () {
  book.destroy();
});
