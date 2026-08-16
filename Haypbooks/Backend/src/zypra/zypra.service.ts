import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

@Injectable()
export class ZypraService {
  private readonly model: GenerativeModel | null
  private readonly apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY
    if (this.apiKey) {
      const client = new GoogleGenerativeAI(this.apiKey)
      // Available models (from cheapest to smartest):
      // gemini-2.0-flash (free tier, recommended)
      // gemini-1.5-flash (free tier, simpler tasks)
      // gemini-2.0-flash-lite (cheapest paid option)
      // gemini-2.5-flash (better reasoning, $0.15/$0.60 per 1M tokens)
      // gemini-2.5-pro (best quality, $1.25/$10.00 per 1M tokens)
      this.model = client.getGenerativeModel({ model: 'gemini-1.5-pro' }, { timeout: 25000 })
    } else {
      this.model = null
    }
  }

  private ensureConfigured() {
    if (!this.model) {
      throw new InternalServerErrorException(
        'Zypra AI is not configured. Set GEMINI_API_KEY in the environment.',
      )
    }
  }

  async chat(companyId: string, userId: string, message: string, context?: string) {
    this.ensureConfigured()

    const systemInstruction =
      'You are Zypra, an AI assistant for HaypBooks. Help the user with accounting, reporting, and company-specific guidance while staying concise and professional.'

    const contents = [] as Array<{
      role: string
      parts: Array<{ text: string }>
    }>

    contents.push({
      role: 'system',
      parts: [{ text: systemInstruction }],
    })

    if (context) {
      contents.push({
        role: 'system',
        parts: [{ text: context }],
      })
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    })

    const result = await this.model!.generateContent({
      contents,
      systemInstruction,
    })

    const reply = result.response?.candidates?.[0]?.content?.parts
      ?.filter((part) => 'text' in part && typeof part.text === 'string')
      .map((part) => (part as { text: string }).text)
      .join('')
      .trim()

    return {
      reply: reply || 'Zypra did not return a text response. Please try again with a shorter question.',
    }
  }
}
