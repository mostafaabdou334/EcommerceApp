import { systemRoles } from "../../utilities/systemRoles.js";



export const  brandRoles = {

    createBrand : [systemRoles.Admin , systemRoles.SuperAdmin] ,
    updateBrand :[systemRoles.Admin , systemRoles.SuperAdmin],
    deleteBrand :[systemRoles.Admin , systemRoles.SuperAdmin],
}