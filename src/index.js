import getImages from './js/fetch-service';
import refs from './js/refs';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import makeCards from './js/make-cards';

let page;
let totalPages;
let searchQueryValue;

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  overlayOpacity: 0.8,
});

refs.form.addEventListener('submit', onSearch);

function onSearch(e) {
  e.preventDefault();

  const {
    elements: { searchQuery },
  } = e.currentTarget;

  searchQueryValue = searchQuery.value.trim();

  refs.gallery.innerHTML = '';
  page = 1;

  if (!searchQueryValue) {
    Notify.info("You didn't enter anything.");
    return;
  }

  renderImages(searchQueryValue, page);

  e.currentTarget.reset();
}

function onScroll() {
  const block = refs.gallery;

  const contentHeight = block.offsetHeight;
  const yOffset = window.pageYOffset;
  const window_height = window.innerHeight;
  const y = yOffset + window_height;

  if (y >= contentHeight) {
    page += 1;

    removeEventListener('scroll', onScroll);

    if (page > totalPages) {
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );

      return;
    }

    renderImages(searchQueryValue, page);
  }
}

async function renderImages(value, page) {
  try {
    const { hits, totalHits } = await getImages(value, page);

    checkTotalPages(totalHits);

    if (totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      return;
    } else if (page === 1) {
      Notify.info(`Hooray! We found ${totalHits} images.`);
    }

    refs.gallery.insertAdjacentHTML('beforeend', makeCards(hits));
    lightbox.refresh();
    scroll();
    addEventListener('scroll', onScroll);
  } catch (error) {
    console.log(error.message);
    Notify.failure('Oops, something went wrong. Please try again.');
  }
}

function scroll() {
  const { height: formHeight } = refs.form.getBoundingClientRect();
  let topScroll;

  if (page === 1) {
    topScroll = formHeight;

    window.scrollBy({
      top: topScroll,
      behavior: 'smooth',
    });
  }
}
function checkTotalPages(totalHits) {
  totalPages = Math.ceil(totalHits / 30);
}
