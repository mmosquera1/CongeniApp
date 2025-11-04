import Joi from 'joi';

export const createListingSchema = Joi.object({
  buildingId: Joi.string().required(),
  title: Joi.string().max(120).required(),
  description: Joi.string().max(1000).required(),
  price: Joi.number().positive().precision(2).required(),
  currency: Joi.string().length(3).required(),
  condition: Joi.string().valid('new', 'used').required(),
  imageUrls: Joi.array().items(Joi.string().uri()).max(6).default([])
});

export const updateListingStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'reserved', 'sold').required()
});
