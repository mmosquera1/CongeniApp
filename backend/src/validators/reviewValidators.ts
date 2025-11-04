import Joi from 'joi';

export const createReviewSchema = Joi.object({
  buildingId: Joi.string().required(),
  type: Joi.string().valid('noise', 'neighbor', 'amenity', 'green-space', 'general').required(),
  title: Joi.string().max(120).required(),
  body: Joi.string().max(2000).required(),
  rating: Joi.number().min(1).max(5).required(),
  images: Joi.array().items(Joi.string().uri()).max(3).default([])
});

export const rateReviewSchema = Joi.object({
  value: Joi.number().valid(-1, 1).required()
});
