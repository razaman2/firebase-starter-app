export default [
    {
        path: "roles",
        component: () => import("../pages/Roles.vue"),
        meta: {requiresAuth: true, rolesAllowed: ["super"]},
    },
];
