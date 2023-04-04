const handleState = (elements, formState, i18nInstance) => {
  const {
    feedback, input, form, button,
  } = elements;

  const spinner = () => {
    const div = document.createElement('div');
    div.classList.add('spinner-border', 'text-light');
    div.setAttribute('role', 'status');

    const span = document.createElement('span');
    span.classList.add('sr-only');
    div.append(span);
    return div;
  };

  switch (formState) {
    case 'loading':
      button.setAttribute('disabled', '');
      feedback.replaceChildren(spinner());
      break;

    case 'success':
      button.removeAttribute('disabled');
      feedback.textContent = i18nInstance.t('succusess');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      input.classList.remove('is-invalid');
      form.reset();
      input.focus();
      break;

    case 'error':
      button.removeAttribute('disabled');
      input.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      feedback.classList.remove('text-success');
      break;

    default:
      throw new Error(`Unknown state: ${formState}`);
  }
};

const createContainer = (name) => {
  const divContainer = document.createElement('div');
  divContainer.classList.add('card', 'border-0');

  const titleDiv = document.createElement('div');
  titleDiv.classList.add('card-body');

  const title = document.createElement('h2');
  title.classList.add('card-title', 'h4');
  title.textContent = name;
  titleDiv.append(title);
  divContainer.append(titleDiv);

  return divContainer;
};

const handleFeeds = (elements, feeds, i18nInstance) => {
  const feedsDiv = createContainer(i18nInstance.t('feeds'));

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach((item) => {
    const feed = document.createElement('li');
    feed.classList.add('list-group-item', 'border-0', 'border-end-0');

    const itemTitle = document.createElement('h3');
    itemTitle.classList.add('h6', 'm-0');
    itemTitle.textContent = item.title;

    const itemDescription = document.createElement('p');
    itemDescription.classList.add('m-0', 'small', 'text-black-50');
    itemDescription.textContent = item.description;

    feed.append(itemTitle, itemDescription);
    feedsList.prepend(feed);
  });
  feedsDiv.append(feedsList);
  elements.feeds.replaceChildren(feedsDiv);
};

const handlePosts = (elements, i18nInstance, state) => {
  const postsDiv = createContainer(i18nInstance.t('posts'));

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');

  state.posts.forEach((item) => {
    const post = document.createElement('li');
    post.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const link = document.createElement('a');
    link.setAttribute('href', item.link);
    const titleStyle = state.uiState.visitedPosts.has(item.id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
    link.classList.add(...titleStyle);
    link.setAttribute('data-id', item.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = item.title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', item.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18nInstance.t('button');

    post.append(link, button);
    postsList.prepend(post);
  });
  postsDiv.append(postsList);
  elements.posts.replaceChildren(postsDiv);
};

const getModalWindow = (elements, post) => {
  const { title, body, readButton } = elements.modal;
  const { description, link } = post;
  title.textContent = post.title;
  body.textContent = description;
  readButton.setAttribute('href', link);
};

const render = (elements, i18nInstance, state) => (path, value) => {
  switch (path) {
    case 'form.state':
      handleState(elements, value, i18nInstance);
      break;

    case 'form.error':
      elements.feedback.textContent = value;
      break;

    case 'feeds':
      handleFeeds(elements, value, i18nInstance);
      break;

    case 'uiState.visitedPosts':
    case 'posts':
      handlePosts(elements, i18nInstance, state);
      break;

    case 'uiState.modalPost':
      getModalWindow(elements, value);
      break;

    default:
      break;
  }
};

export default render;
