
/* CONST ENUM DEFINITIONS */
export enum UserPermission {
    User = 'U',
    Admin = "A",
    Manager = "M",
    Worker = "W",
}

/* STATIC HELPER FUNCTIONS */
export const isValidMongoId = (id: string) => {
    const hexStringRegex = /^[0-9a-fA-F]{24}$/;     //mongoose ID regex format

    return hexStringRegex.test(id)
}

