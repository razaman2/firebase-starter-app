import "@src/firebase-init-auth";
import {it, beforeEach} from "vitest";
import {Collection} from "@razaman2/collection-proxy";
import {initializeTestApp, getAdminContext} from "@razaman2/collection-proxy-testing";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential} from "firebase/auth";
import {faker} from "@faker-js/faker";

beforeEach(async () => {
    await initializeTestApp({projectId: "n2n-app"});
});

const email = "user@firestore.com".trim().toLowerCase();
const password = "password";

it("initialize app data", () => {
    return getAdminContext(async (getFirestore) => {
        const auth: UserCredential = await new Promise(async (resolve) => {
            try {
                resolve(await createUserWithEmailAndPassword(getAuth(), email, password));
            } catch {
                resolve(await signInWithEmailAndPassword(getAuth(), email, password));
            }
        });

        const batch = getFirestore.batch();

        const company = Collection.setConfig({getFirestore}).setCollectionName("companies").setData({
            name: "Test Company",
        });

        const user = Collection.setCollectionName("users").setData({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        }).setDoc(auth.user.uid);

        await Promise.all([
            user.create({batch}),

            company.create({batch}),

            // company settings
            Collection.setCollectionName("settings").setData({
                status: "active",
            }).setParent(company).setDoc(company.getDoc()).create({batch}),

            // user settings within company
            Collection.setCollectionName("settings").setData({
                status: "active",
                path: `/user/${user.getDoc().id}`,
            }).setParent(user).setOwners(company).setDoc(company.getDoc()).create({batch}),

            // user email
            Collection.setCollectionName("emails").setData({
                address: email,
                primary: true,
            }).setParent(user).create({batch}),

            // app settings
            Collection.setCollectionName("settings").setData({
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
            }).create({batch}),

            // user role
            Collection.setCollectionName("roles").setParent(user).setOwners(company).setDoc("super").create({batch}),

            Collection.setCollectionName("roles").setData({
                name: "Super",
            }).setDoc("super").create({batch}),

            Collection.setCollectionName("roles").setData({
                name: "Admin",
            }).setDoc("admin").create({batch}),

            Collection.setCollectionName("roles").setData({
                name: "User",
            }).setDoc("user").create({batch}),
        ]);

        await batch.commit();
    });
});

it("add company", async () => {
    await signInWithEmailAndPassword(getAuth(), email, password);

    return getAdminContext(async (getFirestore) => {
        const batch = getFirestore.batch();

        const user = Collection.setConfig({getFirestore}).setCollectionName("users").setDoc(getAuth().currentUser.uid);

        const company = Collection.setCollectionName("companies").setData({name: faker.company.name()});

        const role = await Collection.setCollectionName("roles").setParent(user).init("super");

        await Promise.all([
            company.create({batch}),

            Collection.setCollectionName("settings").setData({
                status: "active",
            }).setParent(company).setDoc(company.getDoc()).create({batch}),

            Collection.setCollectionName("settings").setData({
                status: "active",
                path: `/user/${user.getDoc().id}`,
            }).setParent(user).setOwners(company).setDoc(company.getDoc()).create({batch}),

            role[role.getData("id") ? "update" : "create"]({
                batch,
                data: {
                    belongsTo: [company.getDoc().path].concat(role.getData("belongsTo")),
                },
            }),
        ]);

        await batch.commit();
    });
});
