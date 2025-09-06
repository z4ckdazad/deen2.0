import Joi from 'joi';

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }
    
    next();
  };
};

// Validation schemas
export const validationSchemas = {
  // User registration
  register: Joi.object({
    fullName: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name cannot exceed 100 characters',
        'any.required': 'Full name is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'any.required': 'Password is required'
      }),
    role: Joi.string()
      .valid('student', 'imaam', 'admin')
      .required()
      .messages({
        'any.only': 'Role must be either student, imaam, or admin',
        'any.required': 'Role is required'
      }),
    islamicProfile: Joi.string()
      .valid(
        'student',
        'hafiz',
        'mufti',
        'islamic scholar',
        'qari',
        'imam',
        'islamic teacher',
        'religious counselor',
        'other'
      )
      .required()
      .messages({
        'any.only': 'Invalid Islamic profile selected',
        'any.required': 'Islamic profile is required'
      }),
    bio: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Bio cannot exceed 500 characters'
      })
  }),

  // User login
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  // Update profile
  updateProfile: Joi.object({
    fullName: Joi.string()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name cannot exceed 100 characters'
      }),
    bio: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Bio cannot exceed 500 characters'
      }),
    islamicProfile: Joi.string()
      .valid(
        'student',
        'hafiz',
        'mufti',
        'islamic scholar',
        'qari',
        'imam',
        'islamic teacher',
        'religious counselor',
        'other'
      )
      .messages({
        'any.only': 'Invalid Islamic profile selected'
      }),
    specializations: Joi.array()
      .items(Joi.string().trim())
      .max(10)
      .messages({
        'array.max': 'Cannot have more than 10 specializations'
      }),
    experience: Joi.number()
      .min(0)
      .max(100)
      .messages({
        'number.min': 'Experience cannot be negative',
        'number.max': 'Experience cannot exceed 100 years'
      }),
    location: Joi.object({
      country: Joi.string().max(100),
      city: Joi.string().max(100),
      timezone: Joi.string().max(50)
    }),
    socialLinks: Joi.object({
      website: Joi.string().uri().allow(''),
      facebook: Joi.string().uri().allow(''),
      twitter: Joi.string().uri().allow(''),
      instagram: Joi.string().uri().allow(''),
      youtube: Joi.string().uri().allow('')
    })
  }),

  // Create post
  createPost: Joi.object({
    content: Joi.string()
      .min(1)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Post content cannot be empty',
        'string.max': 'Post content cannot exceed 2000 characters',
        'any.required': 'Post content is required'
      }),
    type: Joi.string()
      .valid('general', 'question', 'announcement', 'lesson', 'inspiration')
      .default('general')
      .messages({
        'any.only': 'Invalid post type'
      }),
    tags: Joi.array()
      .items(Joi.string().trim().max(50))
      .max(10)
      .messages({
        'array.max': 'Cannot have more than 10 tags'
      }),
    visibility: Joi.string()
      .valid('public', 'followers', 'private')
      .default('public')
      .messages({
        'any.only': 'Invalid visibility setting'
      }),
    lessonInfo: Joi.object({
      title: Joi.string().max(200),
      duration: Joi.number().min(1).max(1440), // max 24 hours
      difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced'),
      topics: Joi.array().items(Joi.string().trim())
    }).when('type', {
      is: 'lesson',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  // Create comment
  createComment: Joi.object({
    content: Joi.string()
      .min(1)
      .max(500)
      .required()
      .messages({
        'string.min': 'Comment content cannot be empty',
        'string.max': 'Comment content cannot exceed 500 characters',
        'any.required': 'Comment content is required'
      }),
    parentComment: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .allow(null)
      .messages({
        'string.pattern.base': 'Invalid parent comment ID'
      })
  }),

  // Connection request
  connectionRequest: Joi.object({
    recipientId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid recipient ID',
        'any.required': 'Recipient ID is required'
      }),
    type: Joi.string()
      .valid('student-teacher', 'peer', 'mentor-mentee')
      .required()
      .messages({
        'any.only': 'Invalid connection type',
        'any.required': 'Connection type is required'
      }),
    message: Joi.string()
      .max(200)
      .allow('')
      .messages({
        'string.max': 'Message cannot exceed 200 characters'
      })
  }),

  // Search parameters
  search: Joi.object({
    q: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Search query cannot be empty',
        'string.max': 'Search query cannot exceed 100 characters',
        'any.required': 'Search query is required'
      }),
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      })
  }),

  // Pagination parameters
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      })
  })
};

// Query parameter validation
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors: errorMessage
      });
    }
    
    next();
  };
};

// Params validation
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Parameter validation error',
        errors: errorMessage
      });
    }
    
    next();
  };
};
