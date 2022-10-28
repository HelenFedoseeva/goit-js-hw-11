import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const axios = require('axios').default;

const formRef = document.querySelector('.search-form');
const formBtn = formRef.querySelector('button');
const formInput = formRef.querySelector('input');
const galleryRef = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const API = '30710292-c8dac78b3cbcad5ed8cc59cad';
const BASE_URL = 'https://pixabay.com/api/';
let page = 1;
let keyword = '';

formRef.addEventListener('submit', onSubmitHandler);
galleryRef.addEventListener('click', lightBoxHandler);

async function fetchEvent(value, page) {
  const params = new URLSearchParams({
    key: API,
    q: value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page,
    q: value,
  });
  const response = await axios.get(`${BASE_URL}?${params}`);
  const data = response.data;

  if (!data) {
    throw new Error(response.status);
  }
  return data;
}

async function onSubmitHandler(e) {
  e.preventDefault();
  galleryRef.innerHTML = '';
  let input = e.target.elements.searchQuery.value;
  let value = input.trim();
  keyword = value;
  page = 1;
  loadMoreBtn.classList.add('hidden');

  if (value === '') {
    return;
  }

  try {
    const receivedData = await fetchEvent(value, page);

    if (receivedData.total === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    Notiflix.Notify.info(`Hooray! We found ${receivedData.totalHits} images`);
    renderMarkup(receivedData);

    let lightBox = new SimpleLightbox('.gallery a', {
      enableKeyboard: true,
      docClose: true,
      overlay: true,
      nav: true,
      close: true,
      showCounter: true,
    });
  } catch {
    console.log(console.error());
  }

  page += 1;

  loadMoreBtn.classList.remove('hidden');
}

function renderMarkup(data) {
  const images = data.hits;

  const markupCard = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return ` <a class="photo-card__link" href="${largeImageURL}">
        <div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width=360 height=250/>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</div>
  </a>
    `;
      }
    )
    .join('');

  return galleryRef.insertAdjacentHTML('beforeend', markupCard);
}

function lightBoxHandler(event) {
  event.preventDefault();

  if (event.target.nodeName !== 'IMG') {
    return;
  }
}

loadMoreBtn.addEventListener('click', async () => {
  try {
    const receivedData = await fetchEvent(keyword, page);
    if (receivedData.hits.length === 0) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results. "
      );
      loadMoreBtn.classList.add('hidden');
      return;
    }
    renderMarkup(receivedData);
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
    page += 1;
  } catch {
    console.log(console.error());
  }
});
