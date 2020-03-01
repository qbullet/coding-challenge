const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000

const mongoose = require('mongoose')
const Schema = mongoose.Schema

app.use(express.json())
app.use(cors())

var ticketsSchema //SCHEMA
var tickets //MODEL

const fcc = {
    green:"\x1b[32m%s\x1b[0m",
    yellow:"\x1b[33m%s\x1b[0m",
    red:"\\x1b[31m%s\x1b[0m"
}

mongoose.connect('mongodb+srv://admin:1234@nyquil-qqig0.mongodb.net/coding-challenge?retryWrites=true&w=majority', {useNewUrlParser: true});

// --------------------------------------------------------------------------------------------------------------------------------------------
Tickets_Setup()
// --------------------------------------------------------------------------------------------------------------------------------------------

app.get('/', (req, res) => {
    res.send({
        ok: "true"
    })
})

app.post('/ticket-get', async (req, res) => {
    res.header("Access-Control-Allow-Origin","*")

    const data = await tickets.findOneAndUpdate(
        { amount: { $gt: 0 } },
        { $inc: { amount: -1, latest_id: 1 } },
        { new: true, useFindAndModify: false }
    )

    if (!data) return res.send({ 
        ok: "false",
        message: "OUT"
    })

    await data.save().then(() => console.log(fcc.green,"Got da Tickets"))

    let ticket_id = ''

    if (data.latest_id < 10) ticket_id = data.name + '0' + data.latest_id
    else ticket_id = data.name + data.latest_id

    res.send({
        ok: "true",
        ticket_id: ticket_id
    })
})

app.post('/ticket-isAvailable',async (req, res) => {
    res.header("Access-Control-Allow-Origin","*")
    let {data} = req.body
    
    const found = await tickets.findOne({name:data})

    if(!found) return res.send({
        ok: "false",
    })

    res.send({
        ok: "true",
        availDate: found.availDate
    })
})

// --------------------------------------------------------------------------------------------------------------------------------------------

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

function Tickets_Setup(){
    ticketsSchema = new Schema({
        name:String,
        amount:Number,
        latest_id:Number,
        availDate:{
            date:String,
            time:Number
        }
    })
    
    tickets = mongoose.model('tickets',ticketsSchema)
}

async function Ticket_Insert(_name,_amount,_date,_time){
    const ticketInsert = new tickets({ 
        name:_name,
        amount:_amount,
        latest_id:0,
        availDate:{
            date:_date,
            time:_time
        }
    });
    await ticketInsert.save().then(() => console.log(fcc.yellow ,'Tickets has been insert!'));
}

// --------------------------------------------------------------------------------------------------------------------------------------------

app.listen(port, () => {
    console.log(`Blackpink-Freeticket\'server is running on port:${port}`)
})