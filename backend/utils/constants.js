const passwordRegex = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/);
const UrlRegex=new RegExp(/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/);
const statusEnum=["active","inactive","blocked"];
const genderEnum=["male", "female", "other"];
const roleEnum=["guest","member","admin"];
const fullAccess=["admin"];



module.exports={
    passwordRegex,
    UrlRegex,
    statusEnum,
    genderEnum,
    roleEnum,
    fullAccess
};