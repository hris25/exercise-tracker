const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
let UserModels = require('./src/models/user')
let ExcerciseModels = require('./src/models/exercise')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html') 
});

app.route('/api/users')
  .post( (req, res) => {
    let user = new UserModels({username: req.body.username})
    user.save().then( data => {
      res.json({username: data.username, _id: data._id})
    }).catch( err => {
      res.json({error: err})
    })
  })
  .get( (req, res) => {
    UserModels.find({}).then(users => {
      res.json(users)
    }).catch( err => {
      res.json({error: err})
    })
  })

app.route('/api/users/:_id/exercises').post( (req, res) => {
  UserModels.findById(req.params._id).then( user => {
    if(user){
      let exercise = new ExcerciseModels({
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date ? new Date(req.body.date) : new Date()
      })
      user.exercises.push(exercise)
      user.save().then( data => {
        res.json({
          _id: data._id,
          username: data.username,
          date: exercise.date.toDateString(),
          duration: exercise.duration,
          description: exercise.description
        })
      }).catch( err => {
        res.json({error: "Error saving exercise"})
      })
    }else{
      res.json({error: 'User not found'})
    }
  }).catch( err => {
    res.json({error: err})
  })
})


app.get('/api/users/:_id/logs', (req, res) => {

  UserModels.findById({_id: req.params._id}).then( user => {
    if(user){
      let from = req.query.from ? new Date(req.query.from) : new Date(0)
      let to = req.query.to ? new Date(req.query.to) : new Date()
      let limit = req.query.limit ? parseInt(req.query.limit) : user.exercises.length
      let logs = user.exercises.filter( exercise => {
        return exercise.date >= from && exercise.date <= to
      }).slice(0, limit)
      res.json({
        _id: user._id,
        username: user.username,
        count: logs.length,
        log: logs
      })
    }else{
      res.json({error: 'User not found'})
    }
  }).catch( err => {
    res.json({error: err})
  })

})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
