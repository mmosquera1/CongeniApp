import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from '../config/firebase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { createListingSchema, updateListingStatusSchema } from '../validators/listingValidators';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { buildingId, status = 'active', limit = '20' } = req.query;
    let query = firestore().collection('listings').where('status', '==', status);

    if (buildingId) {
      query = query.where('buildingId', '==', buildingId);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(Number(limit)).get();
    const listings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(listings);
  } catch (error) {
    console.error('List listings error', error);
    return res.status(500).json({ message: 'Error al listar publicaciones' });
  }
});

router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { error, value } = createListingSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({ message: 'Datos inválidos', details: error.details });
  }

  try {
    const uid = req.userUid as string;
    const docRef = await firestore().collection('listings').add({
      ...value,
      sellerId: uid,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    await firestore().collection('buildings').doc(value.buildingId).set(
      {
        stats: {
          listingCount: FieldValue.increment(1)
        }
      },
      { merge: true }
    );

    return res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error('Create listing error', err);
    return res.status(500).json({ message: 'Error al crear publicación' });
  }
});

router.patch('/:listingId/status', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { error, value } = updateListingStatusSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: 'Estado inválido', details: error.details });
  }

  const { listingId } = req.params;
  const uid = req.userUid as string;

  try {
    const listingRef = firestore().collection('listings').doc(listingId);
    const snapshot = await listingRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }

    const listing = snapshot.data() as { sellerId: string };
    if (listing.sellerId !== uid) {
      return res.status(403).json({ message: 'No tienes permisos para editar esta publicación' });
    }

    await listingRef.set(
      {
        status: value.status,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return res.json({ message: 'Estado actualizado' });
  } catch (err) {
    console.error('Update listing status error', err);
    return res.status(500).json({ message: 'Error al actualizar publicación' });
  }
});

export default router;
