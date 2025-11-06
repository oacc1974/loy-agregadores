const Joi = require('joi');

// Validación de configuración de Uber
exports.validateUberConfig = (data) => {
  const schema = Joi.object({
    storeId: Joi.string().required(),
    clientId: Joi.string().required(),
    clientSecret: Joi.string().required(),
    settings: Joi.object({
      autoSync: Joi.boolean(),
      syncInterval: Joi.number().min(1).max(60),
      syncOrders: Joi.boolean(),
      syncMenu: Joi.boolean(),
      syncInventory: Joi.boolean()
    })
  });

  return schema.validate(data);
};

// Validación de configuración de Loyverse
exports.validateLoyverseConfig = (data) => {
  const schema = Joi.object({
    accessToken: Joi.string().required(),
    storeId: Joi.string().required(),
    posId: Joi.string().allow(''),
    settings: Joi.object({
      defaultTaxRate: Joi.number().min(0).max(100),
      defaultPaymentType: Joi.string(),
      employeeId: Joi.string().allow('')
    })
  });

  return schema.validate(data);
};

// Validación de orden
exports.validateOrder = (data) => {
  const schema = Joi.object({
    aggregatorType: Joi.string().valid('uber', 'rappi', 'pedidosya').required(),
    aggregatorOrderId: Joi.string().required(),
    orderData: Joi.object({
      orderNumber: Joi.string().required(),
      customer: Joi.object({
        name: Joi.string(),
        phone: Joi.string(),
        address: Joi.string()
      }),
      items: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required(),
        modifiers: Joi.array().items(Joi.object({
          name: Joi.string(),
          price: Joi.number()
        }))
      })).min(1).required(),
      subtotal: Joi.number().min(0).required(),
      tax: Joi.number().min(0),
      deliveryFee: Joi.number().min(0),
      total: Joi.number().min(0).required(),
      paymentMethod: Joi.string().required(),
      orderTime: Joi.date().required(),
      deliveryTime: Joi.date()
    }).required()
  });

  return schema.validate(data);
};
