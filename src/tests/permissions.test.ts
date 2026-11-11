import { describe, it, expect, beforeEach } from 'vitest';
import { documentStore, SEEDED_USERS } from '../lib/db/store';

describe('Document Store & Permissions', () => {
  const alex = SEEDED_USERS[0]; // usr_alex
  const sarah = SEEDED_USERS[1]; // usr_sarah
  const marcus = SEEDED_USERS[2]; // usr_marcus

  it('correctly identifies document owner', () => {
    const doc = documentStore.createDocument({
      title: 'Permissions Test Doc',
      content: '<p>Test content</p>',
      ownerId: alex.id,
    });

    expect(documentStore.checkPermission(doc, alex.id)).toBe('owner');
    expect(documentStore.checkPermission(doc, sarah.id)).toBe('none');
    expect(documentStore.checkPermission(doc, marcus.id)).toBe('none');
  });

  it('allows owner to share document with editor and viewer roles', () => {
    const doc = documentStore.createDocument({
      title: 'Shared Collab Doc',
      content: '<p>Shared body</p>',
      ownerId: alex.id,
    });

    // Share with Sarah as editor
    const res1 = documentStore.shareDocument(doc.id, {
      userId: alex.id,
      targetEmail: sarah.email,
      role: 'editor',
    });
    expect(res1.doc).toBeDefined();
    expect(documentStore.checkPermission(res1.doc!, sarah.id)).toBe('editor');

    // Share with Marcus as viewer
    const res2 = documentStore.shareDocument(doc.id, {
      userId: alex.id,
      targetEmail: marcus.email,
      role: 'viewer',
    });
    expect(res2.doc).toBeDefined();
    expect(documentStore.checkPermission(res2.doc!, marcus.id)).toBe('viewer');
  });

  it('allows editor to edit but blocks viewer from editing', () => {
    const doc = documentStore.createDocument({
      title: 'Editable Test',
      content: '<p>Initial</p>',
      ownerId: alex.id,
    });

    documentStore.shareDocument(doc.id, {
      userId: alex.id,
      targetEmail: sarah.email,
      role: 'editor',
    });

    documentStore.shareDocument(doc.id, {
      userId: alex.id,
      targetEmail: marcus.email,
      role: 'viewer',
    });

    // Sarah (editor) edits
    const editRes1 = documentStore.updateDocument(doc.id, {
      content: '<p>Sarah edited this</p>',
      userId: sarah.id,
    });
    expect(editRes1.doc?.content).toBe('<p>Sarah edited this</p>');

    // Marcus (viewer) attempts to edit -> must fail
    const editRes2 = documentStore.updateDocument(doc.id, {
      content: '<p>Marcus malicious edit</p>',
      userId: marcus.id,
    });
    expect(editRes2.error).toContain('Unauthorized');
  });

  it('prevents non-owners from deleting a document', () => {
    const doc = documentStore.createDocument({
      title: 'Protected Doc',
      content: '<p>Can only be deleted by owner</p>',
      ownerId: alex.id,
    });

    documentStore.shareDocument(doc.id, {
      userId: alex.id,
      targetEmail: sarah.email,
      role: 'editor',
    });

    const failDelete = documentStore.deleteDocument(doc.id, sarah.id);
    expect(failDelete.success).toBe(false);
    expect(failDelete.error).toContain('Only the document owner');

    const successDelete = documentStore.deleteDocument(doc.id, alex.id);
    expect(successDelete.success).toBe(true);
  });

  it('filters documents correctly by owned vs shared', () => {
    // Sarah's view
    const sarahOwned = documentStore.getDocuments(sarah.id, 'owned');
    const sarahShared = documentStore.getDocuments(sarah.id, 'shared');

    expect(sarahOwned.every((d) => d.ownerId === sarah.id)).toBe(true);
    expect(sarahShared.every((d) => d.ownerId !== sarah.id && d.collaborators.some((c) => c.userId === sarah.id))).toBe(true);
  });
});
