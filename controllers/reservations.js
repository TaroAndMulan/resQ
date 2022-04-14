const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');

//@desc add reservation
//@route POST /api/v1/hospitals/:hospitalId/reservation
//@access Private
exports.addReservation= async(req,res,next)=>{
    try{
        req.body.restaurant = req.params.restaurantId;

        const restaurant = await Restaurant.findById(req.params.restaurantId);

        if(!restaurant){
            return res.status(404).json({success:false,
                message:`no restaurant with the id of ${req.params.restaurantId}`});
        }

        req.body.user = req.user.id;
        const existedReservations = await Reservation.find({user:req.user.id});
        if (existedReservations.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,message:`the user with ID ${req.user.id} has already made 3 reservation`});
        }

        const reservation = await Reservation.create(req.body);
        res.status(200).json({
            success:true,
            data:reservation
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot create reservation"});
    }
};



//@desc Get all reservations
//@route GET /api/v1/reservations
//@access Private
exports.getReservations= async (req,res,next)=>{
    let query;
    // general user can see only their reservations!
    if(req.user.role !== 'admin'){
        query = Reservation.find({user:req.user.id}).populate({
            path:'restaurant',
            select: 'name address tel'
        });
    }
    else{ //if admin , can see all appoiontments
        if (req.params.hospitalId){
            query= Reservation.find({hospital:req.params.hospitalId}).populate({
                path:'restaurant',
                select:'name address tel'
            });
        }
        else {
            query = Reservation.find().populate({
            path:'restaurant',
            select: 'name address tel'
        });
        }
    }
    try{
        const reservations = await query;
        res.status(200).json({
            success:true,
            count: reservations.length,
            data: reservations
        });     
    }catch(err){
        console.log(err.stack);
        return res.status(500).json({
            success:false,
            message:"cannot find reservation"
        });

    }
};



exports.getReservation = async (req,res,next)=> {
    try{
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'restaurant',
            select: 'name address tel'
        });
        if(!reservation){
            return res.status(404).json({success:false,message:`No reservation with the id of ${req.params.id}`});
        }
        res.status(200).json({
            success:true,
            data:reservation
        });
    } catch (error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot find reservation"});
    }
};


//@desc Update reservation
//@route PUT /api/v1/reservations/:id
//@access Private

exports.updateReservation = async (req,res,next)=>{
    try{
        let reservation = await Reservation.findById(req.params.id);
        if(!reservation){
            return res.status(404).json({success:false,message:`No reservation with the id of ${req.params.id}`});
        }

        if (reservation.user.toString()!==req.user.id && req.user.role !=='admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorize to update this reservation`});
        }
        reservation = await Reservation.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        res.status(200).json({
            success:true,
            data:reservation
        });
    } catch (error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot update reservation"});
    }
};

//@desc Update reservation
//@route PUT /api/v1/reservations/:id
//@access Private

exports.deleteReservation = async (req,res,next)=>{
    try{
        const reservation = await Reservation.findById(req.params.id);
        if(!reservation){
            return res.status(404).json({success:false,message:`No reservation with the id of ${req.params.id}`});
        }

        if (reservation.user.toString()!==req.user.id && req.user.role !=='admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorize to delete this reservation`});
        }

        await reservation.remove();

        res.status(200).json({
            success:true,
            data:{}
        });
    } catch (error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot delete reservation"});
    }
};

