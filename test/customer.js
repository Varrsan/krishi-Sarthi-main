const mongoose=require("mongoose");
let order=require("./order.js");

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/customer');
        console.log("Connected to Db");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }   
}
main();
const customerSchema=new mongoose.Schema({
    username:String,
    email:String,
    orders:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'order'

    }]

})


const customer=mongoose.model("customer",customerSchema);


async function addCustomer(){
    customer1=new customer({
        username:"Ganesh",
        email:"ganesh@gmail.com"

    })

    await customer1.save();
    console.log(customer1);
    const res=customer.find({});
    console.log(res[0])
}



async function addOrder(){ 
    order1=new order({
        item:"maggi",
        price:25
    })

    await order1.save();

}

 addCustomer();
// addOrder();

// customer1.orders=order1;
