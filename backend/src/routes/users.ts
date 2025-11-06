import { Router } from 'express';
import { FieldValue, GeoPoint } from 'firebase-admin/firestore';
import { firestore } from '../config/firebase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { registerUserSchema } from '../validators/userValidators';
import { geocodeAddress, isWithinRadius } from '../utils/geocode';

const router = Router();

router.post('/register', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { error, value } = registerUserSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({ message: 'Invalid payload', details: error.details });
  }

  const {
    fullName,
    email,
    address,
    unitNumber,
    phoneNumber,
    displayUnit,
    geoPoint,
    buildingId,
    verificationMethod
  } = value;

  const uid = req.userUid as string;

  try {
    const db = firestore();
    const buildingRef = db.collection('buildings').doc(buildingId);
    const buildingSnap = await buildingRef.get();

    if (!buildingSnap.exists) {
      return res.status(404).json({ message: 'Building not found' });
    }

    const buildingData = buildingSnap.data() as { geoPoint: FirebaseFirestore.GeoPoint; radiusMeters?: number };
    const radius = buildingData.radiusMeters ?? 50;

    let resolvedGeoPoint = geoPoint;
    if (verificationMethod === 'geo') {
      if (!resolvedGeoPoint) {
        const formatted = `${address.street}, ${address.city}, ${address.province}, ${address.country}`;
        const geocoded = await geocodeAddress(formatted);

        if (!geocoded) {
          return res.status(422).json({ message: 'No se pudo geolocalizar la dirección ingresada' });
        }

        resolvedGeoPoint = { lat: geocoded.lat, lng: geocoded.lng };
      }

      const buildingGeo = buildingData.geoPoint;
      const withinRadius = isWithinRadius(
        { lat: buildingGeo.latitude, lng: buildingGeo.longitude },
        resolvedGeoPoint,
        radius
      );

      if (!withinRadius) {
        return res.status(422).json({
          message: 'La dirección se encuentra fuera del radio permitido (50 metros)',
          code: 'outside_radius'
        });
      }
    }

    const userRef = db.collection('users').doc(uid);

    await userRef.set(
      {
        fullName,
        email,
        address,
        unitNumber,
        phoneNumber,
        displayUnit,
        buildingId,
        geoPoint: resolvedGeoPoint ? new GeoPoint(resolvedGeoPoint.lat, resolvedGeoPoint.lng) : null,
        verificationStatus: verificationMethod === 'geo' ? 'approved' : 'pending',
        verificationMethod,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    await userRef.collection('publicProfile').doc('public').set({
      displayUnit,
      buildingId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    if (verificationMethod === 'geo') {
      await db.collection('verifications').doc(uid).set({
        userId: uid,
        method: 'geo',
        status: 'approved',
        geoAttempt: resolvedGeoPoint
          ? {
              lat: resolvedGeoPoint.lat,
              lng: resolvedGeoPoint.lng,
              accuracyMeters: radius,
              requestedAt: new Date().toISOString()
            }
          : null,
        updatedAt: FieldValue.serverTimestamp()
      });
    } else {
      await db.collection('verifications').doc(uid).set({
        userId: uid,
        method: 'document',
        status: 'pending',
        documents: [],
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    return res.status(201).json({ message: 'Perfil registrado correctamente' });
  } catch (err) {
    console.error('Register user error', err);
    return res.status(500).json({ message: 'Error interno al registrar usuario' });
  }
});

router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.userUid as string;
    const snap = await firestore().collection('users').doc(uid).get();

    if (!snap.exists) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }

    const data = snap.data();
    return res.json({
      ...data,
      geoPoint: data?.geoPoint
        ? { lat: data.geoPoint.latitude, lng: data.geoPoint.longitude }
        : null
    });
  } catch (error) {
    console.error('Get profile error', error);
    return res.status(500).json({ message: 'Error al obtener el perfil' });
  }
});

router.get('/public/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const snap = await firestore()
      .collection('users')
      .doc(userId)
      .collection('publicProfile')
      .doc('public')
      .get();

    if (!snap.exists) {
      return res.status(404).json({ message: 'Perfil público no encontrado' });
    }

    return res.json(snap.data());
  } catch (error) {
    console.error('Get public profile error', error);
    return res.status(500).json({ message: 'Error al obtener el perfil público' });
  }
});

export default router;
