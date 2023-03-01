import onChange from 'on-change';
import * as yup from 'yup';
// import _ from 'lodash';
import i18next from 'i18next';
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

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  const initialState = {
    form: {
      validationState: 'empty',
      urlsList: [],
      error: '',
      loading: '',
    },
  };

  const state = onChange(initialState, render(elements));

  const validateUrl = (url, urlsList) => {
    const urlSchema = yup.string().url().required().notOneOf(urlsList);
    return urlSchema.validate(url, { abortEarly: false });
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputValue = formData.get('url');
    validateUrl(inputValue, state.form.urlsList)
      .then((content) => {
        state.form.urlsList.push(content);
        state.form.validationState = 'valid';
        state.form.loading = i18next.t('succusess');
      })
      .catch((er) => {
        state.form.validationState = 'invalid';
        const [error] = er.errors;
        state.form.error = error;
      });
  });
};
