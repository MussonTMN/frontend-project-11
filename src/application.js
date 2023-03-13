import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import render from './view';
import resources from './locales/index';

const validateUrl = (url, urlsList) => {
  const urlSchema = yup.string().url().required().notOneOf(urlsList);
  return urlSchema.validate(url, { abortEarly: false });
};

const getData = (url) => {
  const originsLink = 'https://allorigins.hexlet.app/get';
  const preparedURL = new URL(originsLink);
  preparedURL.searchParams.set('disableCache', 'true');
  preparedURL.searchParams.set('url', url);
  return axios.get(preparedURL);
};

const parseData = (response, error) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(response, 'text/xml');
  const rss = xml.querySelector('rss');
  if (!xml.contains(rss)) {
    throw new Error(error);
  }
  return xml;
};

const loadData = (doc, state) => {
  const channel = doc.querySelector('channel');
  const feedName = channel.querySelector('title');
  const feedDescription = channel.querySelector('description');

  const feed = {
    name: feedName.textContent,
    description: feedDescription.textContent,
    id: _.uniqueId(),
  };
  state.feeds = _.unionBy(state.feeds, [feed], 'name');

  const postsList = channel.querySelectorAll('item');
  const posts = Array.from(postsList)
    .map((item) => ({
      name: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
      feedId: feed.id,
      id: _.uniqueId(),
    }));
  state.posts = _.unionBy(state.posts, posts, 'name');
};

const checkNewFeed = (state, time) => {
  state.form.urlsList.forEach((url) => {
    getData(url)
      .then((response) => parseData(response.data.contents))
      .then((document) => loadData(document, state));
  });
  setTimeout(checkNewFeed, time, state, time);
};

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    resources,
  }).then(yup.setLocale({
    string: {
      url: i18nInstance.t('errors.url'),
    },
    mixed: {
      notOneOf: i18nInstance.t('errors.notOneOf'),
    },
  }));

  const elements = {
    modal: {
      main: document.querySelector('#modal'),
      title: document.querySelector('.modal-title'),
      cross: document.querySelector('.btn-close'),
      body: document.querySelector('.modal-body'),
      readButton: document.querySelector('.btn-primary'),
      close: document.querySelector('.btn-secondary'),
    },
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const initialState = {
    form: {
      processState: 'init',
      validationState: null,
      urlsList: [],
      error: null,
    },
    feeds: [],
    posts: [],
    uiState: {
      visitedPosts: new Set(),
      modalPost: null,
    },
  };

  const state = onChange(initialState, render(elements, i18nInstance, initialState));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputValue = formData.get('url');
    validateUrl(inputValue, state.form.urlsList)
      .then((content) => {
        state.form.validationState = 'valid';
        return getData(content);
      })
      .then((response) => parseData(response.data.contents, i18nInstance.t('errors.noRss')))
      .then((document) => loadData(document, state))
      .then(() => state.form.urlsList.push(inputValue))
      .then(() => checkNewFeed(state, 5000))
      .catch((er) => {
        state.form.validationState = 'invalid';
        const error = er.message;
        state.form.error = error === 'Network Error' ? i18nInstance.t('errors.network') : error;
      });
  });

  elements.posts.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (postId) {
      state.uiState.visitedPosts.add(postId);
    }
  });

  elements.modal.main.addEventListener('shown.bs.modal', (e) => {
    const postId = e.relatedTarget.getAttribute('data-id');
    state.uiState.modalPost = state.posts.find(({ id }) => id === postId);
  });
};
