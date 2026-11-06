import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ResQLink Full-Stack Tactical API',
    version: '1.0.0',
    description: 'Emergency Responder Social Network, Incident Coordination Platform & Two-Way Pager Ecosystem API Specification',
    contact: {
      name: 'ResQLink Engineering Team',
      email: 'ops@resqlink.org'
    }
  },
  servers: [
    {
      url: 'http://localhost:4000/api',
      description: 'Development Tactical Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new verified responder or volunteer',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  callsign: { type: 'string' },
                  badgeNumber: { type: 'string' },
                  organizationName: { type: 'string' },
                  role: { type: 'string', enum: ['COMMANDER', 'OFFICER', 'PARAMEDIC', 'SPECIALIST', 'OPERATOR', 'VOLUNTEER'] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Responder registered successfully.' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate responder and obtain tactical JWT',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Authentication token issued.' }
        }
      }
    },
    '/posts': {
      get: {
        summary: 'Get responder social network feed (SITREPs, training, alerts)',
        tags: ['Social Network'],
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['SITREP', 'TRAINING', 'INCIDENT_DISPATCH', 'SAFETY_BULLETIN', 'EQUIPMENT', 'GENERAL'] } }
        ],
        responses: {
          200: { description: 'List of feed items.' }
        }
      },
      post: {
        summary: 'Publish new SITREP or field update',
        tags: ['Social Network'],
        security: [{ BearerAuth: [] }],
        responses: {
          201: { description: 'Post published.' }
        }
      }
    },
    '/incidents': {
      get: {
        summary: 'List active Incident Command rooms',
        tags: ['Incident Management'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'List of incidents.' }
        }
      },
      post: {
        summary: 'Establish a new Incident Command room (Commander/Officer role required)',
        tags: ['Incident Management'],
        security: [{ BearerAuth: [] }],
        responses: {
          201: { description: 'Incident room activated.' }
        }
      }
    },
    '/incidents/join': {
      post: {
        summary: 'Join an active Incident Room using 6-character Join Code',
        tags: ['Incident Management'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  joinCode: { type: 'string', example: 'FIRE91' },
                  icsRole: { type: 'string', example: 'FIELD_RESPONDER' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Successfully joined room.' }
        }
      }
    },
    '/pager/devices': {
      get: {
        summary: 'Get all registered Two-Way Pagers and real-time telemetry',
        tags: ['Pager Network'],
        responses: {
          200: { description: 'List of registered hardware pagers and telemetry.' }
        }
      }
    },
    '/pager/alerts/dispatch': {
      post: {
        summary: 'Dispatch high-priority Two-Way Pager alert',
        tags: ['Pager Network'],
        security: [{ BearerAuth: [] }],
        responses: {
          201: { description: 'Pager alert transmitted.' }
        }
      }
    },
    '/pager/alerts/acknowledge': {
      post: {
        summary: 'Record two-way physical responder acknowledgement (10-4, En Route, On Scene, Unable, SOS)',
        tags: ['Pager Network'],
        responses: {
          200: { description: 'Acknowledgement recorded.' }
        }
      }
    }
  }
};

export function setupSwagger(app: Express): void {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { background-color: #0A192F; } .swagger-ui .info { margin: 20px 0; }',
    customSiteTitle: 'ResQLink Tactical API Documentation'
  }));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));
}

