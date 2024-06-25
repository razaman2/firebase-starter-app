import {faker} from "@faker-js/faker";
import {initializeApp} from "firebase/app";
import {getAuth, createUserWithEmailAndPassword, connectAuthEmulator} from "firebase/auth";
import {Collection} from "@razaman2/collection-proxy";
import {initializeTestApp, getDefaultContext, getAdminContext, app} from "@razaman2/collection-proxy-testing";

initializeApp({projectId: "n2n-app", apiKey: "1"});
connectAuthEmulator(getAuth(), "http://127.0.0.1:9099");

describe("login", () => {
    beforeEach(async () => {
        await initializeTestApp({projectId: "n2n-app"});

        await getDefaultContext((getFirestore) => {
            return Collection.proxy("roles", {getFirestore}).setDoc("super").setData({name: "Super"}).create();
        });
    });

    afterEach(async () => {
        await getAuth().signOut();

        await app.config.clearFirestore();
    });

    //     // it("should login and redirect to uri in auth settings", () => {
    //     //     const username = faker.internet.email({provider: "sablecrm.com"}).toLowerCase();
    //     //     const password = "password";
    //     //
    //     //     cy.wrap(createUserWithEmailAndPassword(getAuth(), username, password)).then(async (auth) => {
    //     //         await getAdminContext(async (getFirestore) => {
    //     //             const batch = getFirestore.batch();
    //     //
    //     //             const company = Collection.proxy("companies", {getFirestore}).setData({
    //     //                 name: faker.company.name(),
    //     //             });
    //     //
    //     //             const user = Collection.proxy("users").setDoc(auth.user.uid).setData({
    //     //                 firstName: faker.person.firstName(),
    //     //                 lastName: faker.person.lastName(),
    //     //             });
    //     //
    //     //             await Promise.all([
    //     //                 company.create({batch}),
    //     //
    //     //                 user.create({batch}),
    //     //
    //     //                 Collection.proxy("emails").setParent(user).setData({
    //     //                     address: username,
    //     //                 }).create({batch}),
    //     //
    //     //                 Collection.proxy("roles", {
    //     //                     owners: [company],
    //     //                 }).setParent(user).setDoc("super").create({batch}),
    //     //
    //     //                 Collection.proxy("settings").setParent(user).setDoc(company.getDoc()).setData({
    //     //                     status: "active",
    //     //                     path: `user/${user.getDoc().id}`,
    //     //                 }).create({batch}),
    //     //
    //     //                 Collection.proxy("settings").setParent(company).setDoc(company.getDoc()).setData({
    //     //                     status: "active",
    //     //                 }).create({batch}),
    //     //             ]);
    //     //
    //     //             await batch.commit();
    //     //         });
    //     //     });
    //     //
    //     //     cy.visit("/login")
    //     //     .get("input[type=\"email\"]").type(username)
    //     //     .get("input[type=\"password\"]").type(password)
    //     //     .get("button").click();
    //     // });

    it("should login and redirect to /", async () => {
        const username = faker.internet.email({provider: "sablecrm.com"}).toLowerCase();
        const password = "password";

        cy.wrap(createUserWithEmailAndPassword(getAuth(), username, password)).then(async (auth) => {
            await getAdminContext(async (getFirestore) => {
                const batch = getFirestore.batch();

                const company = Collection.proxy("companies", {getFirestore}).setData({
                    name: faker.company.name(),
                });

                const user = Collection.proxy("users").setDoc(auth.user.uid).setData({
                    firstName: faker.person.firstName(),
                    lastName: faker.person.lastName(),
                });

                await Promise.all([
                    company.create({batch}),

                    user.create({batch}),

                    Collection.proxy("emails").setParent(user).setData({
                        address: username,
                    }).create({batch}),

                    Collection.proxy("roles", {
                        owners: [company],
                    }).setParent(user).setDoc("super").create({batch}),

                    Collection.proxy("settings").setParent(user).setDoc(company.getDoc()).setData({
                        status: "active",
                    }).create({batch}),

                    Collection.proxy("settings").setParent(company).setDoc(company.getDoc()).setData({
                        status: "active",
                    }).create({batch}),
                ]);

                await batch.commit();
            });
        });

        cy.visit("/login")
        .get("input[type=\"email\"]").type(username)
        .get("input[type=\"password\"]").type(password)
        .get("button").click()
        .url().should("eq", "http://localhost:5173/test");
    });
});
