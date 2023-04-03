const parse = (response) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(response, 'text/xml');

  if (!xml.contains(xml.querySelector('rss'))) {
    throw new Error('noRss');
  }

  const channel = xml.querySelector('channel');
  const feedName = channel.querySelector('title');
  const feedDescription = channel.querySelector('description');

  const feed = {
    title: feedName.textContent,
    description: feedDescription.textContent,
  };

  const postsList = channel.querySelectorAll('item');
  const posts = Array.from(postsList)
    .map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    }));

  return { feed, posts };
};

export default (res) => {
  try {
    return parse(res);
  } catch (err) {
    throw new Error('noRss');
  }
};
