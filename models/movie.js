const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/dbhi',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Schema = mongoose.Schema

const MovieSchema = new Schema({
    title: String,
    url: String,
    relase: String,
    episode: String,
    rating: String,
})

const MovieModel = mongoose.model('movie', MovieSchema)

module.exports = MovieModel