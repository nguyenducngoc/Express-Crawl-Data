const logger = require('morgan')
const express = require('express')
var bodyParser = require('body-parser')
const MovieModel = require('./models/movie')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const crawlDatadetail = async (movieUrl) => {
    const { data } = await axios.get(movieUrl)
    const $ = cheerio.load(data)

    const movieTitle = $(".myui-content__detail h1.title").text().trim()
    const relaseYear = $(".myui-media-info .info-block h6").text().trim()
    const episode = $('.myui-media-info .badge').text().trim()
    const rating = $("#average").text().trim()

   return {
    movieTitle,
    relaseYear,
    episode,
    rating
   } 
}

const crawlMovies = async (url) => {
    try {
        const { data } = await axios.get(url)
        const $ = cheerio.load(data)
        const MovieElements = $("li.col-lg-4.col-md-4.col-sm-3.col-xs-3")
        // console.log(MovieElements)

        const movies = []

        for (let i = 0; i < MovieElements.length; i++) {
            const elem = MovieElements[i]
            const movieElement = $(elem).find(".myui-vodlist__thumb")
            const movieUrl = movieElement.attr("href")
            // console.log(i,movieUrl)
            
            const fullLink = `${movieUrl}`
            // console.log(fullLink)
            const movieDetails = await crawlDatadetail(fullLink)
            // console.log(movieDetails.movieTitle)
            movies.push({
                title : movieDetails.movieTitle,
                url : movieUrl,
                relase : movieDetails.relaseYear,
                episode : movieDetails.episode,
                rating : movieDetails.rating
            }) 
        } return movies 
    } catch (error) {
        console.error("Error", error)
    }
}

app.post('/crawl', async (req, res, next) => {
    const url = req.body.url

    try {
        const movies = await crawlMovies(url)

        for (const movie of movies) {
            await MovieModel.create({

                title: movie.title,
                url: movie.url,
                relase : movie.relase,
                episode: movie.episode,
                rating: movie.rating
            })
        }

        res.json({ message: 'Done', movies })
    } catch (err) {
        res.status(500).json({ error: 'Error' })
    }
});

// Configure the app port
const port = process.env.PORT || 3000
app.set('port', port)

// Load middlewares
app.use(logger('dev'))

// Start the server and listen on the preconfigured port
app.listen(port, () => console.log(`App started on port ${port}.`))