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

const loadData = (doc, state, url) => {
  const channel = doc.querySelector('channel');
  const feedName = channel.querySelector('title');
  const feedDescription = channel.querySelector('description');
  const feed = {
    name: feedName.textContent,
    description: feedDescription.textContent,
    id: _.uniqueId(),
    url,
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

const checkNewFeed = (state, error) => {
  const promises = state.feeds.map(({ url }) => getData(url));
  Promise.all(promises).then((responses) => {
    responses.forEach((response) => {
      const document = parseData(response.data.contents, error);
      loadData(document, state);
    });
  }).then(() => {
    setTimeout(checkNewFeed, 5000, state);
  });
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
    button: document.querySelector('.col-auto > button'),
  };

  const initialState = {
    form: {
      state: 'init',
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
    const urlsList = state.feeds.map(({ url }) => url);
    validateUrl(inputValue, urlsList)
      .then((link) => {
        state.form.state = 'loading';
        return getData(link);
      })
      .then((response) => parseData(response.data.contents, i18nInstance.t('errors.noRss')))
      .then((document) => loadData(document, state, inputValue))
      .then(() => {
        state.form.state = 'success';
      })
      .catch((er) => {
        state.form.state = 'error';
        const error = er.message;
        state.form.error = error === 'Network Error' ? i18nInstance.t('errors.network') : error;
      });
  });

  elements.posts.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (postId) {
      state.uiState.visitedPosts.add(postId);
    }
    state.uiState.modalPost = state.posts.find(({ id }) => id === postId);
    state.uiState.visitedPosts.add(postId);
  });

  checkNewFeed(state, i18nInstance.t('errors.noRss'));
};
