export enum UserRole {
    ADMIN = "ADMIN",
    TEACHER = "TEACHER",
    STUDENT = "STUDENT"
}

export interface UserRegistration {
    name: string;
    password: string;
    email: string;
    phone: string;
    role: UserRole;
    classes: string[];
}