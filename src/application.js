import onChange from 'on-change';
import * as yup from 'yup';
// import _ from 'lodash';
import render from './view';

const initialState = {
  form: {
    validationState: 'empty',
    urlsList: [],
    error: '',
  },
};

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  const state = onChange(initialState, render(elements));

  const validateUrl = (url, urlsList) => {
    const urlSchema = yup.string().url('Ссылка должна быть валидным URL').required('urlIsRequired').notOneOf(urlsList, 'RSS уже существует');
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
      })
      .catch((er) => {
        state.form.validationState = 'invalid';
        const [error] = er.errors;
        state.form.error = error;
      });
  });
};
