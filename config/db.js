const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose
    .connect(process.env.MONGO_URI, {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    })
    .then(() => console.log(`==>DevConnect mongoDB connected!<==`))
    .catch((err) => {
      console.log(`Error: ${err.message}`);
      process.exit(1);
    });
};

module.exports = connectDB;
