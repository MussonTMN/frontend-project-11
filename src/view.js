const handleValidation = (elements, validationState) => {
  switch (validationState) {
    case 'valid':
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.input.classList.remove('is-invalid');
      elements.form.reset();
      elements.input.focus();
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

const handleFeeds = (elements, feeds) => {
  const feedsDiv = createContainer(elements.names.feedsName);

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach((item) => {
    const feed = document.createElement('li');
    feed.classList.add('list-group-item', 'border-0', 'border-end-0');

    const itemName = document.createElement('h3');
    itemName.classList.add('h6', 'm-0');
    itemName.textContent = item.name;

    const itemDescription = document.createElement('p');
    itemDescription.classList.add('m-0', 'small', 'text-black-50');
    itemDescription.textContent = item.description;

    feed.append(itemName, itemDescription);
    feedsList.prepend(feed);
  });
  feedsDiv.append(feedsList);
  elements.feeds.replaceChildren(feedsDiv);
};

const handlePosts = (elements, posts) => {
  const postsDiv = createContainer(elements.names.postsName);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');

  posts.forEach((item) => {
    const post = document.createElement('li');
    post.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const link = document.createElement('a');
    link.setAttribute('href', item.link);
    link.classList.add('fw-bold');
    link.setAttribute('data-id', item.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = item.name;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', item.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = elements.names.button;

    post.append(link, button);
    postsList.prepend(post);
  });
  postsDiv.append(postsList);
  elements.posts.replaceChildren(postsDiv);
};

const render = (elements) => (path, value) => {
  switch (path) {
    case 'form.validationState':
      handleValidation(elements, value);
      break;

    case 'form.error':
      elements.feedback.textContent = value;
      break;

    case 'form.loading':
      elements.feedback.textContent = value;
      break;

    case 'feeds':
      handleFeeds(elements, value);
      break;

    case 'posts':
      handlePosts(elements, value);
      break;

    default:
      break;
  }
};

export default render;
