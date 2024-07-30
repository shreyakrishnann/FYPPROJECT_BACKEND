const mongoose = require('mongoose');


mongoose.set('strictQuery', false)
const connectDB = async () => {
    try {
        const mongodb = 'mongodb+srv://FYPPROJECT:Camellia1232005_@cluster0.7zhhsg2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
        const conn = await mongoose.connect(mongodb);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};

module.exports = connectDB;


