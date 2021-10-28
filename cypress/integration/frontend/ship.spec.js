/* eslint-disable no-unused-expressions */
const hostname = Cypress.env(`HOSTNAME`)
const discordUser = Cypress.env(`DISCORD_USER`)
const discordPass = Cypress.env(`DISCORD_PASS`)

describe(`Discord Login`, () => {
  it(`Log In takes user to Discord login page`, () => {
    cy.visit(hostname)

    cy.get(`a`).filter(`:contains(Log In)`).click()
    cy.get(`body`).then((body) => {
      if (
        body.find(`a[class^="logoutLink"]`).length === 0
      ) {
        cy.get(`[name=email]`).type(discordUser)
        cy.get(`[name=password]`).type(discordPass)

        cy.get(`[type=Submit]`).click() // Login
        cy.get(`button`)
          .filter(`:contains(Authorize)`)
          .click()
      } else {
        cy.get(`button`)
          .filter(`:contains(Authorize)`)
          .click()
      }

      cy.url().should(`eq`, `${hostname}/s`)
    })
  })
})

describe(`Ship Page`, () => {
  describe(`Nav Bar`, () => {
    it(`should be visible`, () => {
      cy.visit(`${hostname}/s`)
      cy.get(`nav[class="leftbar"]`).should(`be.visible`)
    })

    it(`should have a Home link as the logo icon`, () => {
      cy.visit(`${hostname}/s`)
      cy.get(`nav[class="leftbar"]`)
        .get(`img[class="logo"]`)
        .parent()
        .should(`have.attr`, `href`, `/`)

      cy.get(`nav[class="leftbar"]`)
        .get(`img[class="logo"]`)
        .should(`have.attr`, `src`, `/images/logo.svg`)
    })

    it(`should have a divider between the logo and the server ship list`, () => {
      cy.visit(`${hostname}/s`)
      cy.get(`nav[class="leftbar"]`)
        .get(`hr`)
        .should(`be.visible`)
    })

    it(`should have a list of server ships`, () => {
      cy.visit(`${hostname}/s`)
      cy.get(`nav[class="leftbar"]`)
        .get(`div[class="guildicon"]`)
        .should(`be.visible`)
    })

    const buttons = [
      {
        text: `About`,
        alt: `link to about page`,
        href: `/about`,
      },
      {
        text: `How to Play`,
        alt: `link to how to play page`,
        href: `/howtoplay`,
      },
      {
        text: `Feedback`,
        alt: `link to feedback page`,
        href: `/feedback`,
      },
      {
        text: `Tutorial`,
        alt: `tutorial button`,
      },
      {
        text: `Log Out`,
        alt: `log out button`,
      },
    ]

    describe(`should have useful buttons at the bottom of the Nav Bar`, () => {
      buttons.forEach((button) => {
        it(`${button.text}`, () => {
          cy.visit(`${hostname}/s`)

          cy.get(`nav[class="leftbar"]`)
            .get(
              `div[class="flexcolumn flexcenter bottombuttons"`,
            )
            .get(`img[alt="${button.alt}"]`)
            .should(`be.visible`)

          if (button.href) {
            cy.get(`nav[class="leftbar"]`)
              .get(
                `div[class="flexcolumn flexcenter bottombuttons"]`,
              )
              .get(`img[alt="${button.alt}"]`)
              .parent()
              .should(`have.attr`, `href`, `${button.href}`)
          }
          if (button.text === `Log Out`) {
            cy.get(`nav[class="leftbar"]`)
              .get(
                `div[class="flexcolumn flexcenter bottombuttons"]`,
              )
              .get(`img[alt="${button.alt}"]`)
              .parent()
              .prev()
              .find(`hr`)
              .should(`be.visible`)
          }
        })
      })
    })

    it(`should log out`, () => {
      cy.visit(`${hostname}/s`)

      cy.get(`img[alt="log out button"]`).click()
      cy.url().should(`eq`, `${hostname}/`, {
        timeout: 10000,
      })
    })
  })
  describe(`Images`, () => {
    it(`should include a background image`, () => {
      cy.visit(`${hostname}/s`)
      cy.get(`body`).should(`have.css`, `background-image`)
    })

    it(`should have a logo`, () => {
      cy.visit(`${hostname}/s`)
      cy.get(`img[alt="logo"]`).should(`be.visible`)
    })

    it(`should all be in WebP format`, () => {
      cy.visit(`${hostname}/s`)
      cy.get(`img`)
        .should(`have.attr`, `src`)
        .and(`match`, /\.webp$/, `or`, /\.svg$/)
    })
  })
})
