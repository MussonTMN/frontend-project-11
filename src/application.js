import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import render from './view';
import resources from './locales/index';

i18next.init({
  lng: 'ru',
  resources,
}).then(yup.setLocale({
  string: {
    url: i18next.t('errors.url'),
  },
  mixed: {
    notOneOf: i18next.t('errors.notOneOf'),
  },
}));

const validateUrl = (url, urlsList) => {
  const urlSchema = yup.string().url().required().notOneOf(urlsList);
  return urlSchema.validate(url, { abortEarly: false });
};

const getData = (url) => axios({
  method: 'get',
  url: `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`,
  responseType: 'text',
});

const parseData = (response) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(response, 'text/html');
  return data;
};

const loadData = (doc, state) => {
  const rss = doc.querySelector('rss');
  if (!doc.contains(rss)) {
    throw new Error(i18next.t('errors.noRss'));
  }
  const channel = rss.querySelector('channel');
  const feedName = channel.querySelector('title');
  const feedDescription = channel.querySelector('description');

  const feed = {
    name: feedName.textContent,
    description: feedDescription.textContent,
    id: _.uniqueId(),
  };
  state.feeds = _.unionBy(state.feeds, [feed], 'name');

  const postsLIst = channel.querySelectorAll('item');
  const posts = Array.from(postsLIst)
    .map((item) => ({
      name: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').nextSibling.textContent.replace(/\\n|\\t/g, ''),
      feedId: feed.id,
      id: _.uniqueId(),
    }));
  state.posts = _.unionBy(state.posts, posts, 'name');
};

const checkNewFeed = (state, time) => {
  state.form.urlsList.forEach((url) => {
    getData(url)
      .then((response) => parseData(response.data))
      .then((document) => loadData(document, state));
  });
  setTimeout(checkNewFeed, time, state, time);
};

export default () => {
  const elements = {
    names: {
      feedsName: i18next.t('feeds'),
      postsName: i18next.t('posts'),
      button: i18next.t('button'),
    },
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const initialState = {
    form: {
      validationState: null,
      urlsList: [],
      error: null,
      loading: null,
    },
    feeds: [],
    posts: [],
  };

  const state = onChange(initialState, render(elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputValue = formData.get('url');
    validateUrl(inputValue, state.form.urlsList)
      .then((content) => {
        state.form.urlsList.push(content);
        state.form.validationState = 'valid';
        state.form.loading = i18next.t('succusess');
        return getData(content);
      })
      .then((response) => parseData(response.data))
      .then((document) => loadData(document, state))
      .then(() => checkNewFeed(state, 5000))
      .catch((er) => {
        state.form.validationState = 'invalid';
        const [error] = er.errors;
        state.form.error = error;
      });
  });
};
