import { systemRoles } from "../../utilities/systemRoles.js";



export const subCategoryRoles = {

    createSubCategory : [systemRoles.Admin , systemRoles.SuperAdmin] ,
    updateSubCategory:[systemRoles.Admin , systemRoles.SuperAdmin],
    deleteSubCategory:[systemRoles.Admin , systemRoles.SuperAdmin],
}