const express=require("express");
const ejs=require("ejs");
const mongoose=require("mongoose");
const path=require("path");
const methodoverride=require("method-override");
const ejsmate=require("ejs-mate");
const wrapasync=require("./utils/wrapasync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,farmSchema}=require("./schema.js");

const user=require("./models/user.js");


//new
const session = require('express-session');
const passport=require("passport");
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');

const {isLoggedIn, saveRedirectUrl}=require("./middleware.js");
const sessionOptions = {
    secret: '@123', // Replace 'your-secret-key' with an actual secret key
    resave: false,
    saveUninitialized: true
    // Add other options as needed

};









const app=express();
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodoverride("_method"));
app.engine("ejs",ejsmate);  
app.use(express.static(path.join(__dirname,"/public")));

const port=3000;


const Listing=require("./models/listing.js");
const Farms=require("./models/farm.js")

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/farmer');
        console.log("Connected to Db");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
main();


app.listen(port,(req,res)=>{
    console.log('ported started');
})

const validation=(req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        const errmsg=error.details.map((el) =>el.message).join(',');
        throw new ExpressError(400,errmsg);
    }
    else{
       next();
    }

}
const farmvalidation=(req,res,next)=>{
    let {error} = farmSchema.validate(req.body);
    if(error){
        const errmsg=error.details.map((el) =>el.message).join(',');
        throw new ExpressError(400,errmsg);
    }
    else{
       next();
    }

}





  //new 
  app.use(session(sessionOptions));
  app.use(flash()); 
app.use(passport.initialize());
app.use(passport.session());
 

passport.use(new LocalStrategy(user.authenticate()));



  
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.success = req.flash("success");
    res.locals.curruser = req.user;
     
     // Setting currUser correctly
     console.log(res.locals.curruser);
    next();
});



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Krishi-Sarthi-main', 'index.html'));
});


app.get("/listings",wrapasync(async (req,res)=>{
  const allListings=await Listing.find({});
  res.render("./listings/index.ejs",{allListings})
    
 }));
          
 app.get("/listings/new", isLoggedIn,(req, res) => {
   
    res.render("./listings/new.ejs");
});

app.get("/listings/:id",wrapasync(async (req,res)=>{
    const id=req.params.id;
    const listings=await Listing.findById(id).populate("owner");
    console.log(listings);

    res.render("./listings/show.ejs",{listings})
}))



app.post("/listings",validation,wrapasync(async (req,res,next)=>{
  
    const title=req.body.title;
    const description=req.body.description;
    const image=req.body.image;
    const price=req.body.price;
    const country=req.body.country;
    const location=req.body.location;
    
    const listing={ title:title,
        description:description,
        image:image,
        price:price,
       location:location,
       country:country}
       listing.owner=req.user._id;

       
    const listingg=new Listing(listing)
    

    await listingg.save();
    res.redirect("/listings")

  
}))

app.get("/listings/:id/edit", isLoggedIn,wrapasync(async (req,res)=>{
    const id=req.params.id;
    const listing=await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing})
}))

app.put("/listings/:id",isLoggedIn,validation,wrapasync(async (req,res)=>{
    const id=req.params.id;
    const listing=await Listing.findById(id);

    listing.title=req.body.title;
    listing.description=req.body.description;
    listing.image=req.body.image;
    listing.price=req.body.price;
    listing.country=req.body.country;
    listing.location=req.body.location;



    await listing.save();

    res.redirect(`/listings/${id}`)
}))
app.delete("/listings/:id",isLoggedIn,wrapasync(async (req,res)=>{
    const id=req.params.id;
   await Listing.findByIdAndDelete(id);
   res.redirect("/listings");
}))



app.get("/crop", isLoggedIn,
 async (req, res) => {
   
      res.render("./listings/input.ejs")
    
  });
  


