/* eslint-disable no-unused-expressions */
const hostname = Cypress.env(`HOSTNAME`)
const discordUser = Cypress.env(`DISCORD_USER`)
const discordPass = Cypress.env(`DISCORD_PASS`)

describe(`Homepage`, () => {
  const links = [
    {
      text: `About`,
      href: `${hostname}/about`,
    },
    {
      text: `How To Play`,
      href: `${hostname}/howtoplay`,
    },
    {
      text: `Support Us`,
      href: `${hostname}/supportus`,
    },
  ]

  links.forEach((link) => {
    it(`"${link.text}" link correctly navigates to ${link.href}`, () => {
      cy.visit(hostname)

      cy.get(`a`).filter(`:contains(${link.text})`).click()
      cy.url().should(`eq`, link.href)
    })
  })
})
describe(`Discord Login`, () => {
  it.only(`Log In takes user to Discord login page`, () => {
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

  it.only(`should authorize with Discord and redirect to /s`, () => {
    cy.get(`body`).then((body) => {
      if (
        body.find(`button`).filter(`:contains(Authorize)`)
      ) {
        cy.get(`button`)
          .filter(`:contains(Authorize)`)
          .click()
      } else if (
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
      }

      cy.url().should(`eq`, `${hostname}/s`)
    })
  })
})
