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

// Find all employeeId occurrences with path context
function walk(obj, path = []) {
  if (!obj || typeof obj !== 'object') return
  if (Array.isArray(obj)) {
    obj.forEach((v, idx) => walk(v, path.concat(String(idx))))
    return
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'employeeId' || (typeof v === 'string' && v.includes('employeeId'))) {
      console.log('HIT', path.concat(k).join('.'), typeof v === 'string' ? v.slice(0, 200) : JSON.stringify(v).slice(0, 200))
    }
    walk(v, path.concat(k))
  }
}
walk(doc)

// Application create full schema + security
const appPost = doc.paths['/api/v1/recruitment/applications']?.post
console.log('\nPOST applications security', JSON.stringify(appPost?.security))
console.log('POST applications tags', appPost?.tags)
console.log('POST applications responses', Object.keys(appPost?.responses || {}))

const jobsPost = doc.paths['/api/v1/recruitment/jobs']?.post
console.log('\nPOST jobs security', JSON.stringify(jobsPost?.security))
console.log('POST jobs description', jobsPost?.description)

// status enum from create job
const createJob = jobsPost?.requestBody?.content?.['application/json']?.schema
console.log('\ncreate job status', JSON.stringify(createJob?.properties?.status))

const patchJob = doc.paths['/api/v1/recruitment/jobs/{id}']?.patch
console.log('patch job status', JSON.stringify(patchJob?.requestBody?.content?.['application/json']?.schema?.properties?.status))

// search candidates
const search = doc.paths['/api/v1/recruitment/candidates/search']?.get
console.log('\ncandidates search params', JSON.stringify(search?.parameters?.map((p) => ({ name: p.name, desc: p.description }))))
