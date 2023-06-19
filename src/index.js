import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchPictures } from './js/pictures-api';

let lightbox = new SimpleLightbox('.gallery a');

const formEl = document.querySelector('#search-form');
const loadMoreButtonEl = document.querySelector('.load-more');
const galleryEl = document.querySelector('.gallery');

hideElement(loadMoreButtonEl);

formEl.addEventListener('submit', onSubmit);
loadMoreButtonEl.addEventListener('click', onLoadMoreButtonClick);

let searchText = '';
let page = 1;
const pageLimit = 40;
let firstQuery = true;

function onSubmit(evt) {
  evt.preventDefault();
  galleryEl.innerHTML = '';
  page = 1;
  hideElement(loadMoreButtonEl);
  firstQuery = true;
  searchText = evt.currentTarget.elements.searchQuery.value;
  if (searchText.trim() === '') {
    return;
  }
  render(searchText);
}

function onLoadMoreButtonClick() {
  render(searchText);
}

async function render(searchTarget) {
  try {
    const data = await fetchPictures({
      whatToSearch: searchTarget,
      pageNumber: page,
      perPage: pageLimit,
    });
    const itemsForRender = data.hits;
    const totalItems = data.totalHits;
    const totalPage = Math.ceil(totalItems / pageLimit);

    if (itemsForRender.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (totalPage === 1) {
      Notify.success(`Hooray! We found ${totalItems} images.`);
      renderItemsOFGalary(itemsForRender);
      return;
    }

    if (page >= totalPage) {
      renderItemsOFGalary(itemsForRender);
      hideElement(loadMoreButtonEl);
      smoothScrol();
      Notify.info("We're sorry, but you've reached the end of search results.");
      return;
    }

    renderItemsOFGalary(itemsForRender);
    showElement(loadMoreButtonEl);
    page += 1;
    if (firstQuery) {
      Notify.success(`Hooray! We found ${totalItems} images.`);
      firstQuery = false;
    } else {
      smoothScrol();
    }
  } catch (error) {
    console.log(error.message);
  }
}

function renderItemsOFGalary(items) {
  const markupItems = makeMarkup(items);
  galleryEl.insertAdjacentHTML('beforeend', markupItems);
  lightbox.refresh();
}

function smoothScrol() {
  const { height: cardHeight } =
    galleryEl.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function makeMarkup(items) {
  return items
    .map(item => {
      const {
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = item;
      return `<a class = "gallery-link" href="${largeImageURL}">
    <div class="photo-card">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
      <div class="info">
        <p class="info-item">
          <b>Likes</b> ${likes}
        </p>
        <p class="info-item">
          <b>Views</b> ${views}
        </p>
        <p class="info-item">
          <b>Comments</b> ${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b> ${downloads}
        </p>
      </div>
    </div>
  </a>`;
    })
    .join('\n');
}

function hideElement(elem) {
  elem.classList.add('hidden');
}

function showElement(elem) {
  elem.classList.remove('hidden');
}
