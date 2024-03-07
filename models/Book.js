const mongoose = require("mongoose");

// Define the Book model schema here
const bookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.String,
      ref: "User",
    },
    title: String,
    author: String,
    publicationYear: Number,
    description: String,
    price: Number,
    publisher: String,
    language: String,
    image: String,
    userEmail: String,
    quantity: Number,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);
// export const Book=mongoose.model('Book',bookSchema)
module.exports = mongoose.model("Book", bookSchema);
