const mongoose=require("mongoose");

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/order');
        console.log("Connected to Db");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }   
}
main();

const orderchema=new mongoose.Schema({
    item:String,
    price:Number

})
const order=mongoose.model("order",orderchema);

module.exports=order;