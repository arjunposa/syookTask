const mongoose = require('mongoose');

const obj = { name: 'arjun', age: 22, qualification : "Bsc-Cs" };

mongoose.connect('mongodb://127.0.0.1:27017/Users3', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');

  // Define a schema
  const dataSchema = new mongoose.Schema({
    name: String,
    age: Number,
    qualifying: String,
  });

  // Create a model
  const DataModel = mongoose.model('Data', dataSchema);

  // Example data to insertco
  const dataToInsert = new DataModel(obj);

  // Insert the data
  dataToInsert.save()
    .then(() => {
      console.log('Data inserted successfully');
      mongoose.connection.close();
    })
    .catch(err => {
      console.error('Error inserting data:', err);
      mongoose.connection.close();
    });
});

mongoose.connection.on('error', err => {
  console.error('Connection failed with error:', err);
});
