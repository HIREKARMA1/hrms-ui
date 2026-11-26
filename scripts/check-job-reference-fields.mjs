import fs from 'node:fs'

const src = fs.readFileSync('D:/hrms/hrms-ui/.tmp-swagger-init.js', 'utf8')
const marker = '"swaggerDoc":'
const start = src.indexOf(marker)
let i = start + marker.length
while (src[i] && /\s/.test(src[i])) i++
let depth = 0
let end = -1
let inString = false
let escape = false
for (let p = i; p < src.length; p++) {
  const ch = src[p]
  if (inString) {
    if (escape) escape = false
    else if (ch === '\\') escape = true
    else if (ch === '"') inString = false
    continue
  }
  if (ch === '"') {
    inString = true
    continue
  }
  if (ch === '{') depth++
  else if (ch === '}') {
    depth--
    if (depth === 0) {
      end = p + 1
      break
    }
  }
}
const doc = JSON.parse(src.slice(i, end))

const jobPost = doc.paths['/api/v1/recruitment/jobs']?.post
const jobPatch = doc.paths['/api/v1/recruitment/jobs/{id}']?.patch
const appPost = doc.paths['/api/v1/recruitment/applications']?.post

function props(op) {
  const schema =
    op?.requestBody?.content?.['application/json']?.schema
  return {
    required: schema?.required ?? [],
    properties: Object.keys(schema?.properties ?? {}),
    hasReferenceName: Boolean(schema?.properties?.referenceName),
    hasReferenceEmail: Boolean(schema?.properties?.referenceEmail),
    referenceLike: Object.keys(schema?.properties ?? {}).filter((k) =>
      /refer|contact|internal/i.test(k),
    ),
  }
}

console.log('POST /jobs', JSON.stringify(props(jobPost), null, 2))
console.log('PATCH /jobs/:id', JSON.stringify(props(jobPatch), null, 2))
console.log('POST /applications', JSON.stringify(props(appPost), null, 2))
console.log(
  'POST /applications description:',
  appPost?.description?.slice(0, 800),
)

// Search whole openapi for referenceName/referenceEmail
const blob = JSON.stringify(doc)
console.log('has referenceName anywhere:', blob.includes('referenceName'))
console.log('has referenceEmail anywhere:', blob.includes('referenceEmail'))
console.log('has referrer anywhere:', /referr/i.test(blob))
