/* eslint-disable no-unused-expressions */
const hostname = Cypress.env(`HOSTNAME`)
const discordUser = Cypress.env(`DISCORD_USER`)
const discordPass = Cypress.env(`DISCORD_PASS`)

describe(`Homepage`, () => {
  const links = [
    {
      text: `About`,
      href: `about`,
    },
    {
      text: `How To Play`,
      href: `howtoplay`,
    },
    {
      text: `Feedback`,
      href: `feedback`,
    },
    {
      text: `Bug Report`,
      href: `feedback/bugreport`,
    },
    {
      text: `Share a Story`,
      href: `feedback/storytime`,
    },
  ]

  links.forEach((link) => {
    it(`"${link.text}" link correctly navigates to ${hostname}/${link.href}`, () => {
      cy.visit(hostname)

      cy.get(`a`).filter(`:contains(${link.text})`).click()
      cy.url().should(`eq`, `${hostname}/${link.href}`)
    })
  })
})
describe(`Discord Login`, () => {
  it(`Log In takes user to Discord login page`, () => {
    cy.visit(hostname)

    cy.get(`a`).filter(`:contains(Log In)`).click()

    cy.url().should(
      `contain`,
      `https://discord.com/oauth2/authorize`,
    )
  })

  const urlParams = [
    {
      name: `client_id`,
      value: `${Cypress.env(`DISCORD_CLIENT_ID`)}`,
    },
  ]

  urlParams.forEach((param) => {
    it(`URL contains ${param.name}`, () => {
      cy.url().should(
        `contain`,
        `${param.name}=${param.value}`,
      )
    })
  })

  it(`should authorize with Discord and redirect to /s`, () => {
    cy.get(`body`).then((body) => {
      if (
        body.find(`a[class^="logoutLink"]`).length === 0
      ) {
        expect(discordUser, `discordUser was set`).to.be.a(
          `string`,
        ).and.not.be.empty
        expect(discordPass, `discordPass was set`).to.be.a(
          `string`,
        ).and.not.be.empty

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

describe.only(`Game Page`, () => {
  describe.only(`Nav Bar`, () => {
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

    describe.only(`should have useful buttons at the bottom of the Nav Bar`, () => {
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
})
