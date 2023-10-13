import { systemRoles } from "../../utilities/systemRoles.js";



export const  cartRoles = {

    addToCart : [systemRoles.Admin , systemRoles.SuperAdmin , systemRoles.User] ,
    updateToCart : [systemRoles.Admin , systemRoles.SuperAdmin , systemRoles.User] ,
    deleteProduct : [systemRoles.Admin , systemRoles.SuperAdmin ,systemRoles.User] ,

}