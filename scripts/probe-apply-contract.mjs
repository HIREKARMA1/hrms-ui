import fs from 'fs'

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
const blob = JSON.stringify(doc)

for (const term of [
  'employeeId',
  'candidateId',
  'internal',
  'CAREER_PAGE',
  'referrer',
  'self-apply',
  'my applications',
  'ApplicationSource',
]) {
  console.log(term, blob.toLowerCase().includes(term.toLowerCase()))
}

const candidatePost =
  doc.paths['/api/v1/recruitment/candidates']?.post?.requestBody?.content?.[
    'application/json'
  ]?.schema
console.log(
  'candidate create',
  JSON.stringify(
    { required: candidatePost?.required, properties: Object.keys(candidatePost?.properties || {}) },
    null,
    2,
  ),
)

const appsGet = doc.paths['/api/v1/recruitment/applications']?.get
console.log('list apps params', JSON.stringify(appsGet?.parameters?.map((p) => p.name)))
console.log('list apps desc', appsGet?.description)

const jobsGet = doc.paths['/api/v1/recruitment/jobs']?.get
console.log('list jobs params', JSON.stringify(jobsGet?.parameters?.map((p) => p.name)))
console.log('list jobs desc', jobsGet?.description)

const jobStatus = doc.components?.schemas?.JobStatus || doc.components?.schemas?.UpdateJobStatusDto
console.log(
  'JobStatus schemas',
  Object.keys(doc.components?.schemas || {}).filter((k) => /job|status|application|source/i.test(k)),
)

for (const [name, schema] of Object.entries(doc.components?.schemas || {})) {
  if (/JobStatus|ApplicationSource|CreateJob|UpdateJob|CreateApplication/i.test(name)) {
    console.log(name, JSON.stringify(schema, null, 2).slice(0, 800))
  }
}

// Find referrer context
const idx = blob.toLowerCase().indexOf('referrer')
console.log('referrer snippet', blob.slice(Math.max(0, idx - 80), idx + 120))
