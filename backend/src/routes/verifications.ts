import { Router } from 'express';
import multer from 'multer';
import { FieldValue } from 'firebase-admin/firestore';
import { storage, firestore } from '../config/firebase';
import { authMiddleware, AuthenticatedRequest, adminOnly } from '../middleware/auth';
import { verificationDocSchema } from '../validators/userValidators';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/documents', authMiddleware, upload.single('document'), async (req: AuthenticatedRequest, res) => {
  const { error } = verificationDocSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: 'Tipo de documento inválido', details: error.details });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Debes adjuntar un archivo' });
  }

  try {
    const bucket = storage().bucket();
    const userId = req.userUid as string;
    const safeName = req.file.originalname.replace(/\s+/g, '_');
    const objectPath = `verificationDocs/${userId}/${Date.now()}-${safeName}`;

    await bucket.file(objectPath).save(req.file.buffer, {
      contentType: req.file.mimetype,
      metadata: {
        firebaseStorageDownloadTokens: userId
      }
    });

    const docUrl = `gs://${bucket.name}/${objectPath}`;

    const verificationRef = firestore().collection('verifications').doc(userId);
    await verificationRef.set(
      {
        method: 'document',
        status: 'pending',
        userId,
        documents: FieldValue.arrayUnion({
          type: req.body.type,
          fileUrl: docUrl,
          uploadedAt: FieldValue.serverTimestamp()
        }),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return res.status(201).json({ message: 'Documento cargado correctamente', fileUrl: docUrl });
  } catch (err) {
    console.error('Upload verification doc error', err);
    return res.status(500).json({ message: 'Error al subir el documento' });
  }
});

router.patch('/:userId/status', authMiddleware, adminOnly, async (req: AuthenticatedRequest, res) => {
  const { userId } = req.params;
  const { status } = req.body as { status: 'approved' | 'rejected' };

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  try {
    const db = firestore();
    await db.collection('verifications').doc(userId).set(
      {
        status,
        reviewedBy: req.userUid,
        reviewedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    await db.collection('users').doc(userId).set(
      {
        verificationStatus: status
      },
      { merge: true }
    );

    return res.json({ message: 'Estado actualizado' });
  } catch (error) {
    console.error('Update verification status error', error);
    return res.status(500).json({ message: 'Error al actualizar el estado de verificación' });
  }
});

export default router;
