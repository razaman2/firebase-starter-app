import CustomButton from "@components/CustomButton.vue";

describe("<CustomButton />", () => {
    it("should set button text from default slot", () => {
        cy.mount(
            <CustomButton>Click Me</CustomButton>,
        );

        cy.get("button").should("have.text", "Click Me");
        cy.get("button").invoke("prop", "innerHTML").then((html) => {
            cy.log(html)
        })
    });

    it("should set button text from label prop", () => {
        cy.mount(
            <CustomButton label="Click Me"/>,
        );

        cy.get("button").should("have.text", "Click Me");

        cy.mount(
            <CustomButton label={123}/>,
        );

        cy.get("button").should("have.text", 123);
    });

    it("should change from button to other elements", () => {
        cy.mount(
            <CustomButton tag="a" label="google" href="#"/>,
        );

        cy.get("a").should("have.text", "google").should("have.attr", "href", "#");
    });
});
