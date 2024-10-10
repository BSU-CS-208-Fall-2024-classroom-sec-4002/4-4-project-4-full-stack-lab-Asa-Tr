import express from 'express'
import sql from 'sqlite3'

const sqlite3 = sql.verbose()

// Create an in memory table to use
const db = new sqlite3.Database(':memory:')

//I made this only create the table if it doesn't exist already
db.run(`CREATE TABLE IF NOT EXISTS todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL)`)

const app = express()
app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'pug')
app.use(express.urlencoded({ extended: false }))

//Base page that loads the tasks object to the pug file
app.get('/', function (req, res) {
    const local = { tasks: [] }
    db.each('SELECT id, task FROM todo', function (err, row) {
        if (err) {
            console.log(err)
        } else {
            local.tasks.push({ id: row.id, task: row.task })
        }
    }, function (err, count) {
        if (!err) {
            res.render('index', local)
        } else {
            console.log(err)
        }
    })
    console.log('GET called')
})
//path that adds a new element to the database if it meets requirements
app.post('/', function (req, res) {
    console.log('adding todo item')
    //basic input checks for a SQL non-null text sequence
    if(req.body.todo != null && req.body.todo.length > 0 && req.body.todo.substring(0,2)!='--'){
        const stmt = db.prepare('INSERT INTO todo (task) VALUES (?)')
        stmt.run(req.body.todo)
        stmt.finalize()
    }else{
        console.log(`Failed to add the element ${req.body.todo} to the database since it contains an improper format.`)
    }
    res.redirect('/')
})
//path that removes an element from the database if it meets requirements
app.post('/delete', function (req, res) {
    console.log('deleting todo item')
    if(req.body.id != null && typeof parseInt(req.body.id) == Number){
        const stmt = db.prepare('DELETE FROM todo where id = (?)')
        stmt.run(req.body.id)
        stmt.finalize()
    }else{
        console.log(`Failed to remove the element with id ${req.body.id} from the database since it contains an improper format.`)
    }
    res.redirect('/')
})
//path that clears the whole table and starts anew
app.post('/clear', function (req, res) {
    console.log('clearing todo list')
    db.run('DROP TABLE todo')
    db.run(`CREATE TABLE IF NOT EXISTS todo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL)`)
    res.redirect('/')
})
// Start the web server
app.listen(3000, function () {
    console.log('Listening on port 3000...')
})
