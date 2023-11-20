import "../src/firebase-auth-init";
import {it, beforeEach} from "vitest";
import {Collection} from "@razaman2/firestore-proxy";
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
                    firstName: faker.person.firstName(),
                    lastName: faker.person.lastName(),
                },
            },
        }, {getFirestore});

        await Promise.all([
            user.create({batch}),

            // user settings
            Collection.proxy("settings").setParent(user).create({
                batch,
                data: {
                    id: user.getDoc().id,
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
            Collection.proxy("roles").setParent(user).create({
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
