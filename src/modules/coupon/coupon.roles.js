import { systemRoles } from "../../utilities/systemRoles.js";



export const  couponRoles = {

    addCoupon : [systemRoles.Admin , systemRoles.SuperAdmin] ,
    updateCoupon : [systemRoles.Admin , systemRoles.SuperAdmin] ,
    deleteCoupon : [systemRoles.Admin , systemRoles.SuperAdmin] ,

}