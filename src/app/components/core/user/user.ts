export interface User {
    id: number,
    password: string,
    name: string,
    telephone: string,
    anydesk?: string,
    email: string,
    companieId: number,
    department: number,
    type: string,
    active: string,
    isSuperAdmin?: boolean

}