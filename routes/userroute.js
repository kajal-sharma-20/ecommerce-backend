import express from "express";

import { adduser, allusers, deleteuser, updateuser, userdetails} from "../controllers/usercontroller.js";
import { checktoken, logout, resendotp, sendotp, verifyotp } from "../controllers/otpcontroller.js";
import upload from "../lib/multer.js";
import { addproduct, deleteproduct, getproduct, getproducts, updateproduct} from "../controllers/productcontroller.js";
import { addtocart, getcartitems, removeFromCart, updateCartQuantity } from "../controllers/cartcontroller.js";
import { addToWishlist, getWishlistItems, removeFromWishlist } from "../controllers/wishlistcontroller.js";
import { createorder, getallorders, getOrderById, getordersummary, getuserorders, requestCancelOrder, updateOrderStatus } from "../controllers/ordercontroller.js";
import { createplans, getplans } from "../controllers/plancontroller.js";
import { cancelsubscription, createsubscription } from "../controllers/subscriptioncontroller.js";
import { getPendingCancelRequests, getTotalCancelRequests, getTotalOrders, handleRequest, updateDeliveryStatus } from "../controllers/admincontroller.js";


export const router = express.Router();

//userroutes
router.post("/adduser", adduser);   

router.post("/sendotp",sendotp)

router.post("/verifyotp",verifyotp)

router.post("/resendotp",resendotp)

router.put("/updateuser/:id", upload.single("profile"), updateuser);

router.get("/userdetails/:id",userdetails)

router.get("/allusers",allusers)

router.delete("/deleteuser/:id",deleteuser)

router.post("/logout", logout);

router.get("/verify", checktoken);


//productroutes
router.post(
  "/addproduct",
  upload.fields([
    { name: "main_image", maxCount: 1 }, // main image
    { name: "image", maxCount: 5 }     // other images
  ]),
  addproduct
);

router.get("/getproduct/:id",getproduct)

router.get("/getproducts",getproducts)

router.delete("/deleteproduct/:id",deleteproduct)

router.put(
  "/updateproduct/:id",
  upload.fields([
    { name: "main_image", maxCount: 1 }, // main image
    { name: "image", maxCount: 5 }     // other images
  ]),
  updateproduct
);



//cartroutes
router.post("/addtocart/:userId/:productId",addtocart)

router.get("/getcartitems/:userId",getcartitems)

router.put("/updatecart/:userId/:productId", updateCartQuantity); 

router.delete("/removecart/:userId/:productId", removeFromCart);      



//wishlistroutes
router.post("/addtowishlist/:userId/:productId", addToWishlist);

router.get("/getwishlist/:userId", getWishlistItems);

router.delete("/removewishlist/:userId/:productId", removeFromWishlist);


//orderroutes
router.post("/createorder/:id",createorder)

router.get("/getuserorders/:id",getuserorders)

router.get("/getordersummary/:userId",getordersummary)

router.get("/getallorders",getallorders)

router.get("/getorderbyid/:id",getOrderById)

router.patch("/updateorderstatus/:orderId",updateOrderStatus)

router.put("/requestCancel/:orderId", requestCancelOrder);

//planroutes
router.post("/createplans",createplans)

router.get("/getplans/:userId",getplans)


//subscriptionroutes
router.post("/createsubscription",createsubscription)

router.delete("/cancelsubscription",cancelsubscription)


//adminroutes
router.patch("/updatedeliverystatus/:id", updateDeliveryStatus);

router.get("/getpendingrequests",getPendingCancelRequests)

router.patch("/handlerequest/:orderId",handleRequest)

router.get("/gettotalrequests", getTotalCancelRequests);

router.get("/gettotalorders", getTotalOrders);



