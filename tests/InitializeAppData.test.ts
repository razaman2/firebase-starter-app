import "@src/firebase-init-auth";
import { it, beforeEach } from "vitest";
import { Collection } from "@razaman2/firestore-proxy";
import { initializeTestApp, getAdminContext } from "@razaman2/firestore-testing";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { faker } from "@faker-js/faker";

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

        const user = Collection.proxy("users", { getFirestore }).setData({
            id: auth.user.uid,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        });

        await Promise.all([
            user.create({ batch }),

            // user email
            Collection.proxy("emails").setParent(user).create({
                batch,
                data: { address: email, primary: true },
            }),

            // user settings
            Collection.proxy("settings").setParent(user).create({
                batch,
                data: {
                    id: user.getDoc().id,
                    status: "active",
                    path: `user/${user.getDoc().id}`,
                },
            }),

            // app settings
            Collection.proxy("settings").create({
                batch,
                data: {
                    id: 1,
                    user: {
                        statuses: [
                            { id: "active", name: "Active" },
                            { id: "inactive", name: "Inactive" },
                            { id: "trial", name: "Trial" },
                        ],
                    },
                    company: {
                        statuses: [
                            { id: "active", name: "Active" },
                            { id: "inactive", name: "Inactive" },
                            { id: "trial", name: "Trial" },
                        ],
                    },
                },
            }),

            Collection.proxy("roles").setParent(user).setDoc("super").create({ batch }),

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

it("add user", () => {
    return getAdminContext(async (getFirestore) => {
        const promises = [3].reduce((promises, count) => {
            while (count--) {
                promises.push(new Promise(async (resolve) => {
                    const batch = getFirestore.batch();
                    const email = faker.internet.email({ provider: "firestore.com" }).trim().toLowerCase();
                    const auth = await createUserWithEmailAndPassword(getAuth(), email, password);

                    const user = Collection.proxy("users", { getFirestore }).setData({
                        id: auth.user.uid,
                        firstName: faker.person.firstName(),
                        lastName: faker.person.lastName(),
                    });

                    await Promise.all([
                        user.create({ batch }),

                        Collection.proxy("roles").setParent(user).setDoc("user").create({ batch }),

                        Collection.proxy("emails").setParent(user).create({
                            batch,
                            data: { address: email },
                        }),

                        Collection.proxy("settings").setParent(user).create({
                            batch,
                            data: {
                                id: user.getDoc().id,
                                status: "active",
                                path: `user/${user.getDoc().id}`,
                            },
                        }),
                    ]);

                    resolve(await batch.commit());
                }));
            }

            return promises;
        }, []);

        await Promise.all(promises);
    });
});
