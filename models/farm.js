const mongoose=require("mongoose");


// async function main(){
//     await mongoose.connect('mongodb://127.0.0.1:27017/bnb');
// }   
// main().then(()=>{
//     console.log("connected");
// }
// ).catch((err)=>{
//     console.log(err);
// })


const farmSchema=new mongoose.Schema({
    
    description:{
        type:String,
    },   
    image:{
        type:String,
        set:(v)=>v===""?"https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG91c2V8ZW58MHx8MHx8fDA%3D":v,
        default:"https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG91c2V8ZW58MHx8MHx8fDA%3D"
    },
    area:String,
    price:Number,
    location:String,
    state:String,
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"

    },

})

const farm=mongoose.model("Farm",farmSchema);

module.exports=farm;