/**
 * Loads the skill manifest and skill markdown files.
 *
 * skills/manifest.json declares:
 *   - types: the writing types the classifier can route to
 *   - skills: each with a markdown file and an `appliesTo` of "all" or a list of type ids
 *
 * To plug in your own skills, edit the markdown files (or add new ones and
 * register them in the manifest). No code changes needed.
 */
const Skills = (() => {
  let manifest = null;
  const fileCache = {};

  async function loadManifest() {
    if (manifest) return manifest;
    const res = await fetch('skills/manifest.json');
    if (!res.ok) throw new Error(`Could not load skills/manifest.json (HTTP ${res.status}). Are you serving the app over HTTP rather than opening the file directly?`);
    manifest = await res.json();
    return manifest;
  }

  async function loadSkillFile(path) {
    if (fileCache[path]) return fileCache[path];
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Could not load skill file ${path} (HTTP ${res.status})`);
    const text = await res.text();
    fileCache[path] = text;
    return text;
  }

  /** Returns [{id, label, content}] for all skills applicable to a writing type. */
  async function skillsForType(typeId) {
    const m = await loadManifest();
    const applicable = m.skills.filter(s =>
      s.appliesTo === 'all' || (Array.isArray(s.appliesTo) && s.appliesTo.includes(typeId))
    );
    return Promise.all(applicable.map(async s => ({
      id: s.id,
      label: s.label,
      deepEditPass: s.deepEditPass || null,
      content: await loadSkillFile(s.file),
    })));
  }

  async function getTypes() {
    const m = await loadManifest();
    return m.types;
  }

  return { loadManifest, skillsForType, getTypes };
})();
