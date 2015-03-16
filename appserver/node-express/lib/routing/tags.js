
var dummy = {
  'values-response': {
    'name':'tags',
    'type':'xs:string',
    'aggregate-result':[
      {
        'name':'count',
        '_value':'0'
      }
    ],
    'metrics':{
      'values-resolution-time':'PT0.005573S',
      'aggregate-resolution-time':'PT0.000495S',
      'total-time':'PT0.044434S'
    },
    'distinct-value':[]
  }
};

module.exports = function (app, mw) {
  app.post('/v1/tags', function (req, res) {
    res.send(dummy);
  });
};
