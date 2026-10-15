// A placard is part of the character's creation record, not a live appearance setting.
// Existing archives are snapshotted once on first load; later changes to the head,
// visual settings, save slots or collection metadata must not rewrite its placard.
const text = (value, fallback = '', limit = 12000) =>
  String(typeof value === 'string' ? value : fallback).trim().slice(0, limit);

export function createPlacardDossier(col, draft = {}) {
  const ageHint = (col.fateRecord?.vitalityStatus || col.subtitle || '').match(/\d+\s*岁/)?.[0] || '19岁';
  const initial = {
    displayName: col.customDisplayName || col.name || '未命名标本',
    age: col.customAge || col.fateRecord?.ageAtCollection || ageHint,
    origin: col.dossier?.origin || col.subtitle || '私密典藏标本',
    story: col.customBriefStory || col.customContrastText || col.fateRecord?.causeOfDeath
      || col.fateRecord?.cause || col.fateRecord?.vitalityStatus || col.subtitle
      || '静默案头藏品 · 任由主人端详摆布',
    photoUrl: col.customLifePhotoUrl || '',
    sourceId: col.id || '',
    basePreset: col.basePreset || '',
    lifePhotoUrl: col.lifePhotoUrl || '',
  };
  const value = { ...initial, ...draft };
  return {
    version: 1, locked: true,
    displayName: text(value.displayName, initial.displayName, 160),
    age: text(value.age, initial.age, 80),
    origin: text(value.origin, initial.origin, 1800),
    story: text(value.story, initial.story),
    photoUrl: text(value.photoUrl, '', 750_000),
    sourceId: text(value.sourceId, initial.sourceId, 160),
    basePreset: text(value.basePreset, initial.basePreset, 120),
    lifePhotoUrl: text(value.lifePhotoUrl, initial.lifePhotoUrl, 750_000),
  };
}

export function getPlacardDossier(col) {
  if (!col) return null;
  return col.placardDossier?.locked === true
    ? col.placardDossier : createPlacardDossier(col);
}

// Called only when creating/importing an archive, never from an editor on a saved slot.
export function lockPlacardDossier(col, draft = {}) {
  if (!col) return null;
  if (col.placardDossier?.locked === true) return col.placardDossier;
  col.placardDossier = createPlacardDossier(col, draft);
  return col.placardDossier;
}

export function getPlacardPhotoSrc(col, resolver) {
  const snap = getPlacardDossier(col);
  if (!snap) return '';
  if (snap.photoUrl) return snap.photoUrl;
  return resolver({
    ...col,
    id: snap.sourceId || col.id,
    basePreset: snap.basePreset || col.basePreset,
    lifePhotoUrl: snap.lifePhotoUrl || col.lifePhotoUrl,
  });
}
