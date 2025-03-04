const passwordRegex = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/);
const UrlRegex=new RegExp(/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/);
const statusEnum=["active","inactive","blocked"];
const genderEnum=["male", "female", "other"];
const roleEnum=["guest","member","admin"];
const fullAccess=["admin"];
const PERMISSIONS = {
    VIEW_DASHBOARD: "view:dashboard",
    EDIT_DASHBOARD: "edit:dashboard",
    VIEW_INVOICES_DASHBOARD: "view:invoices:dashboard",
    VIEW_LICENSES_DASHBOARD: "view:licenses:dashboard",
    VIEW_ASSETS_DASHBOARD: "view:assets:dashboard",
    VIEW_USERS: "view:users",
    VIEW_ASSETS: "view:assets",
    VIEW_LICENSES: "view:licenses",
    VIEW_INVOICES: "view:invoices",
    VIEW_CHECKOUTS: "view:checkouts",
    EDIT_INVOICES_DASHBOARD: "edit:invoices:dashboard",
    EDIT_LICENSES_DASHBOARD: "edit:licenses:dashboard",
    EDIT_ASSETS_DASHBOARD: "edit:assets:dashboard",
    EDIT_USERS: "edit:users",
    EDIT_ASSETS: "edit:assets",
    EDIT_LICENSES: "edit:licenses",
    EDIT_INVOICES: "edit:invoices",
    EDIT_CHECKOUTS: "edit:checkouts",
    CREATE_INVOICES_DASHBOARD: "create:invoices:dashboard",
    CREATE_LICENSES_DASHBOARD: "create:licenses:dashboard",
    CREATE_ASSETS_DASHBOARD: "create:assets:dashboard",
    CREATE_USERS: "create:users",
    CREATE_ASSETS: "create:assets",
    CREATE_LICENSES: "create:licenses",
    CREATE_INVOICES: "create:invoices",
    CREATE_CHECKOUTS: "create:checkouts",
    DELETE_INVOICES_DASHBOARD: "delete:invoices:dashboard",
    DELETE_LICENSES_DASHBOARD: "delete:licenses:dashboard",
    DELETE_ASSETS_DASHBOARD: "delete:assets:dashboard",
    DELETE_USERS: "delete:users",
    DELETE_ASSETS: "delete:assets",
    DELETE_LICENSES: "delete:licenses",
    DELETE_INVOICES: "delete:invoices",
    DELETE_CHECKOUTS: "delete:checkouts",
};


module.exports={
    passwordRegex,
    PERMISSIONS,
    UrlRegex,
    statusEnum,
    genderEnum,
    roleEnum,
    fullAccess
};