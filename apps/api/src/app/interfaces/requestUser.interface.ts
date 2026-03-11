import { Role } from "../constants/index";

export interface IRequestUser{
    userId : string;
    role : Role;
    email : string;
}