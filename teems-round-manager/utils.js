const respBuilder = (statusCode, body, additionalItems) => ({
  statusCode,
  body: JSON.stringify(body),
  ...additionalItems
});

module.exports = {
  respBuilder
};