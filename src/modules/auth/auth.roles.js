import { systemRoles } from "../../utilities/systemRoles.js";



export const userRoles = {

    changPassword: [systemRoles.Admin, systemRoles.SuperAdmin],
    updateProfile: [systemRoles.Admin, systemRoles.SuperAdmin],
    deleteOneUser: [systemRoles.Admin, systemRoles.SuperAdmin],
    softDeleteUser: [systemRoles.Admin, systemRoles.SuperAdmin],
    logOut: [systemRoles.Admin, systemRoles.SuperAdmin],



}