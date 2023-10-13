import { systemRoles } from "../../utilities/systemRoles.js";



export const categoryRoles = {

    createCategory : [systemRoles.Admin , systemRoles.SuperAdmin] ,
    updateCategory:[systemRoles.Admin , systemRoles.SuperAdmin],
    deleteCategory:[systemRoles.Admin , systemRoles.SuperAdmin],
}