const Restaurant = require("../models/Restaurant");


//@desc     Get all restaurants
//@route    Get /api/v1/hospitals
//@access   Public

exports.getRestaurants = async (req,res,next)=>{

    let query;

    //copy req.query
    const reqQuery = {...req.query};
    //Field to exclude
    const removeFields = ['select','sort','page','limit'];
    //loop over remove fields and delete them from reqQuery
    removeFields.forEach(param=> delete reqQuery[param]);

    //create query string
    let queryStr  = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=> `$${match}`);
    query = Restaurant.find(JSON.parse(queryStr)).populate('reservations');
    // select fields
    if (req.query.select){
        const fields=req.query.select.split(',').join(" ");
        query = query.select(fields);
    }
    //sort
    if (req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }
    else{
        query = query.sort('-createdAt');

    }
    //pagination
    const page = parseInt(req.query.page,10)||1;
    const limit = parseInt(req.query.limit,10)||25;
    const startIndex = (page-1)*limit;
    const endIndex = page*limit;
   

    
    try{
        const total = await Restaurant.countDocuments();
        query = query.skip(startIndex).limit(limit);

        const restaurants = await query
        // page result
        const pagination = {};
        if (endIndex<total){
            pagination.next = {
                page:page+1,
                limit
            }
        }
        if (startIndex>0){
            pagination.prev= {
                page:page-1,
                limit
            }
        }
        
        res.status(200).json({success:true,count: restaurants.length, data:restaurants});
    } catch(err){
        res.status(400).json({success:false});
    } 
};

//@desc     Get single hospital
//@route    Get /api/v1/hospitals/:id
//@access   Public

exports.getRestaurant = async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant)
            return res.status(400).json({success:false});
        
        res.status(200).json({success:true, data:restaurant})

    } catch(err){
        res.status(400).json({success:false});
    }
};

//@desc     Create hospital
//@route    POST /api/v1/hospitals
//@access   Private

exports.createRestaurant = async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.create(req.body);
        res.status(201).json({success:true,data:restaurant});        
    } catch(err) {
        res.status(400).json({success:false});
        console.log(err.stack);
    }

};

//@desc     Update single hospital
//@route    PUT /api/v1/hospitals/:id
//@access   Private

exports.updateRestaurant = async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
         
        if (!restaurant){
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true,data:restaurant});

    }catch(err){

        return res.status(400).json({success:false});
    }
   
};

//@desc     Delete single hospital
//@route    DELETE /api/v1/hospitals/:id
//@access   Private

exports.deleteRestaurant = async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id);
        
        if(!restaurant){
            return res.status(400).json({success:false});
        }

        restaurant.remove();

        res.status(200).json({success:true,data:{}});
    } catch(err){
        res.status(200).json({success:false});
    }
    
};


