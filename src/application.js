import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import render from './view';
import resources from './locales/index';
import parse from './parser';

const validateUrl = (url, urlsList) => {
  const urlSchema = yup.string().url().required().notOneOf(urlsList);
  return urlSchema.validate(url, { abortEarly: false });
};

const fetch = (url) => {
  const originsLink = 'https://allorigins.hexlet.app/get';
  const preparedURL = new URL(originsLink);
  preparedURL.searchParams.set('disableCache', 'true');
  preparedURL.searchParams.set('url', url);
  return axios.get(preparedURL);
};

const handleData = (data, state, url) => {
  const feed = {
    title: data.feed.title,
    description: data.feed.description,
    id: _.uniqueId(),
    url,
  };
  state.feeds = _.unionBy(state.feeds, [feed], 'title');

  const posts = data.posts
    .map(({ title, link, description }) => ({
      title,
      description,
      link,
      feedId: feed.id,
      id: _.uniqueId(),
    }));
  state.posts = _.unionBy(state.posts, posts, 'title');
};

const checkNewPosts = (state) => {
  const timeout = 5000;
  const promises = state.feeds.map(({ url }) => fetch(url));
  Promise.all(promises).then((responses) => {
    responses.forEach((response) => {
      const data = parse(response.data.contents);
      handleData(data, state);
    });
  }).catch((er) => console.error(er))
    .finally(() => {
      setTimeout(checkNewPosts, timeout, state);
    });
};

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    resources,
  }).then(yup.setLocale({
    string: {
      url: i18nInstance.t('url'),
    },
    mixed: {
      notOneOf: i18nInstance.t('notOneOf'),
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
    spinner: document.querySelector('.spinner-border'),
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
    state.form.state = 'loading';
    const formData = new FormData(e.target);
    const inputValue = formData.get('url');
    const urlsList = state.feeds.map(({ url }) => url);
    validateUrl(inputValue, urlsList)
      .then((link) => fetch(link))
      .then((response) => {
        const data = parse(response.data.contents);
        handleData(data, state, inputValue);
        state.form.state = 'success';
      }).catch((er) => {
        state.form.state = 'error';
        const error = er.message;
        if (er.isParsingError) {
          state.form.error = i18nInstance.t('errors.noRss');
          console.error(error);
        } else {
          state.form.error = error === 'Network Error' ? i18nInstance.t('errors.network') : i18nInstance.t(`errors.${error}`);
        }
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

  checkNewPosts(state);
};
