class ParsingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParsingError';
    this.isParsingError = true;
  }
}

export default (response) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(response, 'text/xml');
  const parseError = xml.querySelector('parsererror');
  if (xml.contains(parseError)) {
    throw new ParsingError(parseError.textContent);
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
