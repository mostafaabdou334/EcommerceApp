import { systemRoles } from "../../utilities/systemRoles.js";



export const orderRoles = {

    createOrder : [systemRoles.Admin , systemRoles.SuperAdmin , systemRoles.User] ,
}