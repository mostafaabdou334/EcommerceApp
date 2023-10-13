import { systemRoles } from "../../utilities/systemRoles.js";



export const productRoles = {

    addProduct: [systemRoles.Admin, systemRoles.SuperAdmin],
    updateProduct: [systemRoles.Admin, systemRoles.SuperAdmin],
    deleteProduct: [systemRoles.Admin, systemRoles.SuperAdmin],
}