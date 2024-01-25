const { Schema, model } = require('mongoose');

const DocumentSchema = new Schema({
  _id: {
    type: String,
    default: '',
    required: true, // You can add required constraint if needed
  },
  data: {
    type: Object,
    default: {}, // You can provide a default value for the data field
  },
});

module.exports = model('Document', DocumentSchema);
