import c from '../../../common/dist'
const { Configuration, OpenAIApi } = require(`openai`)
const configuration = new Configuration({
  apiKey: process.env.OPENAI_TOKEN,
})
const openai = new OpenAIApi(configuration)

export default async function getGptResponse(
  context: string[] = [],
  prompt: string = `They say: `,
): Promise<string | undefined> {
  const response = await openai
    .createCompletion(`text-davinci-001`, {
      prompt: context.join(`. `).replace(/\.\./g, `.`) + `. ` + prompt,
      temperature: 1.5,
      // eslint-disable-next-line
      max_tokens: Math.ceil(Math.random() * 200) + 10,
      // eslint-disable-next-line
      frequency_penalty: 1,
    })
    .catch((e) => {
      c.error(e.response.data)
    })
  const res: string | undefined = response?.data?.choices?.[0]?.text
  if (!res) return undefined
  return res.replace(/[\n"]/g, ``).trim()
}
