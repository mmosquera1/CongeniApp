import { Router } from 'express';
import { FieldValue, Query } from 'firebase-admin/firestore';
import { firestore } from '../config/firebase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { createReviewSchema, rateReviewSchema } from '../validators/reviewValidators';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { buildingId, type, limit = '10' } = req.query;
    let query: Query = firestore().collection('reviews');

    if (buildingId) {
      query = query.where('buildingId', '==', buildingId);
    }

    if (type) {
      query = query.where('type', '==', type);
    }

    query = query.orderBy('createdAt', 'desc').limit(Number(limit));
    const snapshot = await query.get();

    const reviews = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? null
      };
    });

    return res.json(reviews);
  } catch (error) {
    console.error('List reviews error', error);
    return res.status(500).json({ message: 'Error al listar reseñas' });
  }
});

router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { error, value } = createReviewSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({ message: 'Datos inválidos', details: error.details });
  }

  try {
    const { buildingId, type, title, body, rating, images } = value;
    const uid = req.userUid as string;
    const db = firestore();
    const userSnap = await db.collection('users').doc(uid).get();

    if (!userSnap.exists) {
      return res.status(403).json({ message: 'Debes completar tu perfil antes de crear reseñas' });
    }

    const userData = userSnap.data() as { displayUnit: string };

    const reviewRef = await db.collection('reviews').add({
      buildingId,
      authorId: uid,
      type,
      title,
      body,
      rating,
      images,
      helpfulCount: 0,
      notHelpfulCount: 0,
      visibilityUnit: userData.displayUnit,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    await db.collection('buildings').doc(buildingId).set(
      {
        stats: {
          reviewCount: FieldValue.increment(1)
        }
      },
      { merge: true }
    );

    return res.status(201).json({ id: reviewRef.id });
  } catch (err) {
    console.error('Create review error', err);
    return res.status(500).json({ message: 'Error al crear la reseña' });
  }
});

router.post('/:reviewId/rate', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { error, value } = rateReviewSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: 'Valoración inválida', details: error.details });
  }

  const { reviewId } = req.params;
  const uid = req.userUid as string;
  const { value: voteValue } = value;

  try {
    const db = firestore();
    const reviewRef = db.collection('reviews').doc(reviewId);
    const ratingRef = reviewRef.collection('ratings').doc(uid);

    await db.runTransaction(async (transaction) => {
      const reviewSnap = await transaction.get(reviewRef);
      if (!reviewSnap.exists) {
        throw new Error('Review not found');
      }

      const existingRating = await transaction.get(ratingRef);

      if (existingRating.exists) {
        const currentValue = existingRating.data()?.value as number;
        if (currentValue === voteValue) {
          return;
        }

        transaction.update(ratingRef, { value: voteValue, updatedAt: FieldValue.serverTimestamp() });
        transaction.update(reviewRef, {
          helpfulCount: FieldValue.increment(
            (voteValue === 1 ? 1 : 0) - (currentValue === 1 ? 1 : 0)
          ),
          notHelpfulCount: FieldValue.increment(
            (voteValue === -1 ? 1 : 0) - (currentValue === -1 ? 1 : 0)
          )
        });
      } else {
        transaction.set(ratingRef, {
          userId: uid,
          value: voteValue,
          createdAt: FieldValue.serverTimestamp()
        });

        transaction.update(reviewRef, {
          helpfulCount: FieldValue.increment(voteValue === 1 ? 1 : 0),
          notHelpfulCount: FieldValue.increment(voteValue === -1 ? 1 : 0)
        });
      }
    });

    return res.json({ message: 'Valoración registrada' });
  } catch (err) {
    console.error('Rate review error', err);
    const message = err instanceof Error && err.message === 'Review not found'
      ? 'Reseña no encontrada'
      : 'Error al valorar la reseña';
    const status = err instanceof Error && err.message === 'Review not found' ? 404 : 500;
    return res.status(status).json({ message });
  }
});

export default router;
