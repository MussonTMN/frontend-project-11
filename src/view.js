const handleValidation = (elements, validationState) => {
  switch (validationState) {
    case 'empty':
      elements.feedback.textContent = '';
      break;

    case 'valid':
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.input.classList.remove('is-invalid');
      break;

    case 'invalid':
      elements.input.classList.add('is-invalid');
      elements.feedback.classList.add('text-danger');
      elements.feedback.classList.remove('text-success');
      break;

    default:
      throw new Error(`Unknown validation state: ${validationState}`);
  }
};

const render = (elements) => (path, value) => {
  switch (path) {
    case 'form.validationState':
      handleValidation(elements, value);
      break;

    case 'form.error':
      elements.feedback.textContent = value;
      break;

    case 'loading':
      elements.feedback.textContent = value;
      break;

    default:
      break;
  }
};

export default render;