app.post("/crop",isLoggedIn,async (req,res)=>{

    const selectedState=req.body.state;
    const state=selectedState.split(" ").join("%20");

    const selectedDistrict=req.body.district;
    const district=selectedDistrict.split(" ").join("%20");
    const selectedMarket=req.body.market;
    const market=selectedMarket.split(" ").join("%20");

    fetch(`https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd00000141a109d68de746056cb0591397fd7966&format=json&filters%5Bstate%5D=${state}&filters%5Bdistrict%5D=${district}&filters%5Bmarket%5D=${market}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // console.log(data); // This will log the fetched data to the console
      // Now you can work with the fetched data as needed
      const anss=data.records;
      console.log(anss)
      res.render("./listings/viewCrop.ejs",{anss});
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
   
  
  
  })



// app.get("/demo-user",async (req,res)=>{
//     let fakeUser=new user({
//         phno:9959157565,
//         username:"Ganesh"
//     })
//     const newuser=await user.register(fakeUser,"ganesh");
//     console.log(newuser);
//     res.send(newuser);
// })
app.get("/signup",(req,res)=>{
    res.render("users/signup.ejs"); 
})

app.post("/signup",async (req,res)=>{
    try{
        let {username,phno,password}=req.body
        const newuser=await  new user({
             phno,
             username,
         })
         const registeredUser=await user.register(newuser,password);
         req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to Krishi Sarthi");
            res.redirect("/listings");
         })
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }

})



app.get("/login",(req,res)=>{

    res.render("users/login.ejs")
})

app.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),async (req,res)=>{

    req.flash("success","Welcome to Krishi Sarthi!");
    let redirectUrl=res.locals.redirectUrl || "/listings";

    res.redirect(redirectUrl);

})

app.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","you are loggedout now");
        res.redirect("/listings");  
    })
})


app.get("/farms",wrapasync(async (req,res)=>{
    const allFarms=await Farms.find({});
    res.render("./farms/index.ejs",{allFarms})
      
   }));

   
app.get("/farms/new", isLoggedIn,(req, res) => {
   
    res.render("./farms/new.ejs");
});

app.post("/farms",farmvalidation,wrapasync(async (req,res,next)=>{
  
    const description=req.body.description;
    const image=req.body.image;
    const area=req.body.area;
    const price=req.body.price;
    const location=req.body.location;
    const state=req.body.state;
    console.log(area);
    
    const farm={ 
        description:description,
        image:image,
        area:area,
        price:price,
       location:location,
       state:state
    }
       farm.owner=req.user._id;

       
    const farmm=new Farms(farm);
    

    await farmm.save();
    res.redirect("/farms")

  
}))





app.get("/farms/:id",wrapasync(async (req,res)=>{
    const id=req.params.id;
    const farms=await Farms.findById(id).populate("owner");
    console.log(farms);

    res.render("./farms/show.ejs",{farms})
}))




app.get("/farms/:id/edit", isLoggedIn,wrapasync(async (req,res)=>{
    const id=req.params.id;
    const farm=await Farms.findById(id);
    res.render("./farms/edit.ejs",{farm})
}))

app.put("/farms/:id",isLoggedIn,farmvalidation,wrapasync(async (req,res)=>{
    const id=req.params.id;
    const farm=await Farms.findById(id);

    farm.description=req.body.description;
    farm.image=req.body.image;
    farm.price=req.body.price;
    farm.location=req.body.location;



    await farm.save();

    res.redirect(`/farms/${id}`)
}))
app.delete("/farms/:id", isLoggedIn, wrapasync(async (req, res) => {
    const id = req.params.id;
    const ans=await Farms.findByIdAndDelete(id);
    console.log(ans);
    
    res.redirect("/farms"); // Redirect to the listings index page
}));

app.get("/payments",(req,res)=>{
    res.render("./payments/vehicle.ejs");
})

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
})

app.use((err,req,res,next)=>{
    const {status=500,message="Something went wrong"}=err;
    res.status(status).render("error.ejs",{err})
    // res.status(status).send(message)
})
