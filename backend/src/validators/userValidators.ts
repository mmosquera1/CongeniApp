import Joi from 'joi';

export const registerUserSchema = Joi.object({
  fullName: Joi.string().min(3).max(120).required(),
  email: Joi.string().email().required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    province: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required()
  }).required(),
  unitNumber: Joi.string().max(50).required(),
  phoneNumber: Joi.string().min(6).max(20).required(),
  displayUnit: Joi.string().max(120).required(),
  geoPoint: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }).optional(),
  buildingId: Joi.string().required(),
  verificationMethod: Joi.string().valid('geo', 'document').required()
});

export const verificationDocSchema = Joi.object({
  type: Joi.string().valid('dni', 'lease', 'utility').required()
});
