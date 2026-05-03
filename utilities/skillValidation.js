export const SKILL_MAX_LENGTH = 50

export function validateSkill(skill, existingSkillNames = []) {
  const trimmed = skill.trim()
  if (!trimmed) return { valid: false, error: "Skill cannot be empty" }
  if (trimmed.length > SKILL_MAX_LENGTH) {
    return { valid: false, error: `Skill must be ${SKILL_MAX_LENGTH} characters or less` }
  }
  if (existingSkillNames.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
    return { valid: false, error: "Skill already added" }
  }
  return { valid: true, error: null, value: trimmed }
}
