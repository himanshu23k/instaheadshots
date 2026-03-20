const BLOCKED_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /\b(look\s+like|resemble|similar\s+to|same\s+as)\b/i,
    message: 'Requests to resemble another person are not supported.',
  },
  {
    pattern: /\b(celebrity|famous|actor|actress|model|singer|politician)\b/i,
    message: 'Celebrity references are not supported.',
  },
  {
    pattern: /\b(change\s+race|change\s+ethnicity|look\s+more\s+(white|black|asian|indian|african|european|latin))\b/i,
    message: 'Ethnic or racial identity changes are not supported.',
  },
  {
    pattern: /\b(look\s+\d+\s+years?\s+(younger|older)|age\s+(me|to)\s+\d+)\b/i,
    message: 'Significant age alterations are not supported.',
  },
  {
    pattern: /\b(thinner\s+nose|bigger\s+lips|smaller\s+lips|wider\s+eyes|narrower\s+jaw|change\s+nose|reshape\s+face)\b/i,
    message: 'Specific facial structure changes are not supported.',
  },
  {
    pattern: /\b(change\s+gender|look\s+more\s+(masculine|feminine)|gender\s+swap)\b/i,
    message: 'Gender presentation changes are not supported.',
  },
]

export interface ModerationResult {
  allowed: boolean
  message?: string
}

export function checkModeration(text: string): ModerationResult {
  for (const { pattern, message } of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return { allowed: false, message }
    }
  }
  return { allowed: true }
}
