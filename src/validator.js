import * as yup from 'yup';
import _ from 'lodash';
import state from './view';

const schema = yup.object().shape({
  url: yup.string().url().notOneOf(state.urlList),
});

export default (fields) => {
  try {
    schema.validate(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return _.keyBy(e.inner, 'path');
  }
};
