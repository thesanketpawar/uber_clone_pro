const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

mongoose.connect(`${process.env.MONGO_URI}`,{
    autoIndex: true
})

mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected...');
});

mongoose.connection.on('error', (err) => {
    console.log(err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose is disconnected...');
});

process.on('SIGINT', () => {
    mongoose.connection.close(() => {       
        console.log('Connection to MongoDB closed...');
        process.exit(0);
    });
});

module.exports = mongoose