import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from '../config/firebase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { createServiceSchema, rateServiceSchema } from '../validators/serviceValidators';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { buildingId, neighborhoodId, category, limit = '20' } = req.query;
    let query = firestore().collection('services');

    if (buildingId) {
      query = query.where('buildingId', '==', buildingId);
    }

    if (neighborhoodId) {
      query = query.where('neighborhoodId', '==', neighborhoodId);
    }

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.orderBy('averageRating', 'desc').limit(Number(limit)).get();
    const services = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(services);
  } catch (error) {
    console.error('List services error', error);
    return res.status(500).json({ message: 'Error al listar servicios' });
  }
});

router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { error, value } = createServiceSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({ message: 'Datos inválidos', details: error.details });
  }

  try {
    const uid = req.userUid as string;
    const docRef = await firestore().collection('services').add({
      ...value,
      createdBy: uid,
      averageRating: 0,
      ratingCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    return res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error('Create service error', err);
    return res.status(500).json({ message: 'Error al crear servicio' });
  }
});

router.post('/:serviceId/rate', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { error, value } = rateServiceSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({ message: 'Datos inválidos', details: error.details });
  }

  const { serviceId } = req.params;
  const uid = req.userUid as string;
  const { value: ratingValue, comment } = value;

  try {
    const db = firestore();
    const serviceRef = db.collection('services').doc(serviceId);
    const ratingRef = serviceRef.collection('ratings').doc(uid);

    await db.runTransaction(async (transaction) => {
      const serviceSnap = await transaction.get(serviceRef);
      if (!serviceSnap.exists) {
        throw new Error('Service not found');
      }

      const serviceData = serviceSnap.data() as { ratingCount: number; averageRating: number };
      const existing = await transaction.get(ratingRef);

      if (existing.exists) {
        const currentValue = existing.data()?.value as number;

        transaction.update(ratingRef, {
          value: ratingValue,
          comment,
          updatedAt: FieldValue.serverTimestamp()
        });

        const totalScore = serviceData.averageRating * serviceData.ratingCount - currentValue + ratingValue;
        transaction.update(serviceRef, {
          averageRating: totalScore / serviceData.ratingCount,
          updatedAt: FieldValue.serverTimestamp()
        });
      } else {
        const newCount = serviceData.ratingCount + 1;
        const totalScore = serviceData.averageRating * serviceData.ratingCount + ratingValue;

        transaction.set(ratingRef, {
          userId: uid,
          value: ratingValue,
          comment,
          createdAt: FieldValue.serverTimestamp()
        });

        transaction.update(serviceRef, {
          ratingCount: newCount,
          averageRating: totalScore / newCount,
          updatedAt: FieldValue.serverTimestamp()
        });
      }
    });

    return res.json({ message: 'Valoración guardada' });
  } catch (err) {
    console.error('Rate service error', err);
    const isNotFound = err instanceof Error && err.message === 'Service not found';
    return res.status(isNotFound ? 404 : 500).json({
      message: isNotFound ? 'Servicio no encontrado' : 'Error al valorar el servicio'
    });
  }
});

export default router;
