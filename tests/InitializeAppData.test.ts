import "@src/firebase-init-auth";
import {it, beforeEach} from "vitest";
import {Collection, getCollectionRelationship} from "@razaman2/firestore-proxy";
import {initializeTestApp, getAdminContext} from "@razaman2/firestore-testing";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential} from "firebase/auth";
import {faker} from "@faker-js/faker";

beforeEach(async () => {
    await initializeTestApp();
});

const email = "user@firestore.com".trim().toLowerCase();
const password = "password";

it("initialize app data", () => {
    return getAdminContext(async (getFirestore) => {
        const batch = getFirestore.batch();

        const auth = await [{}].reduce(() => {
            return new Promise(async (resolve) => {
                try {
                    resolve(await createUserWithEmailAndPassword(getAuth(), email, password));
                } catch {
                    resolve(await signInWithEmailAndPassword(getAuth(), email, password));
                }
            });
        }, {}) as UserCredential;

        const company = Collection.proxy("companies", {getFirestore}).setData({name: "Test Company"});

        const user = Collection.proxy("users").setData({
            id: auth.user.uid,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        });

        await Promise.all([
            company.create({batch}),

            user.create({batch}),

            // company settings
            Collection.proxy("settings").setParent(company).create({
                batch,
                data: {
                    id: company.getDoc().id,
                    status: "active",
                },
            }),

            // user settings within company
            Collection.proxy("settings", {
                parent: user,
                owners: [company],
            }).create({
                batch,
                data: {
                    id: company.getDoc().id,
                    status: "active",
                    path: `/user/${user.getDoc().id}`,
                },
            }),

            // user email
            Collection.proxy("emails").setParent(user).create({
                batch,
                data: {address: email, primary: true},
            }),

            // app settings
            Collection.proxy("settings").create({
                batch,
                data: {
                    id: 1,
                    user: {
                        statuses: [
                            {id: "active", name: "Active"},
                            {id: "inactive", name: "Inactive"},
                            {id: "trial", name: "Trial"},
                        ],
                    },
                    company: {
                        statuses: [
                            {id: "active", name: "Active"},
                            {id: "inactive", name: "Inactive"},
                            {id: "trial", name: "Trial"},
                        ],
                    },
                },
            }),

            // user role
            Collection.proxy("roles", {
                parent: user,
                owners: [company],
            }).create({
                batch,
                data: {id: "super"},
            }),

            Collection.proxy("roles").create({
                batch,
                data: {
                    id: "super",
                    name: "Super",
                },
            }),

            Collection.proxy("roles").create({
                batch,
                data: {
                    id: "admin",
                    name: "Admin",
                },
            }),

            Collection.proxy("roles").create({
                batch,
                data: {
                    id: "user",
                    name: "User",
                },
            }),
        ]);

        await batch.commit();
    });
});

it("add company", async () => {
    await signInWithEmailAndPassword(getAuth(), email, password);

    return getAdminContext(async (getFirestore) => {
        const batch = getFirestore.batch();

        const user = Collection.proxy("users", {getFirestore}).setDoc(getAuth().currentUser?.uid!);

        const company = Collection.proxy("companies").setData({name: faker.company.name()});

        const role = await Collection.proxy("roles").setParent(user).init("super");

        await Promise.all([
            company.create({batch}),

            Collection.proxy("settings").setParent(company).create({
                batch,
                data: {
                    id: company.getDoc().id,
                    status: "active",
                },
            }),

            Collection.proxy("settings", {
                parent: user,
                owners: [company],
            }).create({
                batch,
                data: {
                    id: company.getDoc().id,
                    status: "active",
                    path: `/user/${user.getDoc().id}`,
                },
            }),

            role[role.getData("id") ? "update" : "create"]({
                batch,
                data: {
                    belongsTo: [getCollectionRelationship(company)].concat(role.getData("belongsTo")),
                },
            }),
        ]);

        await batch.commit();
    });
});
