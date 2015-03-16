module.exports = {

  cardinality: function (details) {
    return {
      status: 500,
      details: {
        message: 'Expected only one item, but got ' + details.length + '.',
        items: details
      }
    };
  },
  unsupportedMethod: function (details) {
    return {
      status: 400,
      details: details
    };
  },
  alreadyVoted: function (details) {
    return {
      status: 403,
      details: {
        message: 'Contributor has already voted on the specified content item.'
      }
    };
  },

  mustBeOwner: function (deatals) {
    return {
      status: 403,
      details: {
        message: 'The user does not own the content.'
      }
    };
  }
};
