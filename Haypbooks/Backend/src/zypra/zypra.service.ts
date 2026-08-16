import { Injectable } from '@nestjs/common'
import { GoogleGenerativeAI } from '@google/generative-ai'

@Injectable()
export class ZypraService {
  private createModel() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return null

    const client = new GoogleGenerativeAI(apiKey)
    // Available models (from cheapest to smartest):
    // gemini-2.0-flash (free tier, recommended)
    // gemini-1.5-flash (free tier, simpler tasks)
    // gemini-2.0-flash-lite (cheapest paid option)
    // gemini-2.5-flash (better reasoning, $0.15/$0.60 per 1M tokens)
    // gemini-2.5-pro (best quality, $1.25/$10.00 per 1M tokens)
    return client.getGenerativeModel({ model: 'gemini-1.5-pro' }, { timeout: 25000 })
  }

  getQuickActions() {
    const quickActions = [
      {
        label: 'Summarize cash flow',
        prompt: 'Please summarize our current cash flow position and call out any risks or opportunities.',
      },
      {
        label: 'Explain balance sheet',
        prompt: 'Explain the key balance sheet items and what they mean for company financial health.',
      },
      {
        label: 'Review recent reports',
        prompt: 'What should I know from the latest financial reports and trends?',
      },
    ]

    if (!process.env.GEMINI_API_KEY) {
      return quickActions
    }

    return quickActions
  }

  async chat(companyId: string, userId: string, message: string, context?: string) {
    if (!process.env.GEMINI_API_KEY) {
      return {
        reply: 'Zypra is not configured yet. Please set the GEMINI_API_KEY environment variable.',
      }
    }

    const model = this.createModel()
    if (!model) {
      return {
        reply: 'Zypra is not configured yet. Please set the GEMINI_API_KEY environment variable.',
      }
    }

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

    const result = await model.generateContent({
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
