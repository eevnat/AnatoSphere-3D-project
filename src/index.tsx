import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { systems, structures, journeys } from './data/anatomy'
import { page } from './page'

type Bindings = { OPENAI_API_KEY?: string; OPENAI_BASE_URL?: string; OPENAI_MODEL?: string }
const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// ── Knowledge base API ──
app.get('/api/anatomy', (c) => c.json({ systems, structures, journeys }))
app.get('/api/systems', (c) => c.json(systems))
app.get('/api/structures', (c) => {
  const sys = c.req.query('system')
  return c.json(sys ? structures.filter((s) => s.system === sys) : structures)
})
app.get('/api/structures/:id', (c) => {
  const s = structures.find((x) => x.id === c.req.param('id'))
  return s ? c.json(s) : c.json({ error: 'Not found' }, 404)
})
app.get('/api/journeys', (c) => c.json(journeys))

function search(q: string) {
  const t = q.toLowerCase().trim()
  if (!t) return []
  return structures
    .map((s) => {
      const names = [s.name, s.id.replace(/_/g, ' '), ...(s.aka || [])].map((n) => n.toLowerCase())
      let score = 0
      for (const n of names) {
        if (n === t) score = Math.max(score, 100)
        else if (n.startsWith(t)) score = Math.max(score, 70)
        else if (n.includes(t)) score = Math.max(score, 50)
      }
      if (!score && (s.b.does + s.b.what).toLowerCase().includes(t)) score = 10
      return { s, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => ({ id: x.s.id, name: x.s.name, system: x.s.system, score: x.score }))
}
app.get('/api/search', (c) => c.json(search(c.req.query('q') || '')))

// ── Quiz generator ──
app.get('/api/quiz', (c) => {
  const sys = c.req.query('system')
  const n = Math.min(parseInt(c.req.query('n') || '8'), 20)
  const pool = structures.filter((s) => !sys || sys === 'all' || s.system === sys)
  const all = structures
  const shuffle = <T,>(a: T[]) => a.map((v) => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map((x) => x[1])
  const qs = shuffle(pool).slice(0, n).map((s, i) => {
    const sameSys = shuffle(all.filter((x) => x.id !== s.id && x.system === s.system))
    const others = shuffle(all.filter((x) => x.id !== s.id && x.system !== s.system))
    const distract = [...sameSys, ...others].slice(0, 3)
    const type = ['identify', 'function', 'clue'][i % 3]
    const options = shuffle([s, ...distract]).map((o) => ({ id: o.id, name: o.name }))
    let prompt = ''
    if (type === 'identify') prompt = 'Which structure is highlighted on the model?'
    else if (type === 'function') prompt = `Which structure does this? "${s.b.does}"`
    else prompt = `Which structure matches: "${s.clue || s.b.what}"`
    return { type, target: s.id, prompt, options, explain: `${s.name}: ${s.b.what} ${s.b.does}` }
  })
  return c.json(qs)
})

// ── AI Anatomy Assistant ──
app.post('/api/ask', async (c) => {
  const { question, context, level, history } = await c.req.json<{ question: string; context?: string; level?: string; history?: { role: string; content: string }[] }>()
  if (!question || question.length > 1000) return c.json({ error: 'Invalid question' }, 400)
  const ctx = context ? structures.find((s) => s.id === context) : undefined
  const hits = search(question).slice(0, 3).map((h) => structures.find((s) => s.id === h.id)!)
  const refs = [...new Set([ctx, ...hits].filter(Boolean))] as typeof structures

  const key = c.env.OPENAI_API_KEY
  if (!key) {
    // Offline fallback: answer from the knowledge base
    const s = refs[0]
    if (!s) return c.json({ answer: "I'm in offline mode (no AI key configured). Try asking about a specific structure, such as \"What does the liver do?\"", offline: true })
    const L = level === 'advanced' ? s.a : s.b
    return c.json({ answer: `**${s.name}**\n\n${L.what}\n\n**Where:** ${L.where}\n\n**Function:** ${L.does}${s.facts?.length ? `\n\n💡 ${s.facts[0]}` : ''}`, offline: true, refs: refs.map((r) => r.id) })
  }

  const kb = refs.map((s) => `- ${s.name} (${s.system}): ${s.a.what} Location: ${s.a.where} Function: ${s.a.does}`).join('\n')
  const sys = `You are "Ana", the friendly anatomy tutor inside AnatoSphere 3D, an educational app for learners WITHOUT a medical background.
Mode: ${level === 'advanced' ? 'ADVANCED – use correct anatomical terminology but stay clear.' : 'BEGINNER – use very simple words, everyday analogies, no jargon (or explain any term you use).'}
${ctx ? `The student currently has "${ctx.name}" selected on the 3D model.` : ''}
Reference notes:\n${kb || '(none)'}
Rules: Be accurate and concise (≤180 words unless asked for more). Use short paragraphs or bullet points and **bold** key terms. This is for education only – if someone asks for personal medical advice or diagnosis, gently suggest they see a doctor.`

  try {
    const r = await fetch(`${c.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: c.env.OPENAI_MODEL || 'gpt-5-mini',
        messages: [{ role: 'system', content: sys }, ...(history || []).slice(-6), { role: 'user', content: question }],
      }),
    })
    if (!r.ok) throw new Error(`LLM ${r.status}: ${(await r.text()).slice(0, 200)}`)
    const j: any = await r.json()
    return c.json({ answer: j.choices?.[0]?.message?.content || 'No answer.', refs: refs.map((r) => r.id) })
  } catch (e: any) {
    return c.json({ answer: 'Sorry, the AI tutor is unavailable right now. ' + (e.message || ''), error: true }, 200)
  }
})

app.get('/', (c) => c.html(page))

export default app
