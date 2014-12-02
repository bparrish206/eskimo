
// # sport

var jsonSelect = require('mongoose-json-select');
var mongoosePaginate = require('mongoose-paginate');

exports = module.exports = function(mongoose, iglooMongoosePlugin) {

  var Sport = new mongoose.Schema({
    name: {
      type: String,
      required: true
    }
  });

  // virtuals
  Sport.virtual('object').get(function() {
    return 'sport';
  });

  // plugins
  //Sport.plugin(jsonSelect, '-_group -salt -hash');
  Sport.plugin(mongoosePaginate);

  // keep last
  Sport.plugin(iglooMongoosePlugin);

  return mongoose.model('Sport', Sport);
};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/mongo', 'igloo/mongoose-plugin' ];
