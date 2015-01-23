module.exports = {
  setCheckboxValue : function (locate, value) {
    var el;
    return locate
      .then(function (located) {
        el = located;
        return el.isSelected();
      })
      .then(function (isSelected) {
        if (isSelected && !value || !isSelected && value) {
          return el.click();
        }
      });
  },
  setInputValue : function (locate, value) {
    return locate
      .then(function (el) {
        return el.click().clear().sendKeys(value);
      });
  }
};
