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
      cy.visit(`https://www.starfish.cool`)

      cy.get(`a`).filter(`:contains(${link.text})`).click()
      cy.url().should(`eq`, `${hostname}/${link.href}`)
    })
  })
})
describe(`Discord Login`, () => {
  it(`Log In takes user to Discord login page`, () => {
    cy.clearLocalStorage()
    cy.visit(`https://www.starfish.cool`)

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
      cy.url().should(`contain`, param.value)
    })
  })
  it(`should authorize with Discord`, () => {
    expect(discordUser, `discordUser was set`).to.be.a(
      `string`,
    ).and.not.be.empty
    expect(discordPass, `discordPass was set`).to.be.a(
      `string`,
    ).and.not.be.empty

    cy.get(`[name=email]`).type(discordUser)
    cy.get(`[name=password]`).type(discordPass)
    cy.get(`[type=Submit]`).click()
  })
})
