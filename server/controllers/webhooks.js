import pkg from 'svix';
const { Webhooks } = pkg;
import User from "../models/User.js"

// API controller function to manage clerk wuse with database

export const clerkWebhooks = async(req , res)=>{
    try{
        // CREATE a svix instance wiith webhook secret 
        const whook = new Webhooks({
            secret: process.env.CLERK_WEBHOOK_SECRET
        })

            // verifying header 
        await whook.verify(JSON.stringify(req.body),{
            "svix-id" : req.headers["svix-id"],
            "svix-timestamp" : req.headers["svix-timestamp"],
            "svix-signature" : req.headers["svix-signature"],

        }
        )

        // getting data from request body
        const {data , type} = req.body;

        // sWITCH CASE FOR DIFFERENT EVENT 
        switch(type){
            case "user.created":{
                const userData ={
                    _id:data.id,
                    email:data.email_addresses?.[0]?.email_address || "",
                    name:(`${data.first_name || ""} ${data.last_name || ""}`).trim(),
                    image:data.image_url,
                    resume:'',  
                }
                await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true, setDefaultsOnInsert: true })
                res.json({})
                break;

            }

            case "user.updated":{
                const userData ={
                   
                    email:data.email_addresses?.[0]?.email_address || "",
                    name:(`${data.first_name || ""} ${data.last_name || ""}`).trim(),
                    image:data.image_url,
                   
                }
                await User.findByIdAndUpdate(data.id,userData)
                res.json({})
                break;
                
            }
               case "user.deleted":{
                await User.findByIdAndDelete(data.id)
                res.json({})
                break;
                
            }
                
            default:
                // handle default event
                break;
        }
    }catch(err){
        console.log(err)
        res.json({success:false , message:'Webhook error'})
    
    }

}
