const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal then 40 characters"],
      minlength: [10, "A tour name must have more or equal then 10 characters"],
      validators: [validator.isAlpha, "Tour name must only contain characters"]
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"]
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, or difficult"
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"]
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, "A tour must have a price"]
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price; // inside validator function the this keyword is the document when we create a new document, it's not going to work on update
        },
        message: "Discount price ({VALUE}) should be below regular price"
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A `tour must have a description"]
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"]
    },
    images: [String],
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual("durationWeeks").get(function() {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: run before .save() and .create()
tourSchema.pre("save", function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre("save", function(next) {
//   console.log("Will save document");
//   next();
// });

// POST MIDDLEWARE: run after all `pre` middleware
// tourSchema.post("save", function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// query middleware allows us to run functions before and after a query gets executed
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// AGGREGATION MIDDLEWARE allows us to add hooks before or after aggregation can happens
tourSchema.pre("aggregate", function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
