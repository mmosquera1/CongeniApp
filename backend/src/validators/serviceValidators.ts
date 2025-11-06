import Joi from 'joi';

export const createServiceSchema = Joi.object({
  buildingId: Joi.string().optional(),
  neighborhoodId: Joi.string().optional(),
  category: Joi.string().required(),
  name: Joi.string().max(120).required(),
  description: Joi.string().max(1000).required(),
  contact: Joi.object({
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    url: Joi.string().uri().optional()
  }).default({}),
  tags: Joi.array().items(Joi.string()).max(10).default([])
});

export const rateServiceSchema = Joi.object({
  value: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500).allow('').default('')
});
