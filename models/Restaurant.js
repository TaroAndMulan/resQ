const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required : [true, 'please add a name'],
        unique : true,
        trim : true,
        maxlength : [50,'Name can not be more than 50 characters']
    },
    address:{
        type: String,
        required: [true,'Please add an address']
    },
    tel:{
        type: String,
        required: [true,'Please add a telephone number']
    },
    open: {
        type: Number,
        required: [true, 'Please add an operating time']
    },
    closed:{
        type: Number,
        required: [true, 'Please add closing time']
    },
    capacity:{
        type: Number,
        required: [true, 'Please add maximum capacity']
    }

},{
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
});

RestaurantSchema.virtual('reservations',{
    ref: 'Reservation',
    localField: '_id',
    foreignField: 'restaurant',
    justOne:false
});

//casecade delete appointments when a restaurant is deleted
RestaurantSchema.pre('remove', async function(next){
    console.log(`Reservation being removed from restaurant ${this._id}`);
    await this.model('Reservation').deleteMany({restaurant: this._id});
    next();
})

module.exports = mongoose.model('Restaurant', RestaurantSchema);
