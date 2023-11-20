import "../src/firebase-auth-init";
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
                } catch (e) {
                    resolve(await signInWithEmailAndPassword(getAuth(), email, password));
                }
            });
        }, {}) as UserCredential;

        const user = Collection.proxy("users", {
            payload: {
                data: {
                    id: auth.user.uid,
                    firstName: "Ainsley",
                    lastName: "Clarke",
                },
            },
        }, {getFirestore});

        const company = Collection.proxy("companies", {
            payload: {
                data: {
                    name: "Test Company",
                },
            },
        });

        await Promise.all([
            user.create({batch}),

            company.create({batch}),

            // company settings
            Collection.proxy("settings", {parent: company}).create({
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
                    path: `user/${user.getDoc().id}`,
                },
            }),

            // user email
            Collection.proxy("emails", {parent: user}).create({
                batch,
                data: {address: email, primary: true},
            }),

            // user role
            Collection.proxy("roles", {
                parent: user,
                owners: [company],
            }).create({
                batch,
                data: {id: "super"},
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
        ].concat(["Super", "Admin", "User"].map((role) => {
            // app roles
            return Collection.proxy("roles").create({
                batch,
                data: {
                    id: role.trim().toLowerCase(),
                    name: role,
                },
            });
        })));

        await batch.commit();
    });
});

it("add company", async () => {
    await signInWithEmailAndPassword(getAuth(), email, password);

    return getAdminContext(async (getFirestore) => {
        const batch = getFirestore.batch();

        const user = Collection.proxy("users", {getFirestore}).setDoc(getAuth().currentUser?.uid!);

        const company = Collection.proxy("companies", {
            payload: {
                data: {name: faker.company.name()},
            },
        });

        const role = await Collection.proxy("roles", {parent: user}).init("super");

        await Promise.all([
            company.create({batch}),

            Collection.proxy("settings", {parent: company}).create({
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
                    path: `user/${user.getDoc().id}`,
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
