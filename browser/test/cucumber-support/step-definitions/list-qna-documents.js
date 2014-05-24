module.exports = function () {
  this.World = World;

  this.Then(/qna\-documents\-list is displayed/, function(callback) {
    callback.pending();
  });

};
