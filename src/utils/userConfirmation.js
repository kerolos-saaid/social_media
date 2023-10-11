import sendEmail, {createHTML} from "./email.js";
import {nanoid} from "nanoid";

export async function sendCodeToEmail(user,codeType,subject) {
    //send email with nanoid code to confirm email and set expire date after 2 minutes from now
    const code = nanoid(6);
    const expireDate = new Date(Date.now() + 2 * 60 * 1000);
    //set code and expire date to user object and save it to database
    user[codeType] = {code, expireDate: new Date().getTime()+120000};
    await user.save()
    const html = createHTML(code)
    await sendEmail({to: user.email,subject, html});
    return user;
}